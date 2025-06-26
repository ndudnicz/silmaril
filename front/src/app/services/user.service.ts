import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { FetchService } from './fetch.service';
import { User } from '../entities/user';
import { ToastWrapper } from '../utils/toast.wrapper';
import { base64ToUint8Array, CryptoUtilsV1 } from '../utils/crypto.utils';
import { AuthHelper } from '../components/helpers/auth.helper';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiEndpointV1 = environment.apiEndpoint + '/v1';

  constructor(
    private fetchService: FetchService,
    private authService: AuthService
  ) { }

  async getUserAsync(): Promise<User> {
    try {
      const response = await this.fetchService.getAsync(`${this.apiEndpointV1}/user`, {});
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      return await response.json() as User;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  async createUserAsync(username: string, password: string, confirmPassword: string): Promise<boolean> {
    try {
      const response = await this.fetchService.postAsync(
        `${this.apiEndpointV1}/user`,
        { body: JSON.stringify({ username, password, confirmPassword }) });
      if (!response.ok) {
        throw new Error(response.body ? await response.text() : 'Failed to create user');
      }
      return response.ok;
    }
    catch (error) {
      console.error('Error during user creation:', error);
      throw error;
    }
  }

  async changePasswordAsync(oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      const response = await this.fetchService.putAsync(
        `${this.apiEndpointV1}/user/password`,
        { body: JSON.stringify({ oldPassword, newPassword }) }
      );
      if (!response.ok) {
        throw new Error(response.body ? await response.text() : 'Failed to change password');
      }
      return response.ok;
    } catch (error) {
      console.error('Error during password change:', error);
      throw error;
    }
  }
}