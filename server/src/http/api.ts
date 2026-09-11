import http from 'node:http';
import { StorageProvider } from '../storage/storageProvider.js';
import { ToolDispatcher } from '../mcp/tools.js';

export class HttpBridgeServer {
  private server: http.Server | null = null;
  private sseClients: Set<http.ServerResponse> = new Set();
  private dispatcher: ToolDispatcher;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(private storage: StorageProvider, private port = 3001) {
    this.dispatcher = new ToolDispatcher(storage);

    // Listen to storage changes and broadcast to all SSE connected browser clients
    this.storage.on('change', (event) => {
      this.broadcastSse('thoughtscape:update', event);
    });

    // Send heartbeat every 15 seconds to keep SSE connections open
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 15000);
  }

  public start(): Promise<number> {
    return new Promise((resolve) => {
      this.server = http.createServer((req, res) => {
        // Global CORS Headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        if (req.method === 'OPTIONS') {
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          });
          res.end();
          return;
        }

        const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
        const pathname = url.pathname;

        // 1. Health check
        if (pathname === '/health' || pathname === '/api/status') {
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(
            JSON.stringify({
              status: 'ok',
              app: 'Thoughtscape MCP Bridge',
              version: '1.0.0',
              toolsAvailable: this.dispatcher.listTools().length,
              activeClients: this.sseClients.size,
            })
          );
          return;
        }

        // 2. Server-Sent Events (SSE) stream for real-time browser canvas updates
        if (pathname === '/sse' || pathname === '/api/events') {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
          });

          res.write('data: {"type":"connected","message":"Connected to Thoughtscape MCP Bridge"}\n\n');
          this.sseClients.add(res);

          req.on('close', () => {
            this.sseClients.delete(res);
          });
          return;
        }

        // 3. Workspace Fetch & Sync
        if (pathname === '/api/workspace') {
          if (req.method === 'GET') {
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            });
            res.end(JSON.stringify(this.storage.getWorkspace()));
            return;
          }

          if (req.method === 'POST') {
            this.parseJsonBody(req, res, (body) => {
              if (body && Array.isArray(body.boards)) {
                this.storage.setWorkspace(body, false);
                res.writeHead(200, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                });
                res.end(JSON.stringify({ success: true, message: 'Workspace synced' }));
              } else {
                res.writeHead(400, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                });
                res.end(JSON.stringify({ error: 'Invalid workspace payload' }));
              }
            });
            return;
          }
        }

        // 4. Update Current UI Focus Context
        if (pathname === '/api/context' && req.method === 'POST') {
          this.parseJsonBody(req, res, (body) => {
            this.dispatcher.contextService.updateContext(body || {});
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            });
            res.end(JSON.stringify({ success: true }));
          });
          return;
        }

        // 5. In-App Quick Prompt Execution (/api/generate)
        if (pathname === '/api/generate' && req.method === 'POST') {
          this.parseJsonBody(req, res, async (body) => {
            try {
              const { topic, mapType, detailLevel, userInstructions, landscapeId } = body || {};
              if (!topic) {
                res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ error: 'Missing topic parameter' }));
                return;
              }

              const result = this.dispatcher.thoughtMapService.createThoughtMap({
                landscapeId,
                topic,
                mapType: mapType || 'concept',
                detailLevel: detailLevel || 'detailed',
                userInstructions,
              });

              res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify({ success: true, result }));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify({ error: err?.message || 'Failed to generate concept map' }));
            }
          });
          return;
        }

        // 6. HTTP MCP Tool Call Bridge
        if ((pathname === '/mcp' || pathname === '/api/mcp') && req.method === 'POST') {
          this.parseJsonBody(req, res, async (body) => {
            try {
              if (body.method === 'tools/list') {
                res.writeHead(200, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                });
                res.end(JSON.stringify({ jsonrpc: '2.0', id: body.id, result: { tools: this.dispatcher.listTools() } }));
                return;
              }

              if (body.method === 'tools/call') {
                const { name, arguments: args } = body.params || {};
                const result = await this.dispatcher.callTool(name, args || {});
                res.writeHead(200, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                });
                res.end(JSON.stringify({ jsonrpc: '2.0', id: body.id, result }));
                return;
              }

              res.writeHead(400, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              });
              res.end(JSON.stringify({ jsonrpc: '2.0', id: body.id, error: { code: -32601, message: 'Method not supported over HTTP endpoint' } }));
            } catch (err: any) {
              res.writeHead(500, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              });
              res.end(JSON.stringify({ jsonrpc: '2.0', id: body.id, error: { code: -32000, message: err?.message || 'Execution error' } }));
            }
          });
          return;
        }

        // 404
        res.writeHead(404, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(JSON.stringify({ error: 'Not found' }));
      });

      this.server.listen(this.port, () => {
        process.stderr.write(`[Thoughtscape Bridge] HTTP/SSE server running at http://localhost:${this.port}\n`);
        resolve(this.port);
      });
    });
  }

  private sendHeartbeat(): void {
    for (const client of this.sseClients) {
      try {
        client.write(': keepalive\n\n');
      } catch {
        this.sseClients.delete(client);
      }
    }
  }

  private broadcastSse(eventType: string, data: any): void {
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.sseClients) {
      try {
        client.write(payload);
      } catch {
        this.sseClients.delete(client);
      }
    }
  }

  private parseJsonBody(req: http.IncomingMessage, res: http.ServerResponse, next: (body: any) => void): void {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        const parsed = raw ? JSON.parse(raw) : {};
        next(parsed);
      } catch (err) {
        res.writeHead(400, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(JSON.stringify({ error: 'Malformed JSON body' }));
      }
    });
  }
}
