export const wrap = (handler) =>
  async (req, res, next) => {
    try {
      const response = await handler(req, res, next);
      res.json(response);
      next();
    } catch (err) {
      next(err);
    }
  };
