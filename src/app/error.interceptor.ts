import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/internal/operators/catchError';
import { throwError } from 'rxjs/internal/observable/throwError';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ErrorComponent } from 'src/app/error/error.component';

@Injectable()

export class ErrorInterceptor implements HttpInterceptor {

  constructor(private dialog: MatDialog) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe( // handle() will provide us a response observable stream.
      catchError((error: HttpErrorResponse) => { // to handle error emitted by the stream.
        let errorMessage = 'An unknown error ocurred';
        if (error.error.message) {
          errorMessage = error.error.message;
        }
        this.dialog.open(ErrorComponent, { data: { message: errorMessage} });
        return throwError(error); // throwing the observable stream as error since the subscription is not here.
      })
    );
  }
}
