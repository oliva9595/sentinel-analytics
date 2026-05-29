# Sentinel Analytics
> **Decentralized Credit Scoring & Economic Intelligence for Vara Network**

Sentinel Analytics is a state-of-the-art, fully decentralized credit scoring and macro-economic reporting engine built for the **Vara A2A Network — Agents Arena Season 1 Hackathon**. By combining high-performance on-chain smart contracts with a real-time off-chain crawler daemon, Sentinel Analytics provides the trust and risk assessment foundation required for secure agent-to-agent (A2A) economic interactions.

---

## 🌟 Key Features

*   **On-Chain Credit Scoring Registry**: Real-time immutable record of agent credit ratings (ranging from 0 to 1000) allowing protocols and other agents to assess counterparty risk before transaction execution.
*   **Decentralized Bulletin Board**: A secure repository for publishing IPFS/bulletin economic report hashes on-chain for total transparency.
*   **Automated Off-Chain Credit Scorer**: A Node.js daemon that connects to the live Vara Agent registry, queries active node states, runs statistical rating algorithms, and broadcasts credit updates to the blockchain.

---

## 📐 Architecture Overview

```mermaid
graph TD
    subgraph On-Chain (Sails Contract)
        SC[AnalyticsService Contract] --> State[HashMap ActorId, u16]
        SC --> Reports[Vec String - Report Hashes]
    end
    subgraph Off-Chain (Scorer Daemon)
        Bot[Sentinel Analytics Bot] --> Crawler[GraphQL Registry Crawler]
        Crawler --> |Crawls Live Agents| API[Vara Network GraphQL API]
        Bot --> |Scoring Algorithm| Scorer[Credit Rating Calculator]
        Scorer --> |Submits Ratings| SC
    end
```

---

## ⚙️ Smart Contract Specifications (Sails Framework)

Built on the advanced **Sails Rust Framework**, the contract exposes high-performance methods and queries:

### 1. State
*   `ratings`: `HashMap<ActorId, u16>` mapping Agent actor addresses to credit scores (default: `500`).
*   `reports`: `Vec<String>` containing the cryptographic hashes of published economic intelligence reports.
*   `operator_address`: `ActorId` designating the authorized credit scoring Oracle.

### 2. Service Methods
*   `update_credit_ratings(ratings: Vec<(ActorId, u16)>)`: Allows the authorized Operator/Oracle to push fresh score updates to the blockchain.
*   `submit_analytics_report(report_hash: String)`: Registers a macro-economic report hash for secure auditing.

### 3. Service Queries
*   `get_credit_rating(agent: ActorId) -> u16`: Public query for protocols or agents to verify a counterparty's credit rating.
*   `get_submitted_reports() -> Vec<String>`: Retrieves the list of all registered economic reports.

---

## 🤖 Off-Chain Scorer Daemon

The off-chain engine acts as the credit scoring oracle. It utilizes `@gear-js/api` to connect directly to the Vara Network RPC and `graphql-request` to query the live agent registry indexer.

*   **Endpoint queried**: `https://agents.vara.network/api/agents/graphql`
*   **Formula**: Dynamic weighting score initialized at `500`, adding `+100` bonus points for active "Submitted" status, and logging real-time transaction activity to rank trustworthiness.

---

## 🚀 Quick Start Guide

### Prerequisites
*   Rust (stable toolchain with `wasm32-unknown-unknown` target)
*   Node.js (v18+)

### 1. Build Smart Contract
```bash
# Navigate to the workspace
cd sentinel-analytics

# Build the WASM contract binary
cargo build --release --target wasm32-unknown-unknown
```
The resulting `.wasm` and `.idl` files will be generated in `target/wasm32-unknown-unknown/release/`.

### 2. Install Scorer Bot Dependencies
```bash
cd bot
npm install
```

### 3. Configure and Launch the Bot
Create a `.env` file in the `bot` directory:
```env
VARA_RPC=wss://rpc.vara.network
CONTRACT_ADDRESS=<YOUR_DEPLOYED_PROGRAM_ID>
OPERATOR_SEED=<YOUR_WALLET_SECRET_SEED>
```
Run the daemon:
```bash
node index.js
```

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.
