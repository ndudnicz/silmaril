import { Injectable } from '@angular/core';
import { FetchService } from './fetch.service';
import { CreateLoginDto, Login } from '../entities/login';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiEndpointV1 = environment.apiEndpoint + '/v1';

  constructor(private fetchService: FetchService) { }

  async getLoginsAsync(): Promise<Login[]> {
    try {
      const response = await this.fetchService.getAsync(`${this.apiEndpointV1}/login`, {});
      if (!response.ok) {
        throw new Error('Failed to fetch logins');
      }
      const logins = await response.json() as Login[];
      return logins.map(login => {
        return Login.fromObject(login);
      })
      // return await response.json() as Login[];
    } catch (error) {
      console.error('Error fetching logins:', error);
      throw error;
    }
  }

  async createLoginAsync(createLoginDto: CreateLoginDto): Promise<Login> {
    try {
      const response = await this.fetchService.postAsync(`${this.apiEndpointV1}/login`, {
        body: JSON.stringify(createLoginDto)
      });
      if (!response.ok) {
        throw new Error('Failed to create login');
      }
      return Login.fromObject(await response.json());
    } catch (error) {
      console.error('Error creating login:', error);
      throw error;
    }
  }
}
