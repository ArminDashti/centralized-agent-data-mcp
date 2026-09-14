import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { readFile } from 'node:fs/promises'
import { CadClient } from './client.js'

function textResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
}

function errorResult(err: unknown) {
  const message = err instanceof Error ? err.message : String(err)
  return { content: [{ type: 'text' as const, text: message }], isError: true as const }
}

export function registerTools(server: McpServer, client: CadClient): void {
  server.tool('health_check', 'Check centralized-agent-data-api health (GET /health).', {}, async () => {
    try {
      return textResult(await client.health())
    } catch (err) {
      return errorResult(err)
    }
  })

  server.tool(
    'login',
    'Login and cache JWT. Optional username/password override env defaults.',
    {
      username: z.string().optional(),
      password: z.string().optional(),
    },
    async ({ username, password }) => {
      try {
        const result = await client.login(username, password)
        return textResult({
          ok: true,
          user: result.user,
          token_preview: `${String((result as { token: string }).token).slice(0, 12)}…`,
        })
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  server.tool(
    'ingest_session',
    'Ingest a Cursor session extract JSON into the API. Provide file_path and/or json string; optional tokens supplement.',
    {
      file_path: z.string().optional().describe('Absolute path to extract JSON file'),
      json: z.string().optional().describe('Raw extract JSON string'),
      tokens_json: z
        .string()
        .optional()
        .describe('Optional token supplement JSON (input_tokens/output_tokens/totals)'),
    },
    async ({ file_path, json, tokens_json }) => {
      try {
        let raw = json ?? ''
        if (!raw && file_path) {
          raw = await readFile(file_path, 'utf8')
        }
        if (!raw) throw new Error('Provide file_path or json')
        const extract = JSON.parse(raw)
        let body: unknown = extract
        if (tokens_json) {
          body = { extract, tokens: JSON.parse(tokens_json) }
        }
        return textResult(await client.ingestJson(body))
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  server.tool(
    'list_sessions',
    'List sessions with context % and token totals.',
    { q: z.string().optional().describe('Optional name search') },
    async ({ q }) => {
      try {
        return textResult(await client.listSessions(q))
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  server.tool(
    'get_session_context_tokens',
    'Get session summary focused on context usage and token rollups.',
    { uuid: z.string().describe('Session UUID') },
    async ({ uuid }) => {
      try {
        const s = (await client.getSession(uuid)) as Record<string, unknown>
        return textResult({
          uuid: s.uuid,
          name: s.name,
          context_usage_percent: s.context_usage_percent,
          input_tokens: s.input_tokens,
          output_tokens: s.output_tokens,
          cache_read_tokens: s.cache_read_tokens,
          cache_write_tokens: s.cache_write_tokens,
          workspace_path: s.workspace_path,
          unified_mode: s.unified_mode,
          status: s.status,
        })
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  server.tool(
    'get_session_thinking',
    'Get thinking timeline for a session.',
    { uuid: z.string().describe('Session UUID') },
    async ({ uuid }) => {
      try {
        return textResult(await client.getThinking(uuid))
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  server.tool(
    'get_session_turns',
    'Get useful turn info (text, tools, tokens, thinking flags).',
    { uuid: z.string().describe('Session UUID') },
    async ({ uuid }) => {
      try {
        return textResult(await client.getTurns(uuid))
      } catch (err) {
        return errorResult(err)
      }
    },
  )
}
