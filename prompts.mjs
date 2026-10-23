import { z } from "zod";

import truish from "@johnhenry/truish";

const generic = () => `# Conversation Summary Generator

You are tasked with creating a comprehensive summary of the current conversation that will serve as instructions for another LLM to continue it seamlessly. The summary should capture essential context without unnecessary details.

Please generate a structured summary with the following sections:

1. **Conversation Overview** - Brief description of what this conversation is about (2-3 sentences)
2. **Key Participants** - Who is involved in the conversation and their roles
3. **Topics Discussed** - Major themes and subjects covered so far
4. **Key Decisions/Conclusions** - Important decisions made or conclusions reached
5. **Current Task Status** - If there's an ongoing task:
   - Description of the task
   - Steps completed so far
   - Steps remaining
   - Any blockers or challenges
6. **Important Context** - Any critical background information needed
7. **Tone and Style Notes** - How the conversation has been conducted (formal, technical, casual, etc.)

Format this summary in a clear, structured way using markdown with optional TOML front matter. Use appropriate formatting elements like:
- Checklists for tasks
- Tables for organized information
- Mermaid diagrams for visualizing relationships or processes
- Code blocks for any technical content

once you have created this summary, please save it using the 'leave_off' tool so that another llm can pick up where you left off`;

/**
 * Generates a conversation summary prompt based on project type and options
 * @param {Object} options - Configuration options
 * @param {string} options.projectType - Type of project (technical, creative, problem-solving, or general)
 * @param {string} options.includeMermaid - Whether to include Mermaid diagram instructions
 * @param {string} options.includeCode - Whether to include code block instructions
 * @param {string} options.includeTasks - Whether to include task tracking instructions
 * @param {Object} options.customFields - Additional custom fields for TOML front matter
 * @returns {string} - The generated prompt
 */
const generateConversationSummaryPrompt = (options = {}) => {
  // Set defaults
  options.includeCode = truish(options.includeCode);
  options.includeMermaid = truish(options.includeMermaid);
  options.includeTasks = truish(options.includeTasks);
  const {
    projectType = "general",
    includeMermaid = true,
    includeCode = true,
    includeTasks = true,
    customFields = {},
  } = options;

  // Base prompt that's common to all types
  let basePrompt = `# Conversation Summary Generator

You are tasked with creating a comprehensive summary of the current conversation that will serve as instructions for another LLM to continue it seamlessly. The summary should capture essential context without unnecessary details.

Please generate a structured summary with the following sections if applicable. You may omitt sections that are not relevant to the conversation:

1. **Conversation Overview** - Brief description of what this conversation is about (2-3 sentences)
2. **Key Participants** - Who is involved in the conversation and their roles
3. **Topics Discussed** - Major themes and subjects covered so far
4. **Key Decisions/Conclusions** - Important decisions made or conclusions reached`;

  // Add task section if requested
  if (includeTasks) {
    basePrompt += `
5. **Current Task Status** - If there's an ongoing task:
   - Description of the task
   - Steps completed so far
   - Steps remaining
   - Any blockers or challenges`;
  }

  basePrompt += `
${
  includeTasks ? "6" : "5"
}. **Important Context** - Any critical background information needed
${
  includeTasks ? "7" : "6"
}. **Tone and Style Notes** - How the conversation has been conducted (formal, technical, casual, etc.)`;

  // Formatting instructions section
  let formattingInstructions = `\nFormat this summary in a clear, structured way using markdown with optional TOML front matter. Use appropriate formatting elements like:`;

  if (includeTasks) {
    formattingInstructions += `\n- Checklists for tasks`;
  }

  formattingInstructions += `\n- Tables for organized information`;

  if (includeMermaid) {
    formattingInstructions += `\n- Mermaid diagrams for visualizing relationships or processes`;
  }

  if (includeCode) {
    formattingInstructions += `\n- Code blocks for any technical content`;
  }

  // TOML front matter generation
  let tomlFrontMatter = `\n\nInclude the following TOML front matter:

---
[conversation]
type = "${projectType}"`;
  // Add custom fields to TOML
  for (const [key, value] of Object.entries(customFields)) {
    if (Array.isArray(value)) {
      tomlFrontMatter += `\n${key} = ${JSON.stringify(value)}`;
    } else if (typeof value === "string") {
      tomlFrontMatter += `\n${key} = "${value}"`;
    } else {
      tomlFrontMatter += `\n${key} = ${value}`;
    }
  }

  tomlFrontMatter += `\n---`;

  // Type-specific content
  let typeSpecificContent = "";

  switch (projectType.toLowerCase()) {
    case "technical":
      typeSpecificContent = `\n\n# Technical Conversation Summary

Focus particularly on:
1. **Technical Context** - Programming languages, frameworks, libraries, or systems involved
2. **Problem Definition** - The technical challenge being addressed
3. **Approach So Far** - Solution approaches discussed or attempted
4. **Code Progress** - Summary of any code written or shared
5. **Technical Decisions** - Architecture or implementation decisions made
6. **Resources Shared** - Links, documentation, or other resources mentioned
7. **Outstanding Issues** - Technical questions or challenges that remain unresolved`;
      break;

    case "creative":
      typeSpecificContent = `\n\n# Creative Conversation Summary

Focus particularly on:
1. **Creative Brief** - The creative project or challenge being addressed
2. **Ideas Generated** - Key ideas that have been discussed
3. **Themes & Inspirations** - Recurring themes or sources of inspiration
4. **Constraints & Requirements** - Any limitations or must-haves for the creative work
5. **Selected Directions** - Ideas that received positive feedback or were selected for further development
6. **Next Development Steps** - What aspects need further exploration
7. **Creative Decisions** - Stylistic or conceptual decisions already made`;
      break;

    case "problem-solving":
      typeSpecificContent = `\n\n# Problem-Solving Conversation Summary

Focus particularly on:
1. **Problem Statement** - Clear definition of the problem being solved
2. **Context & Background** - Essential information about the situation
3. **Analysis So Far** - How the problem has been analyzed
4. **Solutions Considered** - Options that have been discussed
5. **Evaluation Criteria** - How solutions are being evaluated
6. **Current Direction** - The solution approach currently favored
7. **Implementation Plan** - Steps identified for executing the solution
8. **Open Questions** - Unresolved issues that need addressing`;
      break;

    default: // general type
      // We'll use the base prompt for general type
      break;
  }

  // Final note
  const finalNote = `\n\nThis summary will be passed to another LLM with no shared context, so ensure it contains all necessary information to continue the conversation effectively. Please pass this off to the 'leave_off' tool and print the id so that it can be used to continue the conversation later.`;

  // Combine all parts
  return [
    basePrompt,
    formattingInstructions,
    tomlFrontMatter,
    typeSpecificContent,
    finalNote,
  ].join("\n");
};

export const leave_off = [
  "💾 Save", // name of the prompt
  "Prompt to produce save instructions", // description of the prompt
  {
    projectType: z
      .string()
      .optional()
      .default("general")
      .describe("project format: general|technical|createive|problem-solving"), // tool schema
    includeMermaid: z
      .string()
      .optional()
      .default("y")
      .describe("include mermaid? y/n"),
    includeCode: z
      .string()
      .optional()
      .default("y")
      .describe("include code? y/n"),
    includeTasks: z
      .string()
      .optional()
      .default("y")
      .describe("include tasks? y/n"),
    customFields: z.object().default({}).optional().describe("custom fields"),
  }, // tool schema
  (options) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: generateConversationSummaryPrompt(options),
        },
      },
    ],
  }),
];

export const pick_up = [
  "📂 Continue", // name of the prompt
  "Prompt to produce instructions to continue from a previous conversation", // description of the prompt
  { id: z.string().describe("identifier") }, // tool schema
  ({ id }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          // instruct model to use the 'continue_from' tool with the provided id
          text: `# Conversation Continuation Instructions
You are tasked with continuing a conversation based on previously saved instructions. Retrieve previous context by using the 'pick_up' using the id: ${id}.`,
        },
      },
    ],
  }),
];

export const resume = [
  "🔄 Resume", // name of the prompt
  "Prompt to load latest context and to continue working with it.", // description of the prompt
  {}, // tool schema
  () => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          // instruct model to use the 'continue_from' tool with the provided id
          text: `# Conversation Continuation Instructions
You are tasked with continuing a conversation based the most recently saved instructions using the 'load_latest_context_item' tool.`,
        },
      },
    ],
  }),
];
