const { AppError } = require('./errorHandler');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Check if schema expects body wrapper or direct body
      // Try to detect if schema has a 'body' key
      const schemaShape = schema._def?.shape?.() || schema.shape || {};
      const hasBodyWrapper = 'body' in schemaShape;
      
      let dataToValidate;
      if (hasBodyWrapper) {
        // Schema expects { body: {...}, query: {...}, params: {...} }
        dataToValidate = {
          body: req.body,
          query: req.query,
          params: req.params
        };
      } else {
        // Schema expects direct body fields like { email, password }
        dataToValidate = req.body;
      }
      
      const result = schema.safeParse(dataToValidate);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return next(new AppError(
          errors.map(e => `${e.field}: ${e.message}`).join(', '),
          400
        ));
      }

      // Store validated data
      if (hasBodyWrapper) {
        req.validatedBody = result.data.body;
        req.validatedQuery = result.data.query;
        req.validatedParams = result.data.params;
      } else {
        req.validatedBody = result.data;
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return next(new AppError(
          errors.map(e => `${e.field}: ${e.message}`).join(', '),
          400
        ));
      }

      req.validatedQuery = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.params);
      
      if (!result.success) {
        return next(new AppError('Invalid parameters', 400));
      }

      req.validatedParams = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { validate, validateQuery, validateParams };