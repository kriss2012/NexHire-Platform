import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError(`Forbidden: Requires one of roles [${allowedRoles.join(', ')}]`));
    }

    next();
  };
}
