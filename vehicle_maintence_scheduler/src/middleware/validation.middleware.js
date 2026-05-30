const validateScheduleRequest = (req, res, next) => {
  if (req.method === 'GET') {
    return next();
  }

  const { depots, tasks } = req.body;

  if (!depots) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing "depots" field in request body.'
    });
  }

  if (!tasks) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing "tasks" field in request body.'
    });
  }

  if (!Array.isArray(depots)) {
    return res.status(400).json({
      status: 'fail',
      message: '"depots" must be an array.'
    });
  }

  if (!Array.isArray(tasks)) {
    return res.status(400).json({
      status: 'fail',
      message: '"tasks" must be an array.'
    });
  }

  next();
};

module.exports = { validateScheduleRequest };
