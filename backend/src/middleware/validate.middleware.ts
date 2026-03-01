import { type Request, type Response, type NextFunction } from 'express';
import { ValidationError } from './error.middleware';

export const validate = (schema: {
  body?: Record<string, { required?: boolean; type?: string }>;
  params?: Record<string, { required?: boolean; type?: string }>;
  query?: Record<string, { required?: boolean; type?: string }>;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { body, params, query } = req;

      // Validate body
      if (schema.body) {
        for (const [key, rules] of Object.entries(schema.body)) {
          if (rules.required && !body[key]) {
            throw new ValidationError(`${key} is required`);
          }
          if (body[key] && rules.type && typeof body[key] !== rules.type) {
            throw new ValidationError(`${key} must be of type ${rules.type}`);
          }
        }
      }

      // Validate params
      if (schema.params) {
        for (const [key, rules] of Object.entries(schema.params)) {
          if (rules.required && !params[key]) {
            throw new ValidationError(`${key} is required`);
          }
        }
      }

      // Validate query
      if (schema.query) {
        for (const [key, rules] of Object.entries(schema.query)) {
          if (rules.required && !query[key]) {
            throw new ValidationError(`${key} is required`);
          }
        }
      }

      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        next(error);
      }
    }
  };
};
