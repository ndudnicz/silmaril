import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from '../entities/user';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, map, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { UpdateUserDto } from '../entities/update/update-user-dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiEndpointV1 = environment.apiEndpoint + '/v1';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getUser$(): Observable<User> {
    return this.http.get<User>(`${this.apiEndpointV1}/user`);
  }

  createUser$(username: string, password: string, confirmPassword: string): Observable<boolean> {
    const body = { username, password, confirmPassword };
    return this.http.post(`${this.apiEndpointV1}/user`,
      body, {
        observe: 'response',
        withCredentials: true,
        headers: this.authService.addCsrfHeader()
      }).pipe(
      map(response => response.ok)
    );
  }

  changePassword$(oldPassword: string, newPassword: string): Observable<boolean> {
    const body = { oldPassword, newPassword };
    return this.http.put(`${this.apiEndpointV1}/user/password`, body, { observe: 'response' }).pipe(
      map(response => response.ok)
    );
  }

  updateUser$(updateUserDto: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiEndpointV1}/user`, updateUserDto);
  }
}