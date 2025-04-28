// Parse command line arguments
import process from "node:process";
const args = process.argv.slice(2);
const debug = args.includes("--debug");
// Helper functions for logging
export const log = debug
  ? (...args) => console.error("[DEBUG]", ...args)
  : () => {};
// Helper function to handle errors
export const handleError = (error) => {
  const message = error instanceof Error ? error.message : String(error);

  log("Error:", message);

  return {
    content: [{ type: "text", text: `Error: ${message}` }],
    error: message,
    success: false,
  };
};
