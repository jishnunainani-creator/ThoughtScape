import { MapThoughtSpec, MapClusterSpec, MapConnectionSpec } from "../types/index.js";

export interface TopicMapData {
  thoughts: MapThoughtSpec[];
  clusters: MapClusterSpec[];
  connections: MapConnectionSpec[];
}

export class KnowledgeEngine {
  public generateTopicMap(
    rawTopic: string,
    mapType = "concept",
    detailLevel = "standard",
    userInstructions?: string
  ): TopicMapData {
    const topic = rawTopic.trim();
    const cleanLower = topic.toLowerCase();
    if (cleanLower.includes("queue")) return this.getQueueKnowledge(detailLevel);
    if (cleanLower.includes("stack")) return this.getStackKnowledge(detailLevel);
    if (cleanLower.includes("binary search")) return this.getBinarySearchKnowledge(detailLevel);
    if (cleanLower.includes("linked list")) return this.getLinkedListKnowledge(detailLevel);
    if (cleanLower.includes("tree") || cleanLower.includes("bst")) return this.getTreeKnowledge(detailLevel);
    if (cleanLower.includes("graph") || cleanLower.includes("bfs") || cleanLower.includes("dfs")) return this.getGraphKnowledge(detailLevel);
    if (cleanLower.includes("dynamic programming") || cleanLower === "dp") return this.getDynamicProgrammingKnowledge(detailLevel);
    if (cleanLower.includes("hash") || cleanLower.includes("map")) return this.getHashMapKnowledge(detailLevel);
    if (cleanLower.includes("sort")) return this.getSortingKnowledge(detailLevel);
    if (cleanLower.includes("react")) return this.getReactKnowledge(detailLevel);
    if (cleanLower.includes("rest") || cleanLower.includes("http") || cleanLower.includes("api")) return this.getRestApiKnowledge(detailLevel);
    if (cleanLower.includes("sql") || cleanLower.includes("database")) return this.getDatabaseKnowledge(detailLevel);
    if (cleanLower.includes("photosynthesis")) return this.getPhotosynthesisKnowledge(detailLevel);
    if (cleanLower.includes("newton")) return this.getNewtonLawsKnowledge(detailLevel);
    if (cleanLower.includes("microservice")) return this.getMicroservicesKnowledge(detailLevel);
    return this.synthesizeUniversalTopic(topic, detailLevel, mapType, userInstructions);
  }

  // =========================================================================
  // QUEUES IN DATA STRUCTURE
  // =========================================================================
  private getQueueKnowledge(detailLevel: string): TopicMapData {
    const isDetailed = detailLevel === 'detailed' || detailLevel === 'deep' || detailLevel === 'comprehensive';

    const clusters: MapClusterSpec[] = [
      { tempId: 'cluster_core', title: 'Core Fundamentals', description: 'FIFO principle and pointer tracking', color: 'yellow' },
      { tempId: 'cluster_ops', title: 'Queue Operations', description: 'Enqueue, dequeue, and inspection primitives', color: 'green' },
      { tempId: 'cluster_impl', title: 'Implementations', description: 'Array and linked list storage representations', color: 'blue' },
      { tempId: 'cluster_types', title: 'Variants & Types', description: 'Circular, priority, and double-ended queues', color: 'orange' },
      { tempId: 'cluster_apps', title: 'Applications', description: 'Graph traversals, CPU scheduling, and spooling', color: 'purple' },
      { tempId: 'cluster_perf', title: 'Complexity & Pitfalls', description: 'O(1) bounds and common bugs', color: 'pink' },
    ];

    const thoughts: MapThoughtSpec[] = [
      {
        tempId: 'queue_main',
        title: 'Queue',
        content: 'Linear data structure following FIFO — First In, First Out.\nElements are inserted at the rear and removed from the front.',
        type: 'concept',
        color: 'yellow',
        role: 'main',
        clusterTempId: 'cluster_core',
        tags: ['dsa', 'queue', 'core'],
      },
      {
        tempId: 'queue_fifo',
        title: 'FIFO',
        content: 'First In, First Out principle:\nFirst element inserted is the first element removed, preserving arrival sequence.',
        type: 'concept',
        color: 'yellow',
        role: 'mechanism',
        clusterTempId: 'cluster_core',
        tags: ['fifo', 'dsa'],
      },
      {
        tempId: 'queue_front',
        title: 'Front',
        content: 'Points to the element that will be removed next.\nAdvances on every dequeue operation.',
        type: 'concept',
        color: 'blue',
        role: 'mechanism',
        clusterTempId: 'cluster_core',
        tags: ['pointers', 'front'],
      },
      {
        tempId: 'queue_rear',
        title: 'Rear',
        content: 'Points to the position where new elements are inserted.\nAdvances on every enqueue operation.',
        type: 'concept',
        color: 'blue',
        role: 'mechanism',
        clusterTempId: 'cluster_core',
        tags: ['pointers', 'rear'],
      },
      {
        tempId: 'queue_enqueue',
        title: 'Enqueue',
        content: 'Adds an element at the rear of the queue.\nExample: Queue = [10, 20]. Enqueue(30) → [10, 20, 30].',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_ops',
        tags: ['operations', 'enqueue'],
      },
      {
        tempId: 'queue_dequeue',
        title: 'Dequeue',
        content: 'Removes an element from the front of the queue.\nExample: [10, 20, 30]. Dequeue() → removes 10, leaving [20, 30].',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_ops',
        tags: ['operations', 'dequeue'],
      },
      {
        tempId: 'queue_peek',
        title: 'Peek',
        content: 'Returns the front element without removing it from the queue.',
        type: 'concept',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_ops',
        tags: ['operations', 'peek'],
      },
      {
        tempId: 'queue_empty',
        title: 'Queue Empty',
        content: 'A queue is empty when it contains no elements (front == -1 or front > rear).',
        type: 'warning',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_ops',
        tags: ['boundary', 'empty'],
      },
      {
        tempId: 'queue_array_impl',
        title: 'Array Queue',
        content: 'Queue can be implemented using an array with front and rear indices.',
        type: 'concept',
        color: 'blue',
        role: 'mechanism',
        clusterTempId: 'cluster_impl',
        tags: ['implementation', 'array'],
      },
      {
        tempId: 'queue_ll_impl',
        title: 'Linked List Queue',
        content: 'Use nodes with front and rear pointers. Enqueue at rear, dequeue at front.',
        type: 'concept',
        color: 'blue',
        role: 'mechanism',
        clusterTempId: 'cluster_impl',
        tags: ['implementation', 'linkedlist'],
      },
      {
        tempId: 'queue_overflow',
        title: 'Queue Overflow & Underflow',
        content: '• Underflow: Dequeuing from an empty queue.\n• Overflow: Enqueuing into a full static array queue.',
        type: 'warning',
        color: 'pink',
        role: 'example',
        clusterTempId: 'cluster_impl',
        tags: ['errors', 'overflow'],
      },
      {
        tempId: 'queue_circular',
        title: 'Circular Queue',
        content: 'Connects the last array position back to the first so unused spaces can be reused.',
        type: 'concept',
        color: 'orange',
        role: 'mechanism',
        clusterTempId: 'cluster_types',
        tags: ['variants', 'circular'],
      },
      {
        tempId: 'queue_priority',
        title: 'Priority Queue',
        content: 'Elements are removed according to priority rather than simple FIFO order.',
        type: 'concept',
        color: 'orange',
        role: 'mechanism',
        clusterTempId: 'cluster_types',
        tags: ['variants', 'priority-queue'],
      },
      {
        tempId: 'queue_deque',
        title: 'Deque',
        content: 'Double-ended queue allowing insertion and deletion from both ends.',
        type: 'concept',
        color: 'orange',
        role: 'mechanism',
        clusterTempId: 'cluster_types',
        tags: ['variants', 'deque'],
      },
      {
        tempId: 'queue_app_cpu',
        title: 'CPU Scheduling',
        content: 'Processes can wait in a queue until the CPU is ready to execute them.',
        type: 'action',
        color: 'purple',
        role: 'application',
        clusterTempId: 'cluster_apps',
        tags: ['applications', 'cpu'],
      },
      {
        tempId: 'queue_app_bfs',
        title: 'BFS',
        content: 'Breadth-first search uses a queue to process vertices level by level.',
        type: 'action',
        color: 'purple',
        role: 'application',
        clusterTempId: 'cluster_apps',
        tags: ['applications', 'bfs'],
      },
      {
        tempId: 'queue_app_printer',
        title: 'Printer Queue',
        content: 'Print jobs wait in a queue and are processed in order.',
        type: 'action',
        color: 'purple',
        role: 'application',
        clusterTempId: 'cluster_apps',
        tags: ['applications', 'printer'],
      },
      {
        tempId: 'queue_complexity',
        title: 'Queue Complexity',
        content: 'Enqueue and dequeue are typically O(1) with a suitable implementation.',
        type: 'reference',
        color: 'pink',
        role: 'example',
        clusterTempId: 'cluster_perf',
        tags: ['complexity', 'big-o'],
      },
      {
        tempId: 'queue_pitfall',
        title: 'Common Queue Mistake',
        content: 'In a normal queue, insertion happens at the rear and deletion happens at the front.',
        type: 'warning',
        color: 'pink',
        role: 'example',
        clusterTempId: 'cluster_perf',
        tags: ['pitfalls', 'mistakes'],
      },
      {
        tempId: 'queue_example',
        title: 'Simple Example',
        content: 'Queue: [10, 20, 30]\nDequeue → removes 10\nEnqueue(40) → [20, 30, 40]',
        type: 'concept',
        color: 'yellow',
        role: 'example',
        clusterTempId: 'cluster_core',
        tags: ['example', 'trace'],
      },
    ];

    if (isDetailed) {
      thoughts.push(
        {
          tempId: 'queue_prereq_arrays',
          title: 'Prerequisite: Arrays & Pointers',
          content: 'Foundational contiguous memory indexing and pointer references required for queues.',
          type: 'reference',
          color: 'cyan',
          role: 'prerequisite',
          clusterTempId: 'cluster_core',
          tags: ['prereq', 'arrays'],
        },
        {
          tempId: 'queue_app_buffers',
          title: 'Message Buffers & Streaming',
          content: 'Asynchronous streaming buffers and event queues prevent producer-consumer deadlock.',
          type: 'action',
          color: 'purple',
          role: 'application',
          clusterTempId: 'cluster_apps',
          tags: ['applications', 'buffers'],
        }
      );
    }

    const connections: MapConnectionSpec[] = [
      { sourceTempId: 'queue_main', targetTempId: 'queue_fifo', type: 'arrow', label: 'follows' },
      { sourceTempId: 'queue_main', targetTempId: 'queue_front', type: 'arrow', label: 'contains' },
      { sourceTempId: 'queue_main', targetTempId: 'queue_rear', type: 'arrow', label: 'contains' },
      { sourceTempId: 'queue_main', targetTempId: 'queue_enqueue', type: 'arrow', label: 'supports' },
      { sourceTempId: 'queue_main', targetTempId: 'queue_dequeue', type: 'arrow', label: 'supports' },
      { sourceTempId: 'queue_main', targetTempId: 'queue_peek', type: 'arrow', label: 'supports' },
      { sourceTempId: 'queue_main', targetTempId: 'queue_array_impl', type: 'arrow', label: 'implemented using' },
      { sourceTempId: 'queue_main', targetTempId: 'queue_ll_impl', type: 'arrow', label: 'implemented using' },
      { sourceTempId: 'queue_circular', targetTempId: 'queue_array_impl', type: 'arrow', label: 'improves space in' },
      { sourceTempId: 'queue_circular', targetTempId: 'queue_main', type: 'arrow', label: 'variant of' },
      { sourceTempId: 'queue_priority', targetTempId: 'queue_main', type: 'arrow', label: 'variant of' },
      { sourceTempId: 'queue_deque', targetTempId: 'queue_main', type: 'arrow', label: 'variant of' },
      { sourceTempId: 'queue_app_bfs', targetTempId: 'queue_main', type: 'arrow', label: 'uses' },
      { sourceTempId: 'queue_app_cpu', targetTempId: 'queue_main', type: 'arrow', label: 'uses' },
      { sourceTempId: 'queue_app_printer', targetTempId: 'queue_main', type: 'arrow', label: 'uses' },
      { sourceTempId: 'queue_main', targetTempId: 'queue_complexity', type: 'arrow', label: 'leads to' },
      { sourceTempId: 'queue_main', targetTempId: 'queue_example', type: 'arrow', label: 'example of' },
      { sourceTempId: 'queue_main', targetTempId: 'queue_pitfall', type: 'dashed', label: 'watch out for' },
    ];

    return { thoughts, clusters, connections };
  }

  // =========================================================================
  // STACKS IN DATA STRUCTURE
  // =========================================================================
  private getStackKnowledge(detailLevel: string): TopicMapData {
    const clusters: MapClusterSpec[] = [
      { tempId: 'cluster_core', title: 'Core Fundamentals', description: 'LIFO principle and top pointer', color: 'yellow' },
      { tempId: 'cluster_ops', title: 'Stack Operations', description: 'Push, Pop, Peek primitives', color: 'green' },
      { tempId: 'cluster_impl', title: 'Implementations', description: 'Array and Linked List representations', color: 'blue' },
      { tempId: 'cluster_apps', title: 'Applications', description: 'Call stacks, undo systems, and syntax validation', color: 'purple' },
      { tempId: 'cluster_perf', title: 'Complexity & Pitfalls', description: 'O(1) operations and overflow bugs', color: 'pink' },
    ];

    const thoughts: MapThoughtSpec[] = [
      {
        tempId: 'stack_main',
        title: 'Stack',
        content: 'Linear data structure following LIFO — Last In, First Out.\nElements are added and removed from the same end, called Top.',
        type: 'concept',
        color: 'yellow',
        role: 'main',
        clusterTempId: 'cluster_core',
      },
      {
        tempId: 'stack_lifo',
        title: 'LIFO Principle',
        content: 'Last In, First Out:\nThe most recently inserted element is always the first to be removed.',
        type: 'concept',
        color: 'yellow',
        role: 'mechanism',
        clusterTempId: 'cluster_core',
      },
      {
        tempId: 'stack_top',
        title: 'Top Pointer',
        content: 'Tracks the index or node reference of the latest element.\nIncrements on push, decrements on pop.',
        type: 'concept',
        color: 'blue',
        role: 'mechanism',
        clusterTempId: 'cluster_core',
      },
      {
        tempId: 'stack_push',
        title: 'Push',
        content: 'Adds an element to the top of the stack.\nExample: [A, B] + Push(C) → [A, B, C]. Time: O(1).',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_ops',
      },
      {
        tempId: 'stack_pop',
        title: 'Pop',
        content: 'Removes and returns the top element.\nExample: [A, B, C] → Pop() returns C, leaving [A, B]. Time: O(1).',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_ops',
      },
      {
        tempId: 'stack_peek',
        title: 'Peek',
        content: 'Inspects the top element without removing it from the stack.\nTime: O(1).',
        type: 'concept',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_ops',
      },
      {
        tempId: 'stack_array_impl',
        title: 'Array Stack',
        content: 'Fixed-size array using an integer top index.\nCache-efficient with O(1) push/pop, needing resize on capacity limit.',
        type: 'concept',
        color: 'blue',
        role: 'mechanism',
        clusterTempId: 'cluster_impl',
      },
      {
        tempId: 'stack_ll_impl',
        title: 'Linked List Stack',
        content: 'Nodes inserted and removed at the head of a linked list in O(1) time without capacity limits.',
        type: 'concept',
        color: 'blue',
        role: 'mechanism',
        clusterTempId: 'cluster_impl',
      },
      {
        tempId: 'stack_app_call',
        title: 'Function Call Stack',
        content: 'Compilers push stack frames for local variables and return addresses during recursive function calls.',
        type: 'action',
        color: 'purple',
        role: 'application',
        clusterTempId: 'cluster_apps',
      },
      {
        tempId: 'stack_app_brackets',
        title: 'Parentheses Matching',
        content: 'Validates balanced brackets ({[]}). Push opening brackets, pop and verify matching closing brackets.',
        type: 'action',
        color: 'purple',
        role: 'application',
        clusterTempId: 'cluster_apps',
      },
      {
        tempId: 'stack_app_undo',
        title: 'Undo / Redo Buffer',
        content: 'User actions are pushed onto an undo stack; undoing pops from undo and pushes to redo.',
        type: 'action',
        color: 'purple',
        role: 'application',
        clusterTempId: 'cluster_apps',
      },
      {
        tempId: 'stack_complexity',
        title: 'Stack Complexity',
        content: '• Push: O(1)\n• Pop: O(1)\n• Peek: O(1)\n• Auxiliary Space: O(N).',
        type: 'reference',
        color: 'pink',
        role: 'example',
        clusterTempId: 'cluster_perf',
      },
      {
        tempId: 'stack_pitfall',
        title: 'Stack Overflow & Underflow',
        content: '⚠️ Overflow: Exceeding allocated stack space (e.g. infinite recursion).\n⚠️ Underflow: Calling pop() on an empty stack.',
        type: 'warning',
        color: 'pink',
        role: 'example',
        clusterTempId: 'cluster_perf',
      },
    ];

    const connections: MapConnectionSpec[] = [
      { sourceTempId: 'stack_main', targetTempId: 'stack_lifo', type: 'arrow', label: 'follows' },
      { sourceTempId: 'stack_main', targetTempId: 'stack_top', type: 'arrow', label: 'contains' },
      { sourceTempId: 'stack_main', targetTempId: 'stack_push', type: 'arrow', label: 'supports' },
      { sourceTempId: 'stack_main', targetTempId: 'stack_pop', type: 'arrow', label: 'supports' },
      { sourceTempId: 'stack_main', targetTempId: 'stack_peek', type: 'arrow', label: 'supports' },
      { sourceTempId: 'stack_main', targetTempId: 'stack_array_impl', type: 'arrow', label: 'implemented using' },
      { sourceTempId: 'stack_main', targetTempId: 'stack_ll_impl', type: 'arrow', label: 'implemented using' },
      { sourceTempId: 'stack_app_call', targetTempId: 'stack_main', type: 'arrow', label: 'uses' },
      { sourceTempId: 'stack_app_brackets', targetTempId: 'stack_main', type: 'arrow', label: 'uses' },
      { sourceTempId: 'stack_app_undo', targetTempId: 'stack_main', type: 'arrow', label: 'uses' },
      { sourceTempId: 'stack_main', targetTempId: 'stack_complexity', type: 'arrow', label: 'leads to' },
      { sourceTempId: 'stack_main', targetTempId: 'stack_pitfall', type: 'dashed', label: 'watch out for' },
    ];

    return { thoughts, clusters, connections };
  }

  // =========================================================================
  // BINARY SEARCH
  // =========================================================================
  private getBinarySearchKnowledge(detailLevel: string): TopicMapData {
    const clusters: MapClusterSpec[] = [
      { tempId: 'cluster_core', title: 'Core Invariant', description: 'Monotonic property and interval halving', color: 'yellow' },
      { tempId: 'cluster_flow', title: 'Execution Mechanics', description: 'Midpoint calculation and pointers', color: 'green' },
      { tempId: 'cluster_variants', title: 'Variants & Patterns', description: 'Bounds and monotonic search spaces', color: 'orange' },
      { tempId: 'cluster_apps', title: 'Applications', description: 'B-Trees, bisect, and range queries', color: 'purple' },
      { tempId: 'cluster_perf', title: 'Complexity & Pitfalls', description: 'O(log N) runtime and boundary bugs', color: 'pink' },
    ];

    const thoughts: MapThoughtSpec[] = [
      {
        tempId: 'bs_main',
        title: 'Binary Search',
        content: 'Divide-and-conquer search on sorted collections.\nHalves the search space at each iteration in O(log N) time.',
        type: 'concept',
        color: 'yellow',
        role: 'main',
        clusterTempId: 'cluster_core',
      },
      {
        tempId: 'bs_sorted',
        title: 'Monotonic Invariant',
        content: 'Requires input array to be sorted or satisfy a monotonic boolean condition: F F F T T T.',
        type: 'concept',
        color: 'yellow',
        role: 'mechanism',
        clusterTempId: 'cluster_core',
      },
      {
        tempId: 'bs_midpoint',
        title: 'Safe Midpoint Calculation',
        content: 'mid = low + (high - low) // 2\nPrevents 32-bit integer overflow caused by (low + high) // 2.',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_flow',
      },
      {
        tempId: 'bs_halving',
        title: 'Interval Halving',
        content: '• target == arr[mid] → Found\n• target < arr[mid] → high = mid - 1\n• target > arr[mid] → low = mid + 1',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_flow',
      },
      {
        tempId: 'bs_bounds',
        title: 'Lower & Upper Bound',
        content: '• Lower Bound: First index where arr[i] >= target.\n• Upper Bound: First index where arr[i] > target.',
        type: 'concept',
        color: 'orange',
        role: 'mechanism',
        clusterTempId: 'cluster_variants',
      },
      {
        tempId: 'bs_on_answer',
        title: 'Binary Search on Answer',
        content: 'Search across answer range [min_ans, max_ans] using a monotonic feasibility check(x) function.',
        type: 'concept',
        color: 'orange',
        role: 'mechanism',
        clusterTempId: 'cluster_variants',
      },
      {
        tempId: 'bs_app_db',
        title: 'Database B-Tree Search',
        content: 'Database engines use binary search on indexed nodes to locate records in logarithmic time.',
        type: 'action',
        color: 'purple',
        role: 'application',
        clusterTempId: 'cluster_apps',
      },
      {
        tempId: 'bs_complexity',
        title: 'Complexity',
        content: '• Time: O(log N) worst and average case\n• Space: O(1) iterative, O(log N) recursive.',
        type: 'reference',
        color: 'pink',
        role: 'example',
        clusterTempId: 'cluster_perf',
      },
      {
        tempId: 'bs_pitfalls',
        title: 'Common Boundary Pitfalls',
        content: '⚠️ Infinite loops when updating low = mid without +1\n⚠️ Off-by-one errors with <= vs <\n⚠️ Unsorted input data.',
        type: 'warning',
        color: 'pink',
        role: 'example',
        clusterTempId: 'cluster_perf',
      },
    ];

    const connections: MapConnectionSpec[] = [
      { sourceTempId: 'bs_main', targetTempId: 'bs_sorted', type: 'arrow', label: 'requires' },
      { sourceTempId: 'bs_main', targetTempId: 'bs_midpoint', type: 'arrow', label: 'computes' },
      { sourceTempId: 'bs_main', targetTempId: 'bs_halving', type: 'arrow', label: 'executes via' },
      { sourceTempId: 'bs_bounds', targetTempId: 'bs_main', type: 'arrow', label: 'variant of' },
      { sourceTempId: 'bs_on_answer', targetTempId: 'bs_main', type: 'arrow', label: 'variant of' },
      { sourceTempId: 'bs_app_db', targetTempId: 'bs_main', type: 'arrow', label: 'uses' },
      { sourceTempId: 'bs_main', targetTempId: 'bs_complexity', type: 'arrow', label: 'leads to' },
      { sourceTempId: 'bs_main', targetTempId: 'bs_pitfalls', type: 'dashed', label: 'watch out for' },
    ];

    return { thoughts, clusters, connections };
  }

  // =========================================================================
  // LINKED LISTS
  // =========================================================================
  private getLinkedListKnowledge(detailLevel: string): TopicMapData {
    const clusters: MapClusterSpec[] = [
      { tempId: 'cluster_core', title: 'Node Concept & Links', color: 'yellow' },
      { tempId: 'cluster_types', title: 'List Types', color: 'orange' },
      { tempId: 'cluster_ops', title: 'Pointer Operations', color: 'green' },
      { tempId: 'cluster_perf', title: 'Complexity & Traps', color: 'pink' },
    ];

    const thoughts: MapThoughtSpec[] = [
      {
        tempId: 'll_main',
        title: 'Linked List',
        content: 'Linear collection of data nodes linked via pointer references rather than contiguous memory.',
        type: 'concept',
        color: 'yellow',
        role: 'main',
        clusterTempId: 'cluster_core',
      },
      {
        tempId: 'll_node',
        title: 'Node Structure',
        content: 'Contains data value and pointer (next) to subsequent node address.',
        type: 'concept',
        color: 'yellow',
        role: 'mechanism',
        clusterTempId: 'cluster_core',
      },
      {
        tempId: 'll_singly',
        title: 'Singly Linked List',
        content: 'Unidirectional nodes pointing forward from head to tail.',
        type: 'concept',
        color: 'orange',
        role: 'mechanism',
        clusterTempId: 'cluster_types',
      },
      {
        tempId: 'll_doubly',
        title: 'Doubly Linked List',
        content: 'Bidirectional nodes holding next and prev pointers. Allows O(1) node deletion.',
        type: 'concept',
        color: 'orange',
        role: 'mechanism',
        clusterTempId: 'cluster_types',
      },
      {
        tempId: 'll_reversal',
        title: 'List Reversal',
        content: 'prev = null, curr = head. curr.next = prev; prev = curr; curr = next.',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_ops',
      },
      {
        tempId: 'll_fast_slow',
        title: 'Floyd Cycle Detection',
        content: 'Slow pointer (1 step) and Fast pointer (2 steps) detect cycles and find middle in O(N).',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_ops',
      },
      {
        tempId: 'll_complexity',
        title: 'Linked List Complexity',
        content: '• Index Access: O(N)\n• Head Insert/Delete: O(1)\n• Space: O(N) + pointer overhead.',
        type: 'reference',
        color: 'pink',
        role: 'example',
        clusterTempId: 'cluster_perf',
      },
    ];

    const connections: MapConnectionSpec[] = [
      { sourceTempId: 'll_main', targetTempId: 'll_node', type: 'arrow', label: 'contains' },
      { sourceTempId: 'll_singly', targetTempId: 'll_main', type: 'arrow', label: 'variant of' },
      { sourceTempId: 'll_doubly', targetTempId: 'll_main', type: 'arrow', label: 'variant of' },
      { sourceTempId: 'll_main', targetTempId: 'll_reversal', type: 'arrow', label: 'supports' },
      { sourceTempId: 'll_main', targetTempId: 'll_fast_slow', type: 'arrow', label: 'supports' },
      { sourceTempId: 'll_main', targetTempId: 'll_complexity', type: 'arrow', label: 'leads to' },
    ];

    return { thoughts, clusters, connections };
  }

  // =========================================================================
  // TREES & BST
  // =========================================================================
  private getTreeKnowledge(detailLevel: string): TopicMapData {
    const clusters: MapClusterSpec[] = [
      { tempId: 'cluster_core', title: 'Tree Fundamentals', color: 'yellow' },
      { tempId: 'cluster_traversals', title: 'Traversals', color: 'green' },
      { tempId: 'cluster_bst', title: 'Binary Search Tree (BST)', color: 'orange' },
      { tempId: 'cluster_perf', title: 'Complexity & Balance', color: 'pink' },
    ];

    const thoughts: MapThoughtSpec[] = [
      {
        tempId: 'tree_main',
        title: 'Binary Tree',
        content: 'Hierarchical data structure where each node has at most two children (left and right).',
        type: 'concept',
        color: 'yellow',
        role: 'main',
        clusterTempId: 'cluster_core',
      },
      {
        tempId: 'tree_traversals',
        title: 'DFS Traversals',
        content: '• In-order: Left → Root → Right (sorted order for BST)\n• Pre-order: Root → Left → Right\n• Post-order: Left → Right → Root.',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_traversals',
      },
      {
        tempId: 'tree_bst',
        title: 'BST Invariant',
        content: 'For every node X:\nAll Left descendants < X.val < all Right descendants.',
        type: 'concept',
        color: 'orange',
        role: 'mechanism',
        clusterTempId: 'cluster_bst',
      },
      {
        tempId: 'tree_balanced',
        title: 'Self-Balancing Trees (AVL/Red-Black)',
        content: 'Rotates subtrees to maintain O(log N) height and prevent skewing into linked lists.',
        type: 'concept',
        color: 'orange',
        role: 'mechanism',
        clusterTempId: 'cluster_bst',
      },
      {
        tempId: 'tree_complexity',
        title: 'Tree Complexity',
        content: '• Balanced Search/Insert: O(log N)\n• Unbalanced Worst Case: O(N)\n• Space: O(H) recursion stack.',
        type: 'reference',
        color: 'pink',
        role: 'example',
        clusterTempId: 'cluster_perf',
      },
    ];

    const connections: MapConnectionSpec[] = [
      { sourceTempId: 'tree_main', targetTempId: 'tree_traversals', type: 'arrow', label: 'traversed via' },
      { sourceTempId: 'tree_bst', targetTempId: 'tree_main', type: 'arrow', label: 'variant of' },
      { sourceTempId: 'tree_balanced', targetTempId: 'tree_bst', type: 'arrow', label: 'solves skew in' },
      { sourceTempId: 'tree_main', targetTempId: 'tree_complexity', type: 'arrow', label: 'leads to' },
    ];

    return { thoughts, clusters, connections };
  }

  // =========================================================================
  // GRAPHS & BFS/DFS
  // =========================================================================
  private getGraphKnowledge(detailLevel: string): TopicMapData {
    const clusters: MapClusterSpec[] = [
      { tempId: 'cluster_core', title: 'Graph Models', color: 'yellow' },
      { tempId: 'cluster_traversal', title: 'Traversals', color: 'green' },
      { tempId: 'cluster_algos', title: 'Algorithms', color: 'orange' },
      { tempId: 'cluster_perf', title: 'Complexity', color: 'pink' },
    ];

    const thoughts: MapThoughtSpec[] = [
      {
        tempId: 'graph_main',
        title: 'Graph Data Structure',
        content: 'Non-linear network composed of Vertices (V) connected by Edges (E). Directed/Undirected, Weighted/Unweighted.',
        type: 'concept',
        color: 'yellow',
        role: 'main',
        clusterTempId: 'cluster_core',
      },
      {
        tempId: 'graph_bfs',
        title: 'BFS (Breadth-First Search)',
        content: 'Explores level by level using a FIFO Queue. Guarantees shortest path in unweighted graphs. Time: O(V + E).',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_traversal',
      },
      {
        tempId: 'graph_dfs',
        title: 'DFS (Depth-First Search)',
        content: 'Explores deeply along paths using Recursion / Stack. Time: O(V + E).',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_traversal',
      },
      {
        tempId: 'graph_dijkstra',
        title: "Dijkstra's Algorithm",
        content: 'Finds single-source shortest path on weighted non-negative graphs using Min-Heap in O(E log V).',
        type: 'action',
        color: 'orange',
        role: 'mechanism',
        clusterTempId: 'cluster_algos',
      },
      {
        tempId: 'graph_complexity',
        title: 'Graph Complexity',
        content: '• BFS/DFS: O(V + E) time, O(V) space\n• Adjacency List Space: O(V + E).',
        type: 'reference',
        color: 'pink',
        role: 'example',
        clusterTempId: 'cluster_perf',
      },
    ];

    const connections: MapConnectionSpec[] = [
      { sourceTempId: 'graph_main', targetTempId: 'graph_bfs', type: 'arrow', label: 'traversed via' },
      { sourceTempId: 'graph_main', targetTempId: 'graph_dfs', type: 'arrow', label: 'traversed via' },
      { sourceTempId: 'graph_dijkstra', targetTempId: 'graph_main', type: 'arrow', label: 'solves shortest path on' },
      { sourceTempId: 'graph_main', targetTempId: 'graph_complexity', type: 'arrow', label: 'leads to' },
    ];

    return { thoughts, clusters, connections };
  }

  // =========================================================================
  // DYNAMIC PROGRAMMING
  // =========================================================================
  private getDynamicProgrammingKnowledge(detailLevel: string): TopicMapData {
    const clusters: MapClusterSpec[] = [
      { tempId: 'cluster_core', title: 'DP Principles', color: 'yellow' },
      { tempId: 'cluster_patterns', title: 'DP Approaches', color: 'green' },
      { tempId: 'cluster_classic', title: 'Classic Problems', color: 'orange' },
    ];

    const thoughts: MapThoughtSpec[] = [
      {
        tempId: 'dp_main',
        title: 'Dynamic Programming',
        content: 'Optimization technique that solves problems by breaking them into overlapping subproblems and caching results.',
        type: 'concept',
        color: 'yellow',
        role: 'main',
        clusterTempId: 'cluster_core',
      },
      {
        tempId: 'dp_principles',
        title: 'Overlapping Subproblems & Optimal Substructure',
        content: '1. Overlapping Subproblems: Same subproblems solved repeatedly.\n2. Optimal Substructure: Global optimal contains subproblem optimals.',
        type: 'concept',
        color: 'yellow',
        role: 'mechanism',
        clusterTempId: 'cluster_core',
      },
      {
        tempId: 'dp_memoization',
        title: 'Top-Down Memoization',
        content: 'Recursive approach that checks a cache array or hash table before computing subproblem results.',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_patterns',
      },
      {
        tempId: 'dp_tabulation',
        title: 'Bottom-Up Tabulation',
        content: 'Iterative approach that fills a DP table starting from base cases to target state.',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_patterns',
      },
      {
        tempId: 'dp_knapsack',
        title: '0/1 Knapsack Problem',
        content: 'Max value under weight capacity: dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w-wt[i]]).',
        type: 'concept',
        color: 'orange',
        role: 'mechanism',
        clusterTempId: 'cluster_classic',
      },
    ];

    const connections: MapConnectionSpec[] = [
      { sourceTempId: 'dp_main', targetTempId: 'dp_principles', type: 'arrow', label: 'requires' },
      { sourceTempId: 'dp_main', targetTempId: 'dp_memoization', type: 'arrow', label: 'implemented via' },
      { sourceTempId: 'dp_main', targetTempId: 'dp_tabulation', type: 'arrow', label: 'implemented via' },
      { sourceTempId: 'dp_knapsack', targetTempId: 'dp_main', type: 'arrow', label: 'example of' },
    ];

    return { thoughts, clusters, connections };
  }

  // =========================================================================
  // HASH MAPS
  // =========================================================================
  private getHashMapKnowledge(detailLevel: string): TopicMapData {
    const clusters: MapClusterSpec[] = [
      { tempId: 'cluster_core', title: 'Hashing Principles', color: 'yellow' },
      { tempId: 'cluster_collision', title: 'Collision Handling', color: 'blue' },
      { tempId: 'cluster_perf', title: 'Complexity & Load Factor', color: 'pink' },
    ];

    const thoughts: MapThoughtSpec[] = [
      {
        tempId: 'hash_main',
        title: 'Hash Map (Hash Table)',
        content: 'Associative key-value structure offering average O(1) lookup, insert, and delete using a hash function.',
        type: 'concept',
        color: 'yellow',
        role: 'main',
        clusterTempId: 'cluster_core',
      },
      {
        tempId: 'hash_chaining',
        title: 'Separate Chaining',
        content: 'Buckets store linked lists to hold keys that hash to the same index.',
        type: 'concept',
        color: 'blue',
        role: 'mechanism',
        clusterTempId: 'cluster_collision',
      },
      {
        tempId: 'hash_open',
        title: 'Open Addressing',
        content: 'Probes subsequent slots (linear, quadratic) in the array upon collision.',
        type: 'concept',
        color: 'blue',
        role: 'mechanism',
        clusterTempId: 'cluster_collision',
      },
      {
        tempId: 'hash_complexity',
        title: 'Complexity & Load Factor',
        content: '• Average: O(1)\n• Worst Case: O(N) when all keys collide\n• Rehashes when load factor > 0.75.',
        type: 'reference',
        color: 'pink',
        role: 'example',
        clusterTempId: 'cluster_perf',
      },
    ];

    const connections: MapConnectionSpec[] = [
      { sourceTempId: 'hash_main', targetTempId: 'hash_chaining', type: 'arrow', label: 'solves collisions via' },
      { sourceTempId: 'hash_main', targetTempId: 'hash_open', type: 'arrow', label: 'solves collisions via' },
      { sourceTempId: 'hash_main', targetTempId: 'hash_complexity', type: 'arrow', label: 'leads to' },
    ];

    return { thoughts, clusters, connections };
  }

  // =========================================================================
  // SORTING ALGORITHMS
  // =========================================================================
  private getSortingKnowledge(detailLevel: string): TopicMapData {
    const clusters: MapClusterSpec[] = [
      { tempId: 'cluster_core', title: 'Sorting Principles', color: 'yellow' },
      { tempId: 'cluster_algos', title: 'Algorithms', color: 'green' },
      { tempId: 'cluster_perf', title: 'Complexity Bounds', color: 'pink' },
    ];

    const thoughts: MapThoughtSpec[] = [
      {
        tempId: 'sort_main',
        title: 'Sorting Algorithms',
        content: 'Rearranges list elements into monotonic ascending or descending order.',
        type: 'concept',
        color: 'yellow',
        role: 'main',
        clusterTempId: 'cluster_core',
      },
      {
        tempId: 'sort_mergesort',
        title: 'Merge Sort',
        content: 'Divide-and-conquer sort with guaranteed O(N log N) time and stability. Auxiliary space: O(N).',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_algos',
      },
      {
        tempId: 'sort_quicksort',
        title: 'Quick Sort',
        content: 'Partitions around a pivot in-place. Average O(N log N), worst case O(N^2).',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_algos',
      },
      {
        tempId: 'sort_bounds',
        title: 'Comparison Lower Bound: Ω(N log N)',
        content: 'Decision tree analysis proves no comparison sort can beat O(N log N) worst-case time.',
        type: 'reference',
        color: 'pink',
        role: 'example',
        clusterTempId: 'cluster_perf',
      },
    ];

    const connections: MapConnectionSpec[] = [
      { sourceTempId: 'sort_mergesort', targetTempId: 'sort_main', type: 'arrow', label: 'variant of' },
      { sourceTempId: 'sort_quicksort', targetTempId: 'sort_main', type: 'arrow', label: 'variant of' },
      { sourceTempId: 'sort_main', targetTempId: 'sort_bounds', type: 'arrow', label: 'bounded by' },
    ];

    return { thoughts, clusters, connections };
  }

  // =========================================================================
  // REACT HOOKS
  // =========================================================================
  private getReactKnowledge(detailLevel: string): TopicMapData {
    const clusters: MapClusterSpec[] = [
      { tempId: 'cluster_core', title: 'Core Principles', color: 'yellow' },
      { tempId: 'cluster_hooks', title: 'Essential Hooks', color: 'green' },
      { tempId: 'cluster_perf', title: 'Performance & Rules', color: 'pink' },
    ];

    const thoughts: MapThoughtSpec[] = [
      {
        tempId: 'react_main',
        title: 'React Hooks & State',
        content: 'Functional state management and lifecycle hooks without writing class components.',
        type: 'concept',
        color: 'yellow',
        role: 'main',
        clusterTempId: 'cluster_core',
      },
      {
        tempId: 'react_state',
        title: 'useState & useEffect',
        content: '• useState: Manages local component state.\n• useEffect: Synchronizes with external systems and side-effects.',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_hooks',
      },
      {
        tempId: 'react_perf',
        title: 'useMemo & useCallback',
        content: 'Caches expensive computation results and function references across component re-renders.',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_hooks',
      },
      {
        tempId: 'react_rules',
        title: 'Rules of Hooks',
        content: 'Call hooks only at top level of React functions, never in loops or conditional blocks.',
        type: 'warning',
        color: 'pink',
        role: 'example',
        clusterTempId: 'cluster_perf',
      },
    ];

    const connections: MapConnectionSpec[] = [
      { sourceTempId: 'react_main', targetTempId: 'react_state', type: 'arrow', label: 'provides' },
      { sourceTempId: 'react_main', targetTempId: 'react_perf', type: 'arrow', label: 'provides' },
      { sourceTempId: 'react_main', targetTempId: 'react_rules', type: 'dashed', label: 'governed by' },
    ];

    return { thoughts, clusters, connections };
  }

  // =========================================================================
  // REST APIS
  // =========================================================================
  private getRestApiKnowledge(detailLevel: string): TopicMapData {
    const clusters: MapClusterSpec[] = [
      { tempId: 'cluster_core', title: 'REST Architecture', color: 'yellow' },
      { tempId: 'cluster_verbs', title: 'HTTP Methods', color: 'green' },
      { tempId: 'cluster_status', title: 'Status Codes', color: 'blue' },
    ];

    const thoughts: MapThoughtSpec[] = [
      {
        tempId: 'rest_main',
        title: 'REST API Architecture',
        content: 'Stateless, resource-oriented client-server architecture using standard HTTP protocols.',
        type: 'concept',
        color: 'yellow',
        role: 'main',
        clusterTempId: 'cluster_core',
      },
      {
        tempId: 'rest_verbs',
        title: 'HTTP Methods',
        content: '• GET: Read (Safe, Idempotent)\n• POST: Create\n• PUT: Replace (Idempotent)\n• DELETE: Remove.',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_verbs',
      },
      {
        tempId: 'rest_codes',
        title: 'Status Codes',
        content: '• 200 OK / 201 Created\n• 400 Bad Request / 401 Unauthorized / 404 Not Found\n• 500 Server Error.',
        type: 'reference',
        color: 'blue',
        role: 'mechanism',
        clusterTempId: 'cluster_status',
      },
    ];

    const connections: MapConnectionSpec[] = [
      { sourceTempId: 'rest_main', targetTempId: 'rest_verbs', type: 'arrow', label: 'uses' },
      { sourceTempId: 'rest_main', targetTempId: 'rest_codes', type: 'arrow', label: 'returns' },
    ];

    return { thoughts, clusters, connections };
  }

  // =========================================================================
  // DATABASE DESIGN & SQL
  // =========================================================================
  private getDatabaseKnowledge(detailLevel: string): TopicMapData {
    const clusters: MapClusterSpec[] = [
      { tempId: 'cluster_core', title: 'Relational Design', color: 'yellow' },
      { tempId: 'cluster_index', title: 'B-Tree Indexing', color: 'blue' },
      { tempId: 'cluster_acid', title: 'ACID Transactions', color: 'pink' },
    ];

    const thoughts: MapThoughtSpec[] = [
      {
        tempId: 'db_main',
        title: 'Database Indexing & Design',
        content: 'Structuring data into relational tables with B-Tree indexes for high-speed queries.',
        type: 'concept',
        color: 'yellow',
        role: 'main',
        clusterTempId: 'cluster_core',
      },
      {
        tempId: 'db_norm',
        title: 'Normalization (1NF, 2NF, 3NF)',
        content: 'Eliminates data redundancy and insertion/deletion anomalies across relational schemas.',
        type: 'action',
        color: 'yellow',
        role: 'mechanism',
        clusterTempId: 'cluster_core',
      },
      {
        tempId: 'db_btree',
        title: 'B-Tree Indexing',
        content: 'Self-balancing tree that optimizes range scans and lookups in O(log N) disk reads.',
        type: 'concept',
        color: 'blue',
        role: 'mechanism',
        clusterTempId: 'cluster_index',
      },
      {
        tempId: 'db_acid',
        title: 'ACID Guarantees',
        content: 'Atomicity, Consistency, Isolation, and Durability ensure reliable transaction processing.',
        type: 'reference',
        color: 'pink',
        role: 'mechanism',
        clusterTempId: 'cluster_acid',
      },
    ];

    const connections: MapConnectionSpec[] = [
      { sourceTempId: 'db_main', targetTempId: 'db_norm', type: 'arrow', label: 'structured via' },
      { sourceTempId: 'db_main', targetTempId: 'db_btree', type: 'arrow', label: 'indexed via' },
      { sourceTempId: 'db_main', targetTempId: 'db_acid', type: 'arrow', label: 'guarantees' },
    ];

    return { thoughts, clusters, connections };
  }

  // =========================================================================
  // PHOTOSYNTHESIS
  // =========================================================================
  private getPhotosynthesisKnowledge(detailLevel: string): TopicMapData {
    const clusters: MapClusterSpec[] = [
      { tempId: 'cluster_core', title: 'Core Biochemical Reaction', color: 'yellow' },
      { tempId: 'cluster_light', title: 'Light Reactions', color: 'green' },
      { tempId: 'cluster_dark', title: 'Calvin Cycle', color: 'blue' },
    ];

    const thoughts: MapThoughtSpec[] = [
      {
        tempId: 'photo_main',
        title: 'Photosynthesis',
        content: 'Process where plants convert light energy into glucose:\n6CO2 + 6H2O + Light → C6H12O6 + 6O2.',
        type: 'concept',
        color: 'yellow',
        role: 'main',
        clusterTempId: 'cluster_core',
      },
      {
        tempId: 'photo_light',
        title: 'Thylakoid Light Reactions',
        content: 'Photons split H2O in chloroplast thylakoids, releasing O2 and generating ATP/NADPH.',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_light',
      },
      {
        tempId: 'photo_calvin',
        title: 'Calvin Cycle (Stroma)',
        content: 'RuBisCO fixes atmospheric CO2 into G3P sugars using ATP and NADPH energy.',
        type: 'action',
        color: 'blue',
        role: 'mechanism',
        clusterTempId: 'cluster_dark',
      },
    ];

    const connections: MapConnectionSpec[] = [
      { sourceTempId: 'photo_main', targetTempId: 'photo_light', type: 'arrow', label: 'initiates with' },
      { sourceTempId: 'photo_light', targetTempId: 'photo_calvin', type: 'arrow', label: 'fuels via ATP/NADPH' },
    ];

    return { thoughts, clusters, connections };
  }

  // =========================================================================
  // NEWTON'S LAWS OF MOTION
  // =========================================================================
  private getNewtonLawsKnowledge(detailLevel: string): TopicMapData {
    const clusters: MapClusterSpec[] = [
      { tempId: 'cluster_core', title: 'Classical Mechanics', color: 'yellow' },
      { tempId: 'cluster_laws', title: 'The Three Laws', color: 'green' },
    ];

    const thoughts: MapThoughtSpec[] = [
      {
        tempId: 'newton_main',
        title: "Newton's Laws of Motion",
        content: 'Foundational laws governing the physical relationship between forces and bodies in motion.',
        type: 'concept',
        color: 'yellow',
        role: 'main',
        clusterTempId: 'cluster_core',
      },
      {
        tempId: 'newton_first',
        title: 'First Law: Inertia',
        content: 'An object remains at rest or in uniform motion unless acted upon by a net external force.',
        type: 'concept',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_laws',
      },
      {
        tempId: 'newton_second',
        title: 'Second Law: F = m · a',
        content: 'Net force equals mass times acceleration (F = ma) or rate of change of momentum.',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_laws',
      },
      {
        tempId: 'newton_third',
        title: 'Third Law: Action & Reaction',
        content: 'For every action force, there is an equal and opposite reaction force acting on separate bodies.',
        type: 'concept',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_laws',
      },
    ];

    const connections: MapConnectionSpec[] = [
      { sourceTempId: 'newton_main', targetTempId: 'newton_first', type: 'arrow', label: 'defines' },
      { sourceTempId: 'newton_main', targetTempId: 'newton_second', type: 'arrow', label: 'defines' },
      { sourceTempId: 'newton_main', targetTempId: 'newton_third', type: 'arrow', label: 'defines' },
    ];

    return { thoughts, clusters, connections };
  }

  // =========================================================================
  // MICROSERVICES ARCHITECTURE
  // =========================================================================
  private getMicroservicesKnowledge(detailLevel: string): TopicMapData {
    const clusters: MapClusterSpec[] = [
      { tempId: 'cluster_core', title: 'Microservices Architecture', color: 'yellow' },
      { tempId: 'cluster_patterns', title: 'Patterns & Resilience', color: 'green' },
      { tempId: 'cluster_tradeoffs', title: 'Trade-offs', color: 'pink' },
    ];

    const thoughts: MapThoughtSpec[] = [
      {
        tempId: 'ms_main',
        title: 'Microservices Architecture',
        content: 'Structuring an application as loosely-coupled, independently deployable services around business domains.',
        type: 'concept',
        color: 'yellow',
        role: 'main',
        clusterTempId: 'cluster_core',
      },
      {
        tempId: 'ms_gateway',
        title: 'API Gateway & DB-per-Service',
        content: 'Clients route through a single gateway; each service owns its private database.',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_patterns',
      },
      {
        tempId: 'ms_circuit',
        title: 'Circuit Breaker & Sagas',
        content: 'Prevents cascading outages and coordinates distributed transactions via compensating actions.',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_patterns',
      },
      {
        tempId: 'ms_tradeoffs',
        title: 'Distributed System Complexity',
        content: 'Requires distributed tracing, eventual consistency management, and automated container orchestration.',
        type: 'warning',
        color: 'pink',
        role: 'example',
        clusterTempId: 'cluster_tradeoffs',
      },
    ];

    const connections: MapConnectionSpec[] = [
      { sourceTempId: 'ms_main', targetTempId: 'ms_gateway', type: 'arrow', label: 'accessed via' },
      { sourceTempId: 'ms_main', targetTempId: 'ms_circuit', type: 'arrow', label: 'resilient via' },
      { sourceTempId: 'ms_main', targetTempId: 'ms_tradeoffs', type: 'dashed', label: 'involves trade-offs in' },
    ];

    return { thoughts, clusters, connections };
  }

  // =========================================================================
  // UNIVERSAL DYNAMIC KNOWLEDGE SYNTHESIZER
  // =========================================================================
  private synthesizeUniversalTopic(
    topic: string,
    detailLevel: string,
    mapType: string,
    userInstructions?: string
  ): TopicMapData {
    const formatted = topic.trim().replace(/^([a-z])/, (m) => m.toUpperCase());

    const clusters: MapClusterSpec[] = [
      { tempId: 'cluster_core', title: 'Core Fundamentals', description: 'Central definitions and primary invariants', color: 'yellow' },
      { tempId: 'cluster_mechanisms', title: 'Key Mechanisms & Operations', description: 'How it executes and transforms state', color: 'green' },
      { tempId: 'cluster_structure', title: 'Architecture & Implementations', description: 'Internal components and structural design', color: 'blue' },
      { tempId: 'cluster_variants', title: 'Types & Classifications', description: 'Specialized variations and alternative models', color: 'orange' },
      { tempId: 'cluster_applications', title: 'Applications & Use Cases', description: 'Practical scenarios and system integrations', color: 'purple' },
      { tempId: 'cluster_tradeoffs', title: 'Complexity & Pitfalls', description: 'Performance limits and critical edge cases', color: 'pink' },
    ];

    const thoughts: MapThoughtSpec[] = [
      {
        tempId: 'syn_main',
        title: formatted,
        content: `**Core Definition**\nPrimary conceptual model and foundational definition of ${formatted}.\nActs as the central anchor for related concepts.`,
        type: 'concept',
        color: 'yellow',
        role: 'main',
        clusterTempId: 'cluster_core',
        tags: [topic.toLowerCase().replace(/\s+/g, '-'), 'core'],
      },
      {
        tempId: 'syn_invariant',
        title: `${formatted} Principle`,
        content: `**Governing Principle**\nCore invariant and baseline rules that ${formatted} enforces during execution.`,
        type: 'concept',
        color: 'yellow',
        role: 'mechanism',
        clusterTempId: 'cluster_core',
      },
      {
        tempId: 'syn_terminology',
        title: 'Essential Terminology',
        content: 'Foundational vocabulary, state flags, and primary parameters required to understand the domain.',
        type: 'reference',
        color: 'blue',
        role: 'prerequisite',
        clusterTempId: 'cluster_core',
      },
      {
        tempId: 'syn_lifecycle',
        title: 'Lifecycle & Workflow',
        content: 'Step-by-step execution path:\n1. Initialization of baseline state\n2. Progressive state transition\n3. Convergence to result.',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_mechanisms',
      },
      {
        tempId: 'syn_primary_op',
        title: 'Core Operations',
        content: 'Standard access and manipulation methods executed on the system with defined inputs and outputs.',
        type: 'action',
        color: 'green',
        role: 'mechanism',
        clusterTempId: 'cluster_mechanisms',
      },
      {
        tempId: 'syn_architecture',
        title: 'Internal Architecture',
        content: 'Underlying component layout, memory structure, and data relationships powering the system.',
        type: 'concept',
        color: 'blue',
        role: 'mechanism',
        clusterTempId: 'cluster_structure',
      },
      {
        tempId: 'syn_variant',
        title: 'Specialized Variants',
        content: 'Alternative forms optimized for specific constraints like high throughput or minimal space overhead.',
        type: 'concept',
        color: 'orange',
        role: 'mechanism',
        clusterTempId: 'cluster_variants',
      },
      {
        tempId: 'syn_apps',
        title: 'Practical Applications',
        content: 'Where this concept is applied in production software, science, or domain problem-solving.',
        type: 'action',
        color: 'purple',
        role: 'application',
        clusterTempId: 'cluster_applications',
      },
      {
        tempId: 'syn_complexity',
        title: 'Complexity & Trade-offs',
        content: '• Computational Cost: Time & space resource bounds\n• Trade-offs: Latency vs simplicity vs flexibility.',
        type: 'reference',
        color: 'pink',
        role: 'example',
        clusterTempId: 'cluster_tradeoffs',
      },
      {
        tempId: 'syn_pitfalls',
        title: 'Common Pitfalls',
        content: '⚠️ Edge case failures on empty or boundary conditions\n⚠️ Resource leaks or unhandled error states.',
        type: 'warning',
        color: 'pink',
        role: 'example',
        clusterTempId: 'cluster_tradeoffs',
      },
    ];

    const connections: MapConnectionSpec[] = [
      { sourceTempId: 'syn_main', targetTempId: 'syn_invariant', type: 'arrow', label: 'follows' },
      { sourceTempId: 'syn_main', targetTempId: 'syn_terminology', type: 'arrow', label: 'contains' },
      { sourceTempId: 'syn_main', targetTempId: 'syn_lifecycle', type: 'arrow', label: 'executes via' },
      { sourceTempId: 'syn_main', targetTempId: 'syn_primary_op', type: 'arrow', label: 'supports' },
      { sourceTempId: 'syn_main', targetTempId: 'syn_architecture', type: 'arrow', label: 'structured as' },
      { sourceTempId: 'syn_variant', targetTempId: 'syn_main', type: 'arrow', label: 'variant of' },
      { sourceTempId: 'syn_apps', targetTempId: 'syn_main', type: 'arrow', label: 'uses' },
      { sourceTempId: 'syn_main', targetTempId: 'syn_complexity', type: 'arrow', label: 'leads to' },
      { sourceTempId: 'syn_main', targetTempId: 'syn_pitfalls', type: 'dashed', label: 'watch out for' },
    ];

    return { thoughts, clusters, connections };
  }
}

export const globalKnowledgeEngine = new KnowledgeEngine();