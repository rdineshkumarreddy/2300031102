const { solveKnapsack } = require('../algorithms/knapsack');

const tests = [
  {
    name: 'Standard Knapsack 0/1 Test',
    capacity: 8,
    tasks: [
      { TaskID: 'T1', Duration: 2, Impact: 10 },
      { TaskID: 'T2', Duration: 4, Impact: 30 },
      { TaskID: 'T3', Duration: 3, Impact: 15 },
      { TaskID: 'T4', Duration: 5, Impact: 40 }
    ],
    expected: {
      totalDuration: 8,
      totalImpact: 55,
      selectedIds: ['T3', 'T4']
    }
  },
  {
    name: 'Decimal Capacity and Weights Test',
    capacity: 6.5,
    tasks: [
      { TaskID: 'T1', Duration: 2.5, Impact: 20 },
      { TaskID: 'T2', Duration: 4.0, Impact: 35 },
      { TaskID: 'T3', Duration: 1.5, Impact: 10 }
    ],
    expected: {
      totalDuration: 6.5,
      totalImpact: 55,
      selectedIds: ['T1', 'T2']
    }
  },
  {
    name: 'Empty Tasks Test',
    capacity: 10,
    tasks: [],
    expected: {
      totalDuration: 0,
      totalImpact: 0,
      selectedIds: []
    }
  },
  {
    name: 'Over Capacity Tasks Test',
    capacity: 2,
    tasks: [
      { TaskID: 'T1', Duration: 5, Impact: 100 },
      { TaskID: 'T2', Duration: 3, Impact: 50 }
    ],
    expected: {
      totalDuration: 0,
      totalImpact: 0,
      selectedIds: []
    }
  },
  {
    name: 'Invalid/Negative Filter Test',
    capacity: 10,
    tasks: [
      { TaskID: 'T1', Duration: -2, Impact: 10 },
      { TaskID: 'T2', Duration: 4, Impact: -20 },
      { TaskID: 'T3', Duration: 5, Impact: 15 }
    ],
    expected: {
      totalDuration: 5,
      totalImpact: 15,
      selectedIds: ['T3']
    }
  }
];

let passedCount = 0;

tests.forEach((t) => {
  const result = solveKnapsack(t.capacity, t.tasks);
  
  const selectedIds = result.selectedTasks.map(x => x.TaskID || x.taskId || x.id);
  const selectedIdsMatch = JSON.stringify(selectedIds.sort()) === JSON.stringify(t.expected.selectedIds.sort());
  const durationMatch = result.totalDuration === t.expected.totalDuration;
  const impactMatch = result.totalImpact === t.expected.totalImpact;

  if (selectedIdsMatch && durationMatch && impactMatch) {
    process.stdout.write(`[PASS] ${t.name}\n`);
    passedCount++;
  } else {
    process.stderr.write(`[FAIL] ${t.name}\n`);
    process.stderr.write(`Expected: ${JSON.stringify(t.expected)}\n`);
    process.stderr.write(`Got: ${JSON.stringify({ totalDuration: result.totalDuration, totalImpact: result.totalImpact, selectedIds })}\n`);
  }
});

process.stdout.write(`\nTest results: ${passedCount}/${tests.length} tests passed.\n`);
if (passedCount !== tests.length) {
  process.exit(1);
}
