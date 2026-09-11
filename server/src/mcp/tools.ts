import { StorageProvider } from '../storage/storageProvider.js';
import { BoardService } from '../services/boardService.js';
import { NoteService } from '../services/noteService.js';
import { GroupService } from '../services/groupService.js';
import { ConnectionService } from '../services/connectionService.js';
import { SearchService } from '../services/searchService.js';
import { LayoutService } from '../services/layoutService.js';
import { ThoughtMapService } from '../services/thoughtMapService.js';
import { ContextService } from '../services/contextService.js';
import { MCP_TOOLS } from '../schemas/toolSchemas.js';
import { McpTool } from '../types/index.js';

export class ToolDispatcher {
  public boardService: BoardService;
  public noteService: NoteService;
  public groupService: GroupService;
  public connectionService: ConnectionService;
  public searchService: SearchService;
  public layoutService: LayoutService;
  public thoughtMapService: ThoughtMapService;
  public contextService: ContextService;

  constructor(private storage: StorageProvider) {
    this.boardService = new BoardService(storage);
    this.noteService = new NoteService(storage);
    this.groupService = new GroupService(storage);
    this.connectionService = new ConnectionService(storage);
    this.searchService = new SearchService(storage);
    this.layoutService = new LayoutService();
    this.thoughtMapService = new ThoughtMapService(storage);
    this.contextService = new ContextService(storage);
  }

  public listTools(): McpTool[] {
    return MCP_TOOLS;
  }

  public async callTool(name: string, args: any = {}): Promise<any> {
    switch (name) {
      case 'get_landscapes': {
        const landscapes = this.boardService.getLandscapes();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ landscapes }, null, 2),
            },
          ],
        };
      }

      case 'get_landscape': {
        const data = this.boardService.getLandscape(
          args.landscapeId,
          args.includeNotes !== false,
          args.includeGroups !== false,
          args.includeConnections !== false
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_current_context': {
        const context = this.contextService.getCurrentContext();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(context, null, 2),
            },
          ],
        };
      }

      case 'search_thoughts': {
        const results = this.searchService.searchThoughts({
          landscapeId: args.landscapeId,
          query: args.query || '',
          color: args.color,
          type: args.type,
          limit: args.limit,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case 'create_thought': {
        const thought = this.noteService.createThought({
          landscapeId: args.landscapeId,
          title: args.title,
          content: args.content,
          type: args.type,
          color: args.color,
          tags: args.tags,
          clusterId: args.clusterId,
          x: args.x,
          y: args.y,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: `Created thought "${thought.title || 'Thought'}" (${thought.id})`,
                  thought,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'create_cluster': {
        const cluster = this.groupService.createCluster({
          landscapeId: args.landscapeId,
          title: args.title,
          description: args.description,
          color: args.color,
          x: args.x,
          y: args.y,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: `Created section cluster "${cluster.title}" (${cluster.id})`,
                  cluster,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'create_connection': {
        const connection = this.connectionService.createConnection({
          landscapeId: args.landscapeId,
          sourceThoughtId: args.sourceThoughtId,
          targetThoughtId: args.targetThoughtId,
          relationshipType: args.relationshipType,
          label: args.label,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: `Created connection from ${connection.sourceId} to ${connection.targetId}`,
                  connection,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'update_thought': {
        const updated = this.noteService.updateThought({
          landscapeId: args.landscapeId,
          thoughtId: args.thoughtId,
          title: args.title,
          content: args.content,
          color: args.color,
          type: args.type,
          tags: args.tags,
          starred: args.starred,
          learningState: args.learningState,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: `Updated thought "${updated.title || updated.id}"`,
                  thought: updated,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'move_thought': {
        const moved = this.noteService.moveThought(args.landscapeId, args.thoughtId, args.x, args.y);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: `Moved thought "${moved.title || moved.id}" to (${moved.x}, ${moved.y})`,
                  thought: moved,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'delete_thought': {
        const deleted = this.noteService.deleteThought(args.landscapeId, args.thoughtId, args.permanent);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: `Deleted thought ${deleted.id}`,
                  result: deleted,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'create_thought_map': {
        const result = this.thoughtMapService.createThoughtMap({
          landscapeId: args.landscapeId,
          topic: args.topic,
          mapType: args.mapType,
          detailLevel: args.detailLevel,
          userInstructions: args.userInstructions,
          thoughts: args.thoughts,
          clusters: args.clusters,
          connections: args.connections,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: `Successfully generated concept map for "${result.topic}" (${result.createdNotesCount} notes, ${result.createdClustersCount} clusters, ${result.createdConnectionsCount} connections)`,
                  details: result,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'suggest_connections': {
        const suggestions = this.connectionService.suggestConnections(args.landscapeId, args.topicFilter);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(suggestions, null, 2),
            },
          ],
        };
      }

      case 'organize_landscape': {
        const ws = this.storage.getWorkspace();
        const boardId = args.landscapeId || ws.activeBoardId;
        const notes = ws.notes.filter((n) => (n.boardId || ws.activeBoardId) === boardId);
        const groups = ws.groups.filter((g) => (g.boardId || ws.activeBoardId) === boardId);

        const organized = this.layoutService.organizeNotes(notes, groups, args.mode);
        this.storage.scheduleSave();
        this.storage.emitChange({
          type: 'workspace_synced',
          landscapeId: boardId,
          timestamp: Date.now(),
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: `Organized ${organized.updatedNotes.length} thoughts using "${args.mode}" layout.`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'clear_landscape': {
        if (args.confirm !== true) {
          throw new Error(
            'Safety confirmation required: "confirm" parameter must be strictly set to true to clear all thoughts, clusters, and relationships from the landscape.'
          );
        }

        const clearResult = this.boardService.clearLandscape(args.landscapeId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: `Successfully cleared landscape "${clearResult.landscapeName}". Removed ${clearResult.deletedThoughts} thoughts, ${clearResult.deletedClusters} clusters, and ${clearResult.deletedConnections} connections.`,
                  details: clearResult,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown MCP tool: "${name}"`);
    }
  }
}
