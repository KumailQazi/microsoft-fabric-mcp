#!/bin/bash
cd /Users/mac/Documents/graphql_mcp/fabric-samples/docs-samples/data-engineering/GraphQL/MCP
export MICROSOFT_FABRIC_API_URL="https://api.fabric.microsoft.com/v1/workspaces/your-workspace-id/items/your-item-id/execute"
export MICROSOFT_FABRIC_TENANT_ID="your_tenant_id_here"
export MICROSOFT_FABRIC_CLIENT_ID="your_client_id_here"
export MICROSOFT_FABRIC_CLIENT_SECRET="your_client_secret_here"
export SCOPE="https://api.fabric.microsoft.com/.default"

# Run the server but redirect all stdout messages to stderr
# This keeps stdout clean for JSON-RPC
node FabricGraphQL_MCP.js 2>&1 >&3 | tee -a server.log >&2 3>&1