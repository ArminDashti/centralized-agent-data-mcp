# centralized-agent-data-mcp

stdio MCP for `centralized-agent-data-api`.

## Tools

- `health_check`, `login`
- `ingest_session`
- `list_sessions`
- `get_session_context_tokens`
- `get_session_thinking`
- `get_session_turns`

## Run

```powershell
cd C:\Users\armin\GitHub\centralized-agent-data-mcp
Copy-Item .env.example .env
npm install
npm run build
npm start
```

## Cursor MCP config snippet

```json
{
  "mcpServers": {
    "centralized-agent-data": {
      "command": "node",
      "args": ["C:/Users/armin/GitHub/centralized-agent-data-mcp/dist/index.js"],
      "env": {
        "CAD_API_URL": "http://127.0.0.1:8210",
        "CAD_USERNAME": "armin",
        "CAD_PASSWORD": "dopadopa123"
      }
    }
  }
}
```
