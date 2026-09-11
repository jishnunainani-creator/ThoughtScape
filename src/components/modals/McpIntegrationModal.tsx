import React, { useState } from 'react';
import {
  X,
  Bot,
  Terminal,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { McpActivityLog } from '../../hooks/useMcpSync';

interface McpIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  serverUrl: string;
  activityLogs: McpActivityLog[];
  onReconnect: () => void;
}

export const McpIntegrationModal: React.FC<McpIntegrationModalProps> = ({
  isOpen,
  onClose,
  isConnected,
  serverUrl,
  activityLogs,
  onReconnect,
}) => {
  const [activeTab, setActiveTab] = useState<'setup' | 'tools' | 'activity'>('setup');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const claudeConfig = JSON.stringify(
    {
      mcpServers: {
        thoughtscape: {
          command: 'node',
          args: [`${process.env.PWD || '.'}/server/dist/index.js`],
        },
      },
    },
    null,
    2
  );

  const cursorConfig = JSON.stringify(
    {
      mcpServers: {
        thoughtscape: {
          command: 'npm',
          args: ['run', 'mcp'],
        },
      },
    },
    null,
    2
  );

  const toolsList = [
    {
      name: 'create_thought_map',
      desc: 'Atomically creates complete concept maps with notes, clusters, relationships, and layout.',
      example: '"Create a detailed mind map for Binary Search in my Thoughtscape."',
      badge: 'High-Level',
    },
    {
      name: 'get_current_context',
      desc: 'Retrieves user focus: active landscape, selected thought title & content, selected cluster.',
      example: '"Expand this concept with code examples."',
      badge: 'Context',
    },
    {
      name: 'search_thoughts',
      desc: 'Searches across titles, markdown content, tags, and colors.',
      example: '"Find all thoughts about dynamic programming."',
      badge: 'Read',
    },
    {
      name: 'create_thought',
      desc: 'Creates a single sticky note with auto-placement near related concepts.',
      example: '"Add a thought about Time Complexity in DSA landscape."',
      badge: 'Write',
    },
    {
      name: 'create_cluster',
      desc: 'Creates a conceptual section container to group related thoughts visually.',
      example: '"Group my graph notes into a Core Traversal cluster."',
      badge: 'Write',
    },
    {
      name: 'create_connection',
      desc: 'Draws a relationship arrow or connector between two thoughts.',
      example: '"Connect Binary Search to Sorted Array with label requires."',
      badge: 'Relationships',
    },
    {
      name: 'suggest_connections',
      desc: 'Analyzes thoughts and returns AI-suggested semantic links without auto-applying.',
      example: '"What connections can I make between my algorithm notes?"',
      badge: 'AI Analysis',
    },
    {
      name: 'get_landscapes',
      desc: 'Lists available landscapes with note counts and metadata.',
      example: '"What landscapes do I have in my workspace?"',
      badge: 'Read',
    },
  ];

  return (
    <div
      data-export-ignore="true"
      className="fixed inset-0 z-[99999] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-slate-900">ChatGPT & MCP Integration</h2>
                <div
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                    isConnected
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <span>{isConnected ? 'Server Connected' : 'Server Offline'}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Let AI agents create, explore, and organize your visual knowledge landscape
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 bg-white">
          <button
            onClick={() => setActiveTab('setup')}
            className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'setup'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Setup & Connect</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'tools'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>MCP Tools ({toolsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'activity'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Activity {activityLogs.length > 0 && `(${activityLogs.length})`}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          {activeTab === 'setup' && (
            <div className="space-y-4">
              {/* How it works banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-900">
                    Clean Architecture & Zero DOM Pollution
                  </div>
                  <div>
                    ChatGPT interacts directly with the Thoughtscape MCP Server over structured
                    JSON-RPC. The server manages coordinates, connections, and layout, and updates your
                    canvas in real-time.
                  </div>
                </div>
              </div>

              {/* Start local server box */}
              <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-300">
                    1. Launch Thoughtscape MCP Server
                  </span>
                  <button
                    onClick={() => handleCopy('npm run server', 'npm-server')}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                  >
                    {copiedKey === 'npm-server' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>Copy</span>
                  </button>
                </div>
                <code className="block bg-slate-950 px-3 py-2 rounded-lg font-mono text-emerald-400 text-xs">
                  npm run server
                </code>
                <div className="text-[11px] text-slate-400">
                  Starts stdio MCP protocol and local HTTP/SSE live sync at{' '}
                  <span className="text-slate-200">http://localhost:3001</span>.
                </div>
              </div>

              {/* Client configurations */}
              <div className="space-y-3">
                <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  2. Add to Your AI Clients
                </div>

                {/* Claude Desktop Config */}
                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-800">
                      Claude Desktop Config (`claude_desktop_config.json`)
                    </div>
                    <button
                      onClick={() => handleCopy(claudeConfig, 'claude')}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1 transition-colors"
                    >
                      {copiedKey === 'claude' ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy JSON</span>
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-slate-100 p-2.5 rounded-lg text-[11px] overflow-x-auto font-mono">
                    {claudeConfig}
                  </pre>
                </div>

                {/* Cursor / Windsurf */}
                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-800">Cursor / Windsurf MCP Settings</div>
                    <button
                      onClick={() => handleCopy(cursorConfig, 'cursor')}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1 transition-colors"
                    >
                      {copiedKey === 'cursor' ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy JSON</span>
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-slate-100 p-2.5 rounded-lg text-[11px] overflow-x-auto font-mono">
                    {cursorConfig}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-600">
                The MCP server exposes 13 focused tools following strict schema validation.
              </div>

              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {toolsList.map((tool) => (
                  <div
                    key={tool.name}
                    className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 rounded-xl transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-mono font-bold text-blue-700 text-xs">
                        {tool.name}
                      </div>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                        {tool.badge}
                      </span>
                    </div>
                    <div className="text-slate-600 text-xs">{tool.desc}</div>
                    <div className="bg-white/80 p-1.5 rounded border border-slate-200/50 font-mono text-[10px] text-slate-500">
                      <span className="text-blue-600 font-semibold">Example prompt:</span> {tool.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Recent tool executions initiated by ChatGPT or AI agents:</span>
                <button
                  onClick={onReconnect}
                  className="hover:text-blue-600 flex items-center gap-1 font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh Connection</span>
                </button>
              </div>

              {activityLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Bot className="w-8 h-8 mx-auto opacity-40 text-blue-600" />
                  <div className="font-medium text-slate-600">No AI tool executions yet</div>
                  <div className="text-[11px]">
                    Connect ChatGPT and ask: &quot;Create a concept map for Binary Search in Thoughtscape&quot;
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/70"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">{log.title}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            tool: {log.type}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            />
            <span>
              Bridge:{' '}
              <code className="bg-slate-200/60 px-1 py-0.5 rounded font-mono text-slate-700">
                {serverUrl}
              </code>
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
