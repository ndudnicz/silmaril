import { Injectable } from '@angular/core';
import { FetchService } from './fetch.service';
import { LoginEncrypted } from '../entities/login';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiEndpointV1 = environment.apiEndpoint + '/v1';

  constructor(private fetchService: FetchService) { }

  async getLoginsAsync(): Promise<LoginEncrypted[]> {
    try {
      const response = await this.fetchService.getAsync(`${this.apiEndpointV1}/login`, {});
      if (!response.ok) {
        throw new Error('Failed to fetch logins');
      }
      return await response.json() as LoginEncrypted[];
    } catch (error) {
      console.error('Error fetching logins:', error);
      throw error;
    }
  }
}
