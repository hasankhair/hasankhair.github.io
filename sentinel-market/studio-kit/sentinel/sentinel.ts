// Sentinel: picks a worker by reputation, escrows via ERC-8183, verifies, settles.
import { readFileSync, writeFileSync } from "node:fs";
import { loadEnv, EVMWalletProvider, ERC8183Client, JobStatus } from "@bnbagent/sdk";

loadEnv();
type Worker = { name: string; address: string; url: string; price: string; rep: number };
const workers: Worker[] = JSON.parse(readFileSync("workers.json", "utf8"));
const task = process.argv[2] ?? "Rug-pull scan on 0x0000000000000000000000000000000000000000";
const PASS = 55; // verifier threshold (0-100), like the demo slider
const sleep = (s: number) => new Promise((r) => setTimeout(r, s * 1000));

// ---------- adapter: seller transport (verify against each agent card) ----------
async function rpc(w: Worker, method: string, params: unknown) {
  const res = await fetch(`${w.url}/`, { // A2A JSON-RPC base; confirm path in /.well-known/agent.json
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
  });
  if (!res.ok) throw new Error(`${w.name} ${method} -> HTTP ${res.status}`);
  return (await res.json()).result;
}
const negotiate = (w: Worker) => rpc(w, "negotiate", { task });                 // returns signed quote
const notifyFunded = (w: Worker, jobId: bigint) => rpc(w, "notify_funded", { jobId: jobId.toString() });
const fetchDeliverable = async (w: Worker, jobId: bigint) => rpc(w, "get_deliverable", { jobId: jobId.toString() });
// -------------------------------------------------------------------------------

// Verifier: replace with a real check (schema, evidence links, second-opinion LLM).
function verify(d: any): number {
  const text = JSON.stringify(d ?? "");
  let s = 0;
  if (/risk/i.test(text)) s += 40;
  if (/0x[0-9a-fA-F]{6,}/.test(text)) s += 30;   // cites on-chain evidence
  if (text.length > 200) s += 30;
  return s;
}
async function rejectJob(_client: ERC8183Client, jobId: bigint) {
  // TODO: dispute/reject per typescript/examples/client (dispute-reject flow).
  console.log(`✖ would reject/dispute job ${jobId} here`);
}

const wallet = new EVMWalletProvider({
  password: process.env.WALLET_PASSWORD!, privateKey: process.env.PRIVATE_KEY,
});
const client = await ERC8183Client.create({ walletProvider: wallet, network: "bsc-testnet" });

// 1. choose worker by reputation
const w = [...workers].sort((a, b) => b.rep - a.rep)[0];
console.log(`🛡️ selected ${w.name} (rep ${w.rep})`);
console.log("quote:", await negotiate(w));

// 2. create + escrow (ERC-8183)
const decimals = await client.tokenDecimals();
const budget = BigInt(Math.round(parseFloat(w.price) * 10 ** decimals));
const expiredAt = BigInt(Math.floor(Date.now() / 1000)) + (await client.policy.disputeWindow()) + 600n;
const { jobId } = await client.createJob({ provider: w.address as `0x${string}`, expiredAt, description: task });
await client.registerJob(jobId!);
await client.fund(jobId!, budget);
console.log(`🔒 escrow funded, job ${jobId}`);
await notifyFunded(w, jobId!);

// 3. wait for the deliverable
let d: unknown;
for (let i = 0; i < 20 && !d; i++) {
  await sleep(15);
  const job = await client.getJob(jobId!);
  console.log(`status: ${JobStatus[job.status]}`);
  try { d = await fetchDeliverable(w, jobId!); } catch { /* not ready */ }
}

// 4. verify -> settle or reject, then update reputation
const score = verify(d);
if (score >= PASS) {
  console.log(`✔ score ${score}, waiting out the dispute window, then settling`);
  await sleep(Number(await client.policy.disputeWindow()) + 5);
  await client.settle(jobId!);
  w.rep = Math.min(100, w.rep + 3);
} else {
  console.log(`✖ score ${score} < ${PASS}`);
  await rejectJob(client, jobId!);
  w.rep = Math.max(0, w.rep - 8);
}
writeFileSync("workers.json", JSON.stringify(workers, null, 1));
console.log(`final status: ${JobStatus[(await client.getJob(jobId!)).status]}  ${w.name} rep=${w.rep}`);
