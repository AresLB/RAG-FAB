import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from '../utils/errors';

/**
 * Validation middleware to check express-validator results
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.type === 'field' ? err.path : 'unknown',
      message: err.msg
    }));

    throw new ValidationError('Validation failed', extractedErrors);
  }

  next();
};

/**
 * Create validation middleware chain
 */
export const createValidationChain = (
  validations: ValidationChain[]
): ((req: Request, res: Response, next: NextFunction) => void)[] => {
  return [...validations, validate];
};
