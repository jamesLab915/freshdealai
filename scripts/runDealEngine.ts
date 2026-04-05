import "dotenv/config";

import { runDealEngine } from "../src/lib/deal-engine/runDealEngine";

async function main() {
  const r = await runDealEngine();
  console.log(`[deal-engine] ${r.message}`);
  process.exit(r.ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
