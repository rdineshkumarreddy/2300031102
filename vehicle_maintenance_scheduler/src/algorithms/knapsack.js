/**
 * Solves the 0/1 Knapsack problem for a single depot's MechanicHours capacity.
 * @param {number} capacity - The available mechanic hours for the depot.
 * @param {Array} tasks - Array of maintenance tasks.
 * @returns {Object} - Object containing selected tasks, total duration, total impact, and unused hours.
 */
function solveKnapsack(capacity, tasks) {
  // Normalize and filter tasks to make sure they are valid
  const normalizedTasks = tasks
    .map(task => {
      const id = task.TaskID !== undefined ? task.TaskID : (task.taskId !== undefined ? task.taskId : task.id);
      const dur = task.Duration !== undefined ? Number(task.Duration) : (task.duration !== undefined ? Number(task.duration) : 0);
      const imp = task.Impact !== undefined ? Number(task.Impact) : (task.impact !== undefined ? Number(task.impact) : 0);
      return { original: task, id, duration: dur, impact: imp };
    })
    .filter(t => t.id !== undefined && t.duration > 0 && t.impact >= 0);

  if (normalizedTasks.length === 0 || capacity <= 0) {
    return {
      selectedTasks: [],
      totalDuration: 0,
      totalImpact: 0,
      unusedHours: capacity
    };
  }

  // Handle decimal capacities/durations by scaling
  let scale = 1;
  const allNumbers = [capacity, ...normalizedTasks.map(t => t.duration)];
  for (const num of allNumbers) {
    const str = num.toString();
    if (str.includes('.')) {
      const decimals = str.split('.')[1].length;
      const currentScale = Math.pow(10, decimals);
      if (currentScale > scale) {
        scale = currentScale;
      }
    }
  }

  // Scale capacity and task durations to integers
  const W = Math.round(capacity * scale);
  const n = normalizedTasks.length;
  const weights = normalizedTasks.map(t => Math.round(t.duration * scale));
  const values = normalizedTasks.map(t => t.impact);

  // Initialize DP table
  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const w_item = weights[i - 1];
    const val_item = values[i - 1];
    for (let w = 0; w <= W; w++) {
      if (w_item <= w) {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - w_item] + val_item);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  // Backtrack to find the selected items
  const selectedTasks = [];
  let w = W;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selectedTasks.push(normalizedTasks[i - 1].original);
      w -= weights[i - 1];
    }
  }

  selectedTasks.reverse();

  const totalDuration = selectedTasks.reduce((sum, t) => {
    const dur = t.Duration !== undefined ? Number(t.Duration) : (t.duration !== undefined ? Number(t.duration) : 0);
    return sum + dur;
  }, 0);

  const totalImpact = selectedTasks.reduce((sum, t) => {
    const imp = t.Impact !== undefined ? Number(t.Impact) : (t.impact !== undefined ? Number(t.impact) : 0);
    return sum + imp;
  }, 0);

  const unusedHours = Number((capacity - totalDuration).toFixed(4));

  return {
    selectedTasks,
    totalDuration,
    totalImpact,
    unusedHours
  };
}

module.exports = { solveKnapsack };
