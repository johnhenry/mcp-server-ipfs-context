#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import server from "./index.mjs";
import { log } from "./utility/index.mjs";
import pack from "./package.json" with { type: "json" };
// Handle unexpected errors
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  // Keep the process running despite the error
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  // Keep the process running despite the error
});
try {
  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log(`${pack.name} mcp server started successfully`);
  log(`Server version: ${pack.version}`);
} catch (error) {
  console.error("Fatal error starting server:", error);
  process.exit(1);
}
