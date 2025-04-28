import { z } from "zod";

import { handleError } from "./utility/index.mjs";

import { readFromIpfs, writeToIpfs } from "./utility/ipfs.mjs";

let LATEST_IN_MEMORY = "";

export const leaveOff = [
  "leave_off", // name of the tool
  "Save current context and instructions to a persistent storage for another LLM to continue the task later. Creates a unique ID that can be used to retrieve this context.", // description of the tool
  {
    context: z
      .string()
      .describe(
        "Content to save - can include working context, instructions, and current progress"
      ), // tool schema
  },
  async ({ context }) => {
    const trimmedContext = context.trim();
    if (!trimmedContext) {
      return {
        content: [{ type: "text", text: "No context provided" }],
        success: false,
      };
    }
    LATEST_IN_MEMORY = trimmedContext;

    // Sample tool logic
    const id = await writeToIpfs(trimmedContext);
    try {
      const text = `context saved under id: ${id}`;
      return {
        content: [{ type: "text", text }],
        success: true,
      };
    } catch (error) {
      return handleError(error);
    }
  },
];

export const continueFrom = [
  "pick_up", // name of the tool
  "Retrieves previously saved context and instructions using a unique identifier. Allows an LLM to resume work on a task where another left off.", // description of the tool
  {
    id: z
      .string()
      .describe(
        "Unique identifier for the saved context (format: uuid@timestamp)"
      ),
  },
  async ({ id }) => {
    const trimmedId = id.trim();
    if (!trimmedId) {
      return {
        content: [{ type: "text", text: "No id provided" }],
        success: false,
      };
    }
    // Sample tool logic
    try {
      const text = await readFromIpfs(trimmedId);
      return {
        content: [{ type: "text", text }],
        success: true,
      };
    } catch (error) {
      return handleError(error);
    }
  },
];

/* Finds latest context item and loads it
 * combination of list_context_items and pick_up
 */

export const loadLatest = [
  "load_latest_context_item", // name of the tool
  "Retrieves the most recent saved context/instruction set using its unique identifier. Allows an LLM to resume work on a task where another left off.", // description of the tool
  {}, // no input schema
  () => {
    if (LATEST_IN_MEMORY) {
      return {
        content: [{ type: "text", text: LATEST_IN_MEMORY }],
        success: true,
      };
    }
    return {
      content: [
        {
          type: "text",
          text: `No saved contexts found.`,
        },
      ],
      success: true,
    };
  },
];
