#!/bin/bash
# MCP Wrapper for Fabric GraphQL Server
# Redirects ALL stdout to stderr to keep protocol channel clean

# Set the working directory
cd "$(dirname "$0")"

# Export environment variables (from your config)
export MICROSOFT_FABRIC_API_URL="https://api.fabric.microsoft.com/v1/workspaces/your-workspace-id/items/your-item-id/execute"
export MICROSOFT_FABRIC_TENANT_ID="your_tenant_id_here"
export MICROSOFT_FABRIC_CLIENT_ID="your_client_id_here"
export MICROSOFT_FABRIC_CLIENT_SECRET="your_client_secret_here"
export SCOPE="https://api.fabric.microsoft.com/.default"

# Run the server, redirecting stdout (1) to stderr (2)
# stderr will be captured by Claude's logs, stdout stays clean for protocol
exec node FabricGraphQL_MCP.js 1>&2