import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ControllersService } from '../services/controllers.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private controllers: ControllersService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    const currentUser = this.authService.currentUserValue as any;

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      // Optional: Add JSON header only when needed
      if (!request.headers.has('Content-Type') && !(request.body instanceof FormData)) {
        request = request.clone({
          setHeaders: { 'Content-Type': 'application/json' }
        });
      }
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          const errorCode = error.error?.code;

          if (errorCode === 'token_expired' || errorCode === 'Invalid token or logged in from another device') {
            if (currentUser) {
              this.controllers.LogoutAgent(currentUser, Number(currentUser.userId)).subscribe({
                next: () => {
                  this.authService.logout();
                  this.router.navigate(['/login'], {
                    queryParams: { session: 'expired' }
                  });
                },
                error: () => {
                  this.authService.logout();
                  this.router.navigate(['/login'], {
                    queryParams: { session: 'expired' }
                  });
                }
              });
            } else {
              this.authService.logout();
              this.router.navigate(['/login'], {
                queryParams: { session: 'expired' }
              });
            }
          } else if (errorCode === 'invalid_token') {
            this.authService.logout();
            this.router.navigate(['/login'], {
              queryParams: { session: 'invalid' }
            });
          }
        }

        return throwError(() => error);
      })
    );
  }
}
