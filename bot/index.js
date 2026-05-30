const { ApiPromise, WsProvider } = require('@polkadot/api');
const { GraphQLClient, gql } = require('graphql-request');
require('dotenv').config();

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'https://agents-api.vara.network/graphql';
const VARA_RPC = 'wss://rpc.vara.network';

const client = new GraphQLClient(GRAPHQL_ENDPOINT);

const QUERY_ESCROWS = gql`
  query GetTrustLayerEscrows {
    allApplications(first: 100) {
      nodes {
        owner
        handle
        status
      }
    }
  }
`;

async function main() {
  console.log("Starting Swarm Analytics Bot...");
  
  // Fetch data
  const data = await client.request(QUERY_ESCROWS);
  console.log("Fetched application data:", data.allApplications.nodes.length);
  
  // Simple mock scorer based on application registration status
  const ratings = data.allApplications.nodes.map(node => {
    let score = 500;
    if (node.status === 'Submitted' || node.status === 'SUBMITTED') score += 100;
    return { owner: node.owner, score };
  });

  console.log("Calculated ratings:", ratings);
}

main().catch(console.error);
