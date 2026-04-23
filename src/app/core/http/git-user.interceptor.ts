import { HttpInterceptorFn } from '@angular/common/http';

export const gitUserInterceptor: HttpInterceptorFn = (req, next) => {
  const cloned = req.clone({
    setHeaders: {
      'git-user': 'joaovfcc'
    }
  });
  return next(cloned);
};
