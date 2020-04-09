import { AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';
import { Observer, of } from 'rxjs';

export const mimeType = (control: AbstractControl): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {
  if (typeof (control.value) === 'string') {
    return of(null);
  }
  const file = control.value as File;
  const fileReader = new FileReader();
  const frObs = Observable.create((observer: Observer<{ [key: string]: any }>) => {
    fileReader.addEventListener('loadend', () => {
      const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(0, 4); // subarray is used to get the MIME type.
      let header = '';
      let isValid = false;
      for (const arrIndex of arr) {
        header += arrIndex.toString(16);
      }
      switch (header) {
        case '89504e47':
          isValid = true;
          break;
        case 'ffd8ffe0':
        case 'ffd8ffe1':
        case 'ffd8ffe2':
        case 'ffd8ffe3':
        case 'ffd8ffe8':
          isValid = true;
          break;
        default:
          isValid = false;
          break;
      }
      if (isValid) {
        observer.next(null);
      } else {
        observer.next({ invalidMimeType: true });
      }
      observer.complete();
    });
    fileReader.readAsArrayBuffer(file); // This will trigger the event listener and also provides access to MIME type
  });
  return frObs;
};

/* Promise<{ [key: string]: any }> syntax tell us that it should return an object that may contain a dynamic key name
and the [] doesn't indicate an array */
