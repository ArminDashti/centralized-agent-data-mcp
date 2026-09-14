#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CadClient } from './client.js'
import { registerTools } from './tools.js'

async function main() {
  const client = new CadClient()
  const server = new McpServer({
    name: 'centralized-agent-data-mcp',
    version: '1.0.0',
  })
  registerTools(server, client)
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
