import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from 'src/app/auth/auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})

export class AuthService {
  isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
  private userId: string;
  private authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) { }

  createUser = (enteredEmail: string, enteredPassword: string) => {
    const authData: AuthData = { email: enteredEmail, password: enteredPassword };
    this.http.post('http://localhost:3000/api/user/signup', authData)
      .subscribe(res => {
        this.router.navigate(['/']);
      }, err => {
        this.authStatusListener.next(false);
      });
  }

  loginUser = (enteredEmail: string, enteredPwd: string) => {
    const authData: AuthData = { email: enteredEmail, password: enteredPwd };
    this.http.post<{ token: string, expiresIn: number, userId: string }>('http://localhost:3000/api/user/login', authData)
      .subscribe(res => {
        const token = res.token;
        this.token = token;
        if (this.token) {
          const expiresInDuration = res.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.isAuthenticated = true;
          this.userId = res.userId;
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          this.saveAuthData(token, expirationDate, this.userId);
          this.router.navigate(['/']);
        }
      }, err => {
        this.authStatusListener.next(false);
      });
  }

  getToken = () => {
    return this.token;
  }

  getAuthStatusListener = () => {
    return this.authStatusListener.asObservable(); // asObservable method allows this subject to be emitted only in this service file.
    // other files can listen to the observable.
  }

  getIsAuth = () => {
    return this.isAuthenticated;
  }

  logOut = () => {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.userId = null;
    this.router.navigate(['/']);
  }

  private saveAuthData = (token: string, expirationDate: Date, userId: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  autoAuthUser = () => {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.authStatusListener.next(true);
      this.setAuthTimer(expiresIn / 1000);
    }
  }

  private getAuthData = () => {
    const authToken = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const loggedUserId = localStorage.getItem('userId');
    if (!authToken || !expirationDate) {
      return;
    }
    return {
      token: authToken,
      expirationDate: new Date(expirationDate),
      userId: loggedUserId
    };
  }

  private setAuthTimer = (duration: number) => {
    this.tokenTimer = setTimeout(() => {
      this.logOut();
    }, duration * 1000);
  }

  getUserId = () => {
    return this.userId;
  }
}
