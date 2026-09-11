import { McpTool, NoteColor, NoteType } from '../types/index.js';

export const VALID_COLORS: NoteColor[] = [
  'yellow',
  'blue',
  'pink',
  'green',
  'purple',
  'orange',
  'cyan',
  'coral',
];

export const VALID_NOTE_TYPES: NoteType[] = [
  'concept',
  'action',
  'question',
  'reference',
  'insight',
  'warning',
  'quote',
];

export const MCP_TOOLS: McpTool[] = [
  {
    name: 'get_landscapes',
    description: 'List all available visual thinking landscapes (boards) in Thoughtscape with their metadata, note counts, and cluster counts.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_landscape',
    description: 'Retrieve structured content of a specific landscape including thoughts, clusters, connections, and environment settings.',
    inputSchema: {
      type: 'object',
      properties: {
        landscapeId: {
          type: 'string',
          description: 'The unique ID of the landscape to fetch. If omitted, the active landscape is returned.',
        },
        includeNotes: {
          type: 'boolean',
          description: 'Whether to include sticky notes (default: true).',
        },
        includeGroups: {
          type: 'boolean',
          description: 'Whether to include section clusters (default: true).',
        },
        includeConnections: {
          type: 'boolean',
          description: 'Whether to include relationship connections (default: true).',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_current_context',
    description: 'Get the user\'s real-time focus in Thoughtscape: active landscape, currently selected thought (title & content), selected cluster, and summary stats. Use this when the user says "Explain this", "Expand this", "Connect this to X", or "Summarize this cluster".',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'search_thoughts',
    description: 'Search for thoughts across titles, markdown content, tags, and colors in a landscape.',
    inputSchema: {
      type: 'object',
      properties: {
        landscapeId: {
          type: 'string',
          description: 'The landscape ID to search in (omit for active landscape).',
        },
        query: {
          type: 'string',
          description: 'Search query string (matches title, content, and tags).',
        },
        color: {
          type: 'string',
          enum: VALID_COLORS,
          description: 'Filter search results by note color.',
        },
        type: {
          type: 'string',
          enum: VALID_NOTE_TYPES,
          description: 'Filter search results by note type.',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 15).',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'create_thought',
    description: 'Create a single sticky note thought in Thoughtscape. Position is automatically calculated near related thoughts if not provided.',
    inputSchema: {
      type: 'object',
      properties: {
        landscapeId: {
          type: 'string',
          description: 'Target landscape ID (omit for active landscape).',
        },
        title: {
          type: 'string',
          description: 'Short, clear title for the thought.',
        },
        content: {
          type: 'string',
          description: 'Markdown content / explanation of the thought.',
        },
        type: {
          type: 'string',
          enum: VALID_NOTE_TYPES,
          description: 'Type of thought: concept, action, question, reference, insight, warning, quote.',
        },
        color: {
          type: 'string',
          enum: VALID_COLORS,
          description: 'Color of the sticky note (yellow, blue, pink, green, purple, orange, cyan, coral).',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags for categorization (e.g., ["dsa", "algorithms", "searching"]).',
        },
        clusterId: {
          type: 'string',
          description: 'Optional ID of the cluster/section to place this thought inside.',
        },
        x: {
          type: 'number',
          description: 'Optional explicit X canvas coordinate.',
        },
        y: {
          type: 'number',
          description: 'Optional explicit Y canvas coordinate.',
        },
      },
      required: ['content'],
    },
  },
  {
    name: 'create_cluster',
    description: 'Create a conceptual section cluster region to group related thoughts together visually.',
    inputSchema: {
      type: 'object',
      properties: {
        landscapeId: {
          type: 'string',
          description: 'Target landscape ID (omit for active landscape).',
        },
        title: {
          type: 'string',
          description: 'Title of the section cluster (e.g. "Prerequisites", "Core Algorithm", "Edge Cases").',
        },
        description: {
          type: 'string',
          description: 'Optional subtitle/description for the cluster.',
        },
        color: {
          type: 'string',
          enum: VALID_COLORS,
          description: 'Accent tint color of the cluster region container.',
        },
        x: {
          type: 'number',
          description: 'Optional X canvas coordinate.',
        },
        y: {
          type: 'number',
          description: 'Optional Y canvas coordinate.',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'create_connection',
    description: 'Create a visual relationship arrow or connector between two thoughts.',
    inputSchema: {
      type: 'object',
      properties: {
        landscapeId: {
          type: 'string',
          description: 'Target landscape ID (omit for active landscape).',
        },
        sourceThoughtId: {
          type: 'string',
          description: 'ID of the origin thought.',
        },
        targetThoughtId: {
          type: 'string',
          description: 'ID of the destination thought.',
        },
        relationshipType: {
          type: 'string',
          enum: ['arrow', 'dashed', 'bidirectional', 'straight', 'step'],
          description: 'Visual style of the connector (default: arrow).',
        },
        label: {
          type: 'string',
          description: 'Semantic relationship label along the arrow (e.g., "requires", "leads to", "transforms into", "example of").',
        },
      },
      required: ['sourceThoughtId', 'targetThoughtId'],
    },
  },
  {
    name: 'update_thought',
    description: 'Update the content, title, color, type, tags, or status of an existing thought.',
    inputSchema: {
      type: 'object',
      properties: {
        landscapeId: {
          type: 'string',
          description: 'Target landscape ID (omit for active landscape).',
        },
        thoughtId: {
          type: 'string',
          description: 'The unique ID of the thought to update.',
        },
        title: {
          type: 'string',
          description: 'New title.',
        },
        content: {
          type: 'string',
          description: 'New markdown content.',
        },
        color: {
          type: 'string',
          enum: VALID_COLORS,
          description: 'New note color.',
        },
        type: {
          type: 'string',
          enum: VALID_NOTE_TYPES,
          description: 'New note type.',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'New tags array.',
        },
        starred: {
          type: 'boolean',
          description: 'Star/favorite flag.',
        },
        learningState: {
          type: 'string',
          enum: ['todo', 'in_progress', 'mastered', 'review'],
          description: 'Revision / mastery state.',
        },
      },
      required: ['thoughtId'],
    },
  },
  {
    name: 'move_thought',
    description: 'Reposition a thought on the canvas when the user explicitly requests moving thoughts.',
    inputSchema: {
      type: 'object',
      properties: {
        landscapeId: {
          type: 'string',
          description: 'Target landscape ID (omit for active landscape).',
        },
        thoughtId: {
          type: 'string',
          description: 'The unique ID of the thought to move.',
        },
        x: {
          type: 'number',
          description: 'New X canvas coordinate.',
        },
        y: {
          type: 'number',
          description: 'New Y canvas coordinate.',
        },
      },
      required: ['thoughtId', 'x', 'y'],
    },
  },
  {
    name: 'delete_thought',
    description: 'Move a thought to the landscape trash bin (soft-delete). Only use with explicit user intent.',
    inputSchema: {
      type: 'object',
      properties: {
        landscapeId: {
          type: 'string',
          description: 'Target landscape ID (omit for active landscape).',
        },
        thoughtId: {
          type: 'string',
          description: 'The unique ID of the thought to delete.',
        },
        permanent: {
          type: 'boolean',
          description: 'Whether to permanently destroy the note instead of moving to trash (default: false).',
        },
      },
      required: ['thoughtId'],
    },
  },
  {
    name: 'create_thought_map',
    description: 'Atomically generate a complete structured concept map / mind map from a topic. Automatically resolves temporary IDs, creates notes, clusters, connections, and computes spatial layout with zero partial state on failure.',
    inputSchema: {
      type: 'object',
      properties: {
        landscapeId: {
          type: 'string',
          description: 'Target landscape ID (omit for active landscape).',
        },
        topic: {
          type: 'string',
          description: 'The subject or concept to map (e.g. "Binary Search", "Graph Traversal", "System Design").',
        },
        mapType: {
          type: 'string',
          enum: ['concept', 'revision', 'flow', 'brainstorm', 'hierarchy'],
          description: 'Visual structure strategy: concept (radial clusters), flow (step-by-step pipeline), hierarchy (tree), revision (quiz/mastery).',
        },
        detailLevel: {
          type: 'string',
          enum: ['brief', 'detailed', 'comprehensive'],
          description: 'Depth: brief (4-6 notes), detailed (7-12 notes), comprehensive (13-20+ notes).',
        },
        userInstructions: {
          type: 'string',
          description: 'Custom instructions, e.g. "Focus on LeetCode patterns" or "Explain for a beginner".',
        },
        thoughts: {
          type: 'array',
          description: 'Structured array of notes with tempId, title, content, type, color, and role.',
          items: {
            type: 'object',
            properties: {
              tempId: { type: 'string' },
              title: { type: 'string' },
              content: { type: 'string' },
              type: { type: 'string', enum: VALID_NOTE_TYPES },
              color: { type: 'string', enum: VALID_COLORS },
              tags: { type: 'array', items: { type: 'string' } },
              clusterTempId: { type: 'string' },
              role: {
                type: 'string',
                enum: ['main', 'prerequisite', 'mechanism', 'application', 'example', 'question'],
              },
            },
            required: ['tempId', 'title', 'content'],
          },
        },
        clusters: {
          type: 'array',
          description: 'Optional clusters/regions with tempId, title, color.',
          items: {
            type: 'object',
            properties: {
              tempId: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              color: { type: 'string', enum: VALID_COLORS },
            },
            required: ['tempId', 'title'],
          },
        },
        connections: {
          type: 'array',
          description: 'Optional relationship arrows between thoughts using their tempId.',
          items: {
            type: 'object',
            properties: {
              sourceTempId: { type: 'string' },
              targetTempId: { type: 'string' },
              type: { type: 'string', enum: ['arrow', 'dashed', 'bidirectional', 'straight', 'step'] },
              label: { type: 'string' },
            },
            required: ['sourceTempId', 'targetTempId'],
          },
        },
      },
      required: ['topic'],
    },
  },
  {
    name: 'suggest_connections',
    description: 'Inspect existing thoughts in the landscape and return AI-suggested semantic relationships with reasoning without auto-applying.',
    inputSchema: {
      type: 'object',
      properties: {
        landscapeId: {
          type: 'string',
          description: 'Target landscape ID (omit for active landscape).',
        },
        topicFilter: {
          type: 'string',
          description: 'Optional topic to focus suggestions on.',
        },
      },
      required: [],
    },
  },
  {
    name: 'organize_landscape',
    description: 'Auto-organize thoughts in a landscape using spatial algorithms: grid, cluster, color, flow hierarchy, or scatter.',
    inputSchema: {
      type: 'object',
      properties: {
        landscapeId: {
          type: 'string',
          description: 'Target landscape ID (omit for active landscape).',
        },
        mode: {
          type: 'string',
          enum: ['grid', 'by_group', 'by_color', 'flow', 'scatter'],
          description: 'Layout algorithm to run.',
        },
      },
      required: ['mode'],
    },
  },
  {
    name: 'clear_landscape',
    description: 'Destructive operation: Clear all thoughts, clusters, and relationships from a specific landscape without deleting the landscape record itself. Requires explicit confirmation (confirm: true).',
    inputSchema: {
      type: 'object',
      properties: {
        landscapeId: {
          type: 'string',
          description: 'The target landscape ID to clear. If omitted, the active landscape is used.',
        },
        confirm: {
          type: 'boolean',
          description: 'Explicit safety confirmation. Must be strictly set to true to execute the destructive clear.',
        },
      },
      required: ['confirm'],
    },
  },
];
