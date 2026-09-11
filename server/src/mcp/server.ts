import readline from 'node:readline';
import { StorageProvider } from '../storage/storageProvider.js';
import { ToolDispatcher } from './tools.js';
import { McpRequest, McpResponse } from '../types/index.js';

export class McpStdioServer {
  private dispatcher: ToolDispatcher;

  constructor(private storage: StorageProvider) {
    this.dispatcher = new ToolDispatcher(storage);
  }

  public start(): void {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    rl.on('line', async (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      try {
        const request: McpRequest = JSON.parse(trimmed);
        const response = await this.handleRequest(request);
        if (response) {
          process.stdout.write(`${JSON.stringify(response)}\n`);
        }
      } catch (err: any) {
        const errorResponse: McpResponse = {
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32700,
            message: `Parse error: ${err?.message || 'Invalid JSON'}`,
          },
        };
        process.stdout.write(`${JSON.stringify(errorResponse)}\n`);
      }
    });

    process.stderr.write('[Thoughtscape MCP] Stdio server listening for MCP requests\n');
  }

  public async handleRequest(req: McpRequest): Promise<McpResponse | null> {
    const { id, method, params } = req;

    // Handle notifications (no id)
    if (id === undefined || id === null) {
      if (method === 'notifications/initialized' || method === 'initialized') {
        process.stderr.write('[Thoughtscape MCP] Client initialized successfully\n');
      }
      return null;
    }

    try {
      switch (method) {
        case 'initialize': {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {
                  listChanged: false,
                },
              },
              serverInfo: {
                name: 'thoughtscape-mcp-server',
                version: '1.0.0',
                description: 'Visual knowledge mapping & spatial thinking MCP server for ChatGPT',
              },
            },
          };
        }

        case 'ping': {
          return {
            jsonrpc: '2.0',
            id,
            result: {},
          };
        }

        case 'tools/list': {
          const tools = this.dispatcher.listTools();
          return {
            jsonrpc: '2.0',
            id,
            result: {
              tools,
            },
          };
        }

        case 'tools/call': {
          const { name, arguments: args } = params || {};
          if (!name) {
            return {
              jsonrpc: '2.0',
              id,
              error: {
                code: -32602,
                message: 'Missing "name" parameter in tools/call',
              },
            };
          }

          const result = await this.dispatcher.callTool(name, args || {});
          return {
            jsonrpc: '2.0',
            id,
            result,
          };
        }

        default: {
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: -32601,
              message: `Method "${method}" not found`,
            },
          };
        }
      }
    } catch (err: any) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32000,
          message: err?.message || 'Internal tool execution error',
        },
      };
    }
  }
}
