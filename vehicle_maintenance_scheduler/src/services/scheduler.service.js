const depotService = require('./depot.service');
const vehicleService = require('./vehicle.service');
const { solveKnapsack } = require('../algorithms/knapsack');
const logger = require('../utils/logger');

async function generateSchedule() {
  logger.info('Generating vehicle maintenance schedules...');
  
  const [depotsRaw, tasksRaw] = await Promise.all([
    depotService.getDepots(),
    vehicleService.getTasks()
  ]);

  if (!Array.isArray(depotsRaw)) {
    throw new Error('Invalid depots data received: expected an array');
  }
  if (!Array.isArray(tasksRaw)) {
    throw new Error('Invalid vehicles/tasks data received: expected an array');
  }

  logger.info(`Processing schedule for ${depotsRaw.length} depots using ${tasksRaw.length} tasks.`);

  const depotSchedules = depotsRaw.map(depot => {
    const depotId = depot.DepotID !== undefined ? depot.DepotID : (depot.depotId !== undefined ? depot.depotId : (depot.id !== undefined ? depot.id : 'UNKNOWN'));
    const mechanicHours = depot.MechanicHours !== undefined ? Number(depot.MechanicHours) : (depot.mechanicHours !== undefined ? Number(depot.mechanicHours) : 0);

    const result = solveKnapsack(mechanicHours, tasksRaw);

    return {
      depotId,
      mechanicHours,
      selectedTasks: result.selectedTasks,
      totalDuration: result.totalDuration,
      totalImpact: result.totalImpact,
      unusedHours: result.unusedHours
    };
  });

  let totalMechanicHours = 0;
  let totalDurationAllocated = 0;
  let totalImpactAchieved = 0;
  let totalTasksScheduled = 0;

  depotSchedules.forEach(sched => {
    totalMechanicHours += sched.mechanicHours;
    totalDurationAllocated += sched.totalDuration;
    totalImpactAchieved += sched.totalImpact;
    totalTasksScheduled += sched.selectedTasks.length;
  });

  const response = {
    summary: {
      totalDepots: depotSchedules.length,
      totalAvailableMechanicHours: Number(totalMechanicHours.toFixed(4)),
      totalScheduledTasks: totalTasksScheduled,
      totalDurationAllocated: Number(totalDurationAllocated.toFixed(4)),
      totalImpactAchieved: Number(totalImpactAchieved.toFixed(4)),
      totalUnusedMechanicHours: Number((totalMechanicHours - totalDurationAllocated).toFixed(4))
    },
    depots: depotSchedules
  };

  logger.info('Successfully generated scheduling optimization results.');
  return response;
}

module.exports = { generateSchedule };
