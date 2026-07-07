#!/usr/bin/env node
// The API persists users/quotes to a flat JSON file (server/db/data.json)
// with no delete endpoint, so it grows without bound across repeated runs.
// Run `npm run test:reset-db` between automated runs to start clean.
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.resolve(__dirname, "../../server/db/data.json");
const EMPTY_STATE = { users: [], quotes: [], nextUserId: 1, nextQuoteId: 1 };

fs.writeFileSync(DATA_FILE, JSON.stringify(EMPTY_STATE, null, 2));
console.log(`Reset ${DATA_FILE} to a clean state.`);
