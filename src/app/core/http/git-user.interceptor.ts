import { HttpInterceptorFn } from '@angular/common/http';

export const gitUserInterceptor: HttpInterceptorFn = (req, next) => {
  // TODO: injetar header git-user
  return next(req);
};
