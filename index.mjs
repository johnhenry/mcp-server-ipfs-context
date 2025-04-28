#!/usr/bin/env node
import McpDeclarativeServer from "mcp-declarative-server";
import pack from "./package.json" with { type: "json" };
import * as tools from "./tools.mjs";
import * as prompts from "./prompts.mjs";
import * as resources from "./resources.mjs";
const server = new McpDeclarativeServer({
    name: pack.name,
    version: pack.version,
    description: pack.description,
    tools:Object.values(tools),
    prompts:Object.values(prompts),
    resources:Object.values(resources),
})
export default server;