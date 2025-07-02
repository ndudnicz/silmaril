import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { UpdateUserDto, User } from '../entities/user';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiEndpointV1 = environment.apiEndpoint + '/v1';

  constructor(
    private http: HttpClient
  ) { }

  getUser$(): Observable<User> {
    return this.http.get<User>(`${this.apiEndpointV1}/user`).pipe(
      catchError(error => {
        console.error('Error fetching user data:', error);
        return throwError(() => new Error('Failed to fetch user data'));
      })
    );
  }

  createUser$(username: string, password: string, confirmPassword: string): Observable<boolean> {
    const body = { username, password, confirmPassword };
    return this.http.post(`${this.apiEndpointV1}/user`, body, { observe: 'response' }).pipe(
      map(response => response.ok),
      catchError(error => {
        console.error('Error during user creation:', error);
        return throwError(() => new Error('Failed to create user'));
      })
    );
  }

  changePassword$(oldPassword: string, newPassword: string): Observable<boolean> {
    const body = { oldPassword, newPassword };
    return this.http.put(`${this.apiEndpointV1}/user/password`, body, { observe: 'response' }).pipe(
      map(response => response.ok),
      catchError(error => {
        console.error('Error during password change:', error);
        return throwError(() => new Error('Failed to change password'));
      })
    );
  }

  updateUser$(updateUserDto: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiEndpointV1}/user`, updateUserDto).pipe(
      catchError(error => {
        console.error('Error updating user:', error);
        return throwError(() => new Error('Failed to update user'));
      })
    );
  }
}