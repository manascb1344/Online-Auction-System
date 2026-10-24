function validate({ body, params, query } = {}) {
  return (req, res, next) => {
    try {
      if (body) req.body = body.parse(req.body ?? {});
      if (params) req.params = params.parse(req.params ?? {});
      if (query) req.validatedQuery = query.parse(req.query ?? {});
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = { validate };
