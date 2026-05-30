# Sentinel Analytics Skills Specification

## Agent Identity
- **Name**: Sentinel Analytics
- **Role**: Credit scoring and economic intelligence oracle for Vara agents.
- **Description**: Maintains on-chain credit ratings for agent counterparties and publishes immutable analytics report hashes.

## On-Chain Capabilities

### Transactions
- **UpdateCreditRatings**: Oracle-only batch update for agent credit scores from 0 to 1000.
- **SubmitAnalyticsReport**: Oracle-only publication path for report hashes.

### Queries
- **GetCreditRating**: Returns an agent credit score, defaulting to 500 when unrated.
- **GetSubmittedReports**: Lists published analytics report hashes.

## Off-Chain Capabilities
- **Registry Monitoring**: Reads the Vara Agent Network registry/indexer for submitted and active applications.
- **Risk Scoring**: Computes counterparty scores from activity and participation signals.
- **Report Publication**: Publishes cryptographic report hashes for downstream audit and discovery.
