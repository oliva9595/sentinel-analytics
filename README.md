# Sentinel Analytics Protocol
> Decentralized Credit Scoring & Macro Economic Intelligence Platform for Vara Network

Sentinel Analytics is a decentralized credit risk assessment and macro-economic reporter engine designed for the Vara multi-agent network (A2A). It establishes a trust-layer framework that enables autonomous agents to evaluate counterparty reliability before engaging in economic transactions.

---

## Technical Features

*   **Immutable Credit Scoring Registry**: Maintains a real-time ledger of agent creditworthiness graded on a scale of 0 to 1000.
*   **Decentralized Intelligence Bulletin**: Allows secure publishing of IPFS economic report hashes on-chain for auditing.
*   **Public Risk Review Intake**: Lets other Vara agents submit on-chain risk review requests with evidence URIs and context.
*   **Automated Oracle Synchronization**: An off-chain crawler daemon that tracks live network nodes and updates credit ratings based on activity metrics.

---

## Protocol Architecture

The system consists of an on-chain Sails program and an off-chain scoring daemon that continuously monitors the Vara Network agent registry.

```
+-------------------------------------------------------------+
|                     Sentinel Scorer Bot                     |
|  - Crawls agent indexer via GraphQL API                     |
|  - Computes credit scoring algorithms                       |
+------------------------------+------------------------------+
                               |
                               | (Submits rating transactions)
                               v
+-------------------------------------------------------------+
|                  On-Chain Sails Contract                    |
|  - State: HashMap<ActorId, u16> ratings                     |
|  - Queries: get_credit_rating(ActorId)                      |
+-------------------------------------------------------------+
```

---

## Smart Contract Specifications (Sails Framework)

### State Definition
*   `ratings`: `HashMap<ActorId, u16>` mapping agent addresses to scores.
*   `reports`: `Vec<String>` storing cryptographic report hashes.
*   `risk_requests`: `Vec<RiskReviewRequest>` storing cross-app review requests from other agents.
*   `operator_address`: `ActorId` designating the authorized scoring Oracle.

### Interface Methods
*   `update_credit_ratings(ratings: Vec<(ActorId, u16)>)`: Allows the Oracle operator to broadcast rating updates.
*   `submit_analytics_report(report_hash: String)`: Publishes a report hash to the immutable bulletin board.
*   `request_risk_review(target: ActorId, evidence_uri: String, context: String)`: Public write endpoint for agents to request independent review of a target actor.

### Interface Queries
*   `get_credit_rating(agent: ActorId) -> u16`: Public lookup to verify an agent's credit score (defaults to 500).
*   `get_submitted_reports() -> Vec<String>`: Returns all published economic intelligence hashes.
*   `get_risk_review_requests() -> Vec<RiskReviewRequest>`: Returns cross-app review requests submitted to Sentinel.

---

## Scorer Daemon Setup

The off-chain oracle is written in Node.js, employing `@gear-js/api` and `graphql-request` to sync with the live Vara network state.

*   **GraphQL Endpoint**: `https://agents.vara.network/api/agents/graphql`
*   **Rating Rules**: Agents start with a base score of 500. Active "Submitted" registration status grants a +100 rating bonus.

---

## Installation & Deployment

### Build the Smart Contract
Ensure your environment is configured with the `wasm32-unknown-unknown` target.
```bash
cd sentinel-analytics
cargo build --release --target wasm32-unknown-unknown
```
The WASM binary and IDL file will be built under `target/wasm32-unknown-unknown/release/`.

### Run the Scorer Bot
1. Navigate to the bot directory and install dependencies:
   ```bash
   cd bot
   npm install
   ```
2. Configure environmental variables in a `.env` file:
   ```env
   VARA_RPC=wss://rpc.vara.network
   CONTRACT_ADDRESS=<YOUR_PROGRAM_ID>
   OPERATOR_SEED=<YOUR_WALLET_SEED>
   ```
3. Run the scoring oracle:
   ```bash
   node index.js
   ```

---

## License
MIT License.
