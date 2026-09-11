# Thoughtscape 🌌

> **A landscape for your thoughts.**  
> Local-first spatial thinking, visual knowledge mapping, and physical sticky-note environment for deep work and conceptual clarity.

---

## ✨ Features

- **Physical Note Feel & Physics**: Organic paper textures, lift/peel tactile animations, dynamic drop shadows, paper tape, and push-pins.
- **Infinite Canvas & Spatial Freedom**: Pan, zoom, cluster, drag, resize, and connect thoughts with smooth 60 FPS performance.
- **Personalized Thoughtscape Environments**: Over 16 curated spaces including Green Chalkboards, Cork Boards, Wooden Studies, Dark Slate, Blueprints, and Custom color walls.
- **Visual Relationships & Flows**: Bezier curved relationship arrows with bi-directional and annotated connections.
- **Section Clusters & Thought Stacks**: Group concepts with custom background tints or gather ideas into physical paper stacks.
- **Multi-Landscape Support**: Switch between multiple isolated thinking workspaces with per-landscape settings memory.
- **ChatGPT & MCP Integration**: Native Model Context Protocol (MCP) server allowing AI agents to generate structured concept maps, search thoughts, and organize landscapes.
- **Local-First & Offline**: Zero sign-in required, zero tracking, instant auto-save to browser storage, and JSON backup/restore.
- **Interactive Technical Guide & Onboarding**: Built-in interactive spotlight tour and tutorial system.
- **Export & Share**: High-resolution print-friendly PDF document and crisp PNG image exporter.

---

## 🤖 ChatGPT & MCP Integration

Thoughtscape includes a dedicated **Model Context Protocol (MCP)** server enabling ChatGPT, Claude Desktop, Cursor, and autonomous agents to create, explore, and organize your visual landscape.

### 1. Launch the Thoughtscape MCP Server
```bash
# Build and launch both stdio MCP and HTTP/SSE live sync bridge (port 3001)
npm run server
```

### 2. Available MCP Tools
- `create_thought_map`: Atomically generate complete concept maps (notes, clusters, connections, layout).
- `get_current_context`: Provides real-time active selection and focus to resolve prompts like *"Expand this"* or *"Connect this to Sorting"*.
- `search_thoughts`: Search by keywords, colors, tags, and note types.
- `create_thought`: Add single thoughts with automatic spatial placement.
- `create_cluster`: Group related concepts into visual section containers.
- `create_connection`: Connect two thoughts with labeled curved arrows.
- `suggest_connections`: AI analysis of semantic relationships across thoughts.
- `organize_landscape`: Run spatial auto-layout algorithms (`grid`, `by_group`, `by_color`, `flow`, `scatter`).
- `get_landscapes` & `get_landscape`: Structured landscape inspection.
- `update_thought`, `move_thought`, `delete_thought`: Fine-grained thought operations.

### 3. Client Configuration

#### Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "thoughtscape": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/ThoughtScape/server/dist/index.js"]
    }
  }
}
```

#### Cursor / Windsurf Settings
```json
{
  "mcpServers": {
    "thoughtscape": {
      "command": "npm",
      "args": ["run", "mcp"]
    }
  }
}
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/jishnunainani-creator/ThoughtScape.git

# Navigate to project directory
cd ThoughtScape

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **MCP Server**: Node.js + TypeScript (JSON-RPC 2.0 / MCP Protocol / SSE Stream)
- **Canvas Math & Rendering**: Pure SVG + HTML Canvas + Hardware-Accelerated CSS
- **Export**: html2canvas + jsPDF

---

## 📄 License

MIT License.
