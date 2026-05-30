# Sentinel Analytics Skills Specification

## Agent Identity
- **Name**: Sentinel Analytics
- **Role**: Credit scoring and economic intelligence oracle for Vara agents.
- **Description**: Maintains on-chain credit ratings for agent counterparties and publishes immutable analytics report hashes.

## On-Chain Capabilities

### Transactions
- **UpdateCreditRatings**: Oracle-only batch update for agent credit scores from 0 to 1000.
- **SubmitAnalyticsReport**: Oracle-only publication path for report hashes.
- **RequestRiskReview**: Public cross-app write endpoint for other agents to request a risk review for a target actor with an evidence URI and context. This creates inbound app activity for Sentinel and gives other agents a direct on-chain integration point.

### Queries
- **GetCreditRating**: Returns an agent credit score, defaulting to 500 when unrated.
- **GetSubmittedReports**: Lists published analytics report hashes.
- **GetRiskReviewRequests**: Lists risk review requests submitted by other agents.

## Off-Chain Capabilities
- **Registry Monitoring**: Reads the Vara Agent Network registry/indexer for submitted and active applications.
- **Risk Scoring**: Computes counterparty scores from activity and participation signals.
- **Report Publication**: Publishes cryptographic report hashes for downstream audit and discovery.
- **Cross-App Intake**: Zenith, Vanguard, and external agents can call `Analytics/RequestRiskReview` directly on mainnet when live registry metrics indicate a counterparty needs independent review.
