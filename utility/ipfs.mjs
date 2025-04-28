import { createHelia } from "helia";
import { strings } from "@helia/strings";
import { CID } from "multiformats/cid";

import process from "node:process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
const argv = yargs(hideBin(process.argv))
  .option("gateway", {
    alias: "g",
    type: "array",
    description: "IPFS gateways to use for fetching content",
  })
  .parse();
const DEFAULT_GATEWAYS = [
  "https://ipfs.io",
  "https://dweb.link",
  "https://cf-ipfs.com",
  "https://4everland.io",
];

let GATEWAYS;

if (argv.gateway) {
  if (Array.isArray(argv.gateway)) {
    GATEWAYS = argv.gateway;
  } else {
    GATEWAYS = [argv.gateway];
  }
} else {
  GATEWAYS = DEFAULT_GATEWAYS;
}
// every gateway must start with http or https
if (
  !GATEWAYS.every(
    (gateway) => gateway.startsWith("http://") || gateway.startsWith("https://")
  )
) {
  console.error(
    "Invalid gateway URLs provided. Using default gateways instead."
  );
  GATEWAYS = DEFAULT_GATEWAYS;
}
console.error("Using IPFS gateways:", GATEWAYS.join("\n"));
export async function writeToIpfs(content, options = {}) {
  const { gateways = GATEWAYS, helia } = options;
  const node = helia || (await createHelia());
  const s = strings(node);
  const cid = await s.add(content);
  return cid.toString();
}

export async function readFromIpfs(cidString, options = {}) {
  const { gateways = GATEWAYS, helia } = options;
  const cid = CID.parse(cidString);

  try {
    // Try direct Helia lookup first
    const node = helia || (await createHelia());
    const s = strings(node);
    return await s.get(cid);
  } catch (error) {
    // Fallback to HTTP gateways
    for (const gateway of gateways) {
      try {
        const url = new URL(`ipfs/${cid}`, gateway).toString();
        const response = await fetch(url);

        if (response.ok) {
          return await response.text();
        }
      } catch (gatewayError) {
        continue;
      }
    }
    throw new Error(`Content not found through any gateway for CID: ${cid}`);
  }
}
