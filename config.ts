import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env") });

export const CLIENT_PORT = process.env.CLIENT_PORT || "5173";
export const SERVER_PORT = process.env.SERVER_PORT || "4000";

export const BASE_URL = process.env.BASE_URL || `http://localhost:${CLIENT_PORT}`;
export const API_URL = process.env.API_URL || `http://localhost:${SERVER_PORT}/api`;

// Playwright resolves relative request paths against baseURL using the
// WHATWG URL constructor, which drops the "/api" segment unless the base
// ends in a trailing slash (and request paths have no leading slash).
export const API_BASE_URL = `${API_URL}/`;

export const SKIP_WEB_SERVER = process.env.SKIP_WEB_SERVER === "1";
