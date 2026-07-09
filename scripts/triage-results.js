#!/usr/bin/env node
// Phase 1 of the test-maintenance agent plan: detection + classification,
// no auto-fix yet. Reads Playwright's JSON reporter output and buckets each
// failure into a category so a later "fix agent" (or a human) knows how
// risky it would be to touch. See README.md > "Test-maintenance agents".
const fs = require("fs");
const path = require("path");

const RESULTS_FILE = process.argv[2] || path.resolve(__dirname, "../test-results/results.json");
const TRIAGE_OUT = path.resolve(__dirname, "../test-results/triage.json");

const CATEGORIES = {
  INFRA: "infra",
  SELECTOR_NOT_FOUND: "selector-not-found",
  ASSERTION_MISMATCH: "assertion-mismatch",
  TIMEOUT_NAVIGATION: "timeout-navigation",
  UNKNOWN: "unknown",
};

// Auto-fix is only ever considered safe for pure selector drift - a testid
// got renamed/removed and the page object needs updating to match. Every
// other bucket implies either a real regression or app behavior the agent
// can't safely guess about, so it always goes to a human.
const AUTO_FIXABLE = new Set([CATEGORIES.SELECTOR_NOT_FOUND]);

function classify(message) {
  const m = message || "";

  if (
    /ECONNREFUSED|Could not reach|net::ERR_CONNECTION|webServer|Target page, context or browser has been closed/i.test(m) ||
    /browserType\.launch: Executable doesn't exist|Please run the following command to download new browsers/i.test(m)
  ) {
    return CATEGORIES.INFRA;
  }
  const waitingForLocator = /waiting for (getByTestId|getByRole|getByText|getByLabel|getByPlaceholder|locator|selector)/i.test(m);
  if (
    /element\(s\) not found|resolved to 0 elements|strict mode violation: .* resolved to \d+ elements/i.test(m) ||
    (/Timeout \d+ms exceeded/i.test(m) && waitingForLocator)
  ) {
    return CATEGORIES.SELECTOR_NOT_FOUND;
  }
  if (/Timed out .* waiting for expect/i.test(m) && /Expected:/i.test(m) && /Received:/i.test(m)) {
    return CATEGORIES.ASSERTION_MISMATCH;
  }
  if (/page\.goto|Test timeout of \d+ms exceeded|navigation/i.test(m)) {
    return CATEGORIES.TIMEOUT_NAVIGATION;
  }
  return CATEGORIES.UNKNOWN;
}

function walkSuites(suites, filePath, trail, out) {
  for (const suite of suites) {
    const nextTrail = [...trail, suite.title].filter(Boolean);
    for (const spec of suite.specs || []) {
      if (spec.ok) continue;
      for (const test of spec.tests || []) {
        const lastResult = test.results?.[test.results.length - 1];
        if (!lastResult || lastResult.status === "passed") continue;

        const message = lastResult.error?.message || lastResult.errors?.[0]?.message || "";
        out.push({
          category: classify(message),
          project: test.projectName,
          file: spec.file || filePath,
          title: [...nextTrail, spec.title].join(" > "),
          status: lastResult.status,
          message: message.split("\n")[0],
          location: lastResult.error?.location || null,
        });
      }
    }
    if (suite.suites?.length) {
      walkSuites(suite.suites, filePath, nextTrail, out);
    }
  }
}

function main() {
  if (!fs.existsSync(RESULTS_FILE)) {
    console.error(`No results file at ${RESULTS_FILE}. Run the suite first (e.g. npm test).`);
    process.exit(3);
  }

  const data = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
  const findings = [];
  for (const fileSuite of data.suites || []) {
    walkSuites(fileSuite.suites?.length ? fileSuite.suites : [fileSuite], fileSuite.file, [], findings);
  }

  fs.writeFileSync(TRIAGE_OUT, JSON.stringify({ generatedAt: new Date().toISOString(), findings }, null, 2));

  if (findings.length === 0) {
    console.log("No failures to triage - suite is green.");
    process.exit(0);
  }

  const byCategory = findings.reduce((acc, f) => {
    (acc[f.category] ||= []).push(f);
    return acc;
  }, {});

  console.log(`\n${findings.length} failing test(s) triaged -> ${TRIAGE_OUT}\n`);
  for (const [category, items] of Object.entries(byCategory)) {
    const autoFixable = AUTO_FIXABLE.has(category);
    console.log(`${category} (${items.length})${autoFixable ? " [auto-fixable]" : " [needs human review]"}`);
    for (const item of items) {
      console.log(`  - [${item.project}] ${item.title}`);
      console.log(`      ${item.message}`);
    }
  }

  const needsHuman = findings.some((f) => !AUTO_FIXABLE.has(f.category));
  process.exit(needsHuman ? 1 : 2);
}

main();
