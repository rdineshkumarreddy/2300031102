const { getRawNotifications } = require('../services/notification.service');
const { logger } = require('../../../logging_middleware');

const TYPE_WEIGHTS = {
  placement: 3,
  result: 2,
  event: 1
};

const getTopNotifications = async (req, res, next) => {
  try {
    const rawData = await getRawNotifications();
    const list = rawData.notifications || rawData.data || [];

    if (!Array.isArray(list)) {
      throw new Error('Invalid notifications payload: expected an array inside "notifications" key');
    }

    logger.info(`Processing priority sorting for ${list.length} notifications...`);

    const scored = list.map(item => {
      const typeKey = (item.Type || item.type || '').toLowerCase();
      const weight = TYPE_WEIGHTS[typeKey] || 0;
      
      const tsString = item.Timestamp || item.timestamp;
      const parsedTime = tsString ? new Date(tsString).getTime() : 0;

      return {
        item,
        weight,
        time: parsedTime
      };
    });

    // Sort primarily by weight (descending) and secondarily by timestamp (descending)
    scored.sort((a, b) => {
      if (b.weight !== a.weight) {
        return b.weight - a.weight;
      }
      return b.time - a.time;
    });

    const topNotifications = scored.slice(0, 10).map(x => x.item);

    logger.info(`Successfully generated top 10 priority notifications.`);

    res.status(200).json({
      status: 'success',
      data: {
        topNotifications
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTopNotifications
};
