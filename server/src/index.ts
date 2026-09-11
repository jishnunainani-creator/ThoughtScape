#!/usr/bin/env node

import { globalStorage } from './storage/storageProvider.js';
import { McpStdioServer } from './mcp/server.js';
import { HttpBridgeServer } from './http/api.js';

const HTTP_PORT = parseInt(process.env.THOUGHTSCAPE_PORT || process.env.PORT || '3001', 10);

async function main() {
  // Start HTTP / SSE Bridge
  const bridge = new HttpBridgeServer(globalStorage, HTTP_PORT);
  await bridge.start();

  // Start Stdio MCP Protocol Server
  const stdioServer = new McpStdioServer(globalStorage);
  stdioServer.start();

  const cleanup = () => {
    globalStorage.persistToDisk();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main().catch((err) => {
  process.stderr.write(`[Thoughtscape MCP] Fatal server error: ${err?.stack || err}\n`);
  process.exit(1);
});
