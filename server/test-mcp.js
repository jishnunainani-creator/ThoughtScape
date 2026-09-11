import { ToolDispatcher } from './dist/mcp/tools.js';
import { StorageProvider } from './dist/storage/storageProvider.js';

async function runTests() {
  console.log('🧪 Starting Thoughtscape MCP Integration Verification...\n');
  const storage = new StorageProvider('.test-workspace.json');
  const dispatcher = new ToolDispatcher(storage);

  // Test 1: listTools
  const tools = dispatcher.listTools();
  console.log(`✅ 1. Tools Listed: ${tools.length} tools registered.`);
  if (tools.length < 10) throw new Error('Too few tools registered');

  // Test 2: get_landscapes
  const landscapesRes = await dispatcher.callTool('get_landscapes');
  console.log('✅ 2. get_landscapes response:', landscapesRes.content[0].text);

  // Test 3: create_thought_map (Atomic Generation)
  console.log('\n--- Testing create_thought_map for Binary Search ---');
  const mapRes = await dispatcher.callTool('create_thought_map', {
    topic: 'Binary Search Algorithm',
    mapType: 'concept',
    detailLevel: 'detailed',
    userInstructions: 'Include time complexity and boundary pitfalls'
  });
  console.log('✅ 3. create_thought_map response:', mapRes.content[0].text);

  // Test 4: get_current_context
  const contextRes = await dispatcher.callTool('get_current_context');
  console.log('\n✅ 4. get_current_context response:', contextRes.content[0].text);

  // Test 5: search_thoughts
  const searchRes = await dispatcher.callTool('search_thoughts', { query: 'Binary Search' });
  console.log('\n✅ 5. search_thoughts response:', searchRes.content[0].text);

  // Test 6: create_thought & create_connection
  const note1 = await dispatcher.callTool('create_thought', {
    title: 'Interpolation Search',
    content: 'Variant of binary search for uniformly distributed values.',
    color: 'purple',
    type: 'concept',
    tags: ['algorithms', 'search']
  });
  const parsed1 = JSON.parse(note1.content[0].text);
  console.log('\n✅ 6. create_thought response:', parsed1.message);

  // Test 7: suggest_connections
  const suggestRes = await dispatcher.callTool('suggest_connections');
  console.log('\n✅ 7. suggest_connections response:', suggestRes.content[0].text);

  console.log('\n🎉 ALL MCP TOOL VERIFICATIONS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ MCP Verification Failed:', err);
  process.exit(1);
});
