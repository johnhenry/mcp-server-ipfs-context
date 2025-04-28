// import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

// export const staticResource = [
//   "schema",
//   "schema://main",
//   async (uri) => {
//     return {
//       contents: [
//         {
//           uri: uri.href,
//           text: "STATIC",
//         },
//       ],
//     };
//   },
// ];

// const availableResources = () => ({
//   resources: [
//     {
//       uri: "greeting://jimmy",
//       name: "Jimmy's greeting",
//       description: "A greeting  for Jimmy",
//       mimeType: "text/plain",
//     },
//     {
//       uri: "greeting://sally",
//       name: "Sally's greeting",
//       description: "A greeting for Sally",
//       mimeType: "text/plain",
//     },
//   ],
// });

// export const dynamicReource = [
//   "dynamic_resource_name", // name of the resource
//   new ResourceTemplate("greeting://{name}", { list: availableResources }),
//   async (uri, { name }) => ({
//     contents: [
//       {
//         uri: uri.href,
//         text: `Hello, ${name}!`,
//       },
//     ],
//   }),
// ];
