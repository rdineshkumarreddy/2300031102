const schedulerService = require('../services/scheduler.service');
const { solveKnapsack } = require('../algorithms/knapsack');
const logger = require('../utils/logger');

const getSchedule = async (req, res, next) => {
  try {
    const result = await schedulerService.generateSchedule();
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const postSchedule = (req, res, next) => {
  try {
    const { depots, tasks } = req.body;
    logger.info(`Generating dynamic schedule for custom input: ${depots.length} depots, ${tasks.length} tasks.`);
    
    const depotSchedules = depots.map(depot => {
      const depotId = depot.DepotID !== undefined ? depot.DepotID : (depot.depotId !== undefined ? depot.depotId : (depot.id !== undefined ? depot.id : 'UNKNOWN'));
      const mechanicHours = depot.MechanicHours !== undefined ? Number(depot.MechanicHours) : (depot.mechanicHours !== undefined ? Number(depot.mechanicHours) : 0);

      const result = solveKnapsack(mechanicHours, tasks);

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

    const result = {
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

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSchedule,
  postSchedule
};
