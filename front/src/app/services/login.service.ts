import { Injectable } from '@angular/core';
import { FetchService } from './fetch.service';
import { CreateLoginDto, Login, UpdateLoginDto } from '../entities/login';
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
        throw new Error(`Failed to fetch logins: ${response.body ? await response.text() : 'Unknown error'}`);
      }
      const logins = await response.json() as Login[];
      return logins.map(login => {
        return Login.fromObject(login);
      })
    } catch (error) {
      console.error('Error fetching logins:', error);
      throw error;
    }
  }

  async getDeletedLoginsAsync(): Promise<Login[]> {
    try {
      const response = await this.fetchService.getAsync(`${this.apiEndpointV1}/login/deleted`, {});
      if (!response.ok) {
        throw new Error(`Failed to fetch deleted logins: ${response.body ? await response.text() : 'Unknown error'}`);
      }
      const logins = await response.json() as Login[];
      return logins.map(login =>  Login.fromObject(login));
    } catch (error) {
      console.error('Error fetching deleted logins:', error);
      throw error;
    }
  }

  async createLoginAsync(createLoginDto: CreateLoginDto): Promise<Login> {
    try {
      const response = await this.fetchService.postAsync(`${this.apiEndpointV1}/login`, {
        body: JSON.stringify(createLoginDto)
      });
      if (!response.ok) {
        throw new Error(`Failed to create login: ${response.body ? await response.text() : 'Unknown error'}`);
      }
      return Login.fromObject(await response.json());
    } catch (error) {
      console.error('Error creating login:', error);
      throw error;
    }
  }

    async createLoginsBulkAsync(createLoginDtos: CreateLoginDto[]): Promise<Login[]> {
    try {
      const response = await this.fetchService.postAsync(`${this.apiEndpointV1}/login/bulk`, {
        body: JSON.stringify(createLoginDtos)
      });
      if (!response.ok) {
        throw new Error(`Failed to create logins bulk: ${response.body ? await response.text() : 'Unknown error'}`);
      }
      const logins = await response.json() as Login[];
      return logins.map(login =>  Login.fromObject(login));
    } catch (error) {
      console.error('Error creating login:', error);
      throw error;
    }
  }

  async updateLoginAsync(updateLoginDto: UpdateLoginDto): Promise<Login> {
    try {
      console.log('Updating login with data:', updateLoginDto);
      
      const response = await this.fetchService.putAsync(`${this.apiEndpointV1}/login`, {
        body: JSON.stringify(updateLoginDto)
      });
      if (!response.ok) {
        throw new Error(`Failed to update login: ${response.body ? await response.text() : 'Unknown error'}`);
      }
      return Login.fromObject(await response.json());
    } catch (error) {
      console.error('Error updating login:', error);
      throw error;
    }
  }

  async updateLoginsBulkAsync(updateLoginDtos: UpdateLoginDto[]): Promise<Login[]> {
    try {
      const response = await this.fetchService.putAsync(`${this.apiEndpointV1}/login/bulk`, {
        body: JSON.stringify(updateLoginDtos)
      });
      if (!response.ok) {
        throw new Error(`Failed to update logins bulk: ${response.body ? await response.text() : 'Unknown error'}`);
      }
      const updatedLogins = await response.json() as Login[];
      return updatedLogins.map(login => Login.fromObject(login));
    } catch (error) {
      console.error('Error updating logins:', error);
      throw error;
    }
  }

  async deleteLoginAsync(id: string): Promise<number> {
    try {
      const response = await this.fetchService.deleteAsync(`${this.apiEndpointV1}/login/${id}`, {});
      if (!response.ok) {
        throw new Error(`Failed to delete login: ${response.body ? await response.text() : 'Unknown error'}`);
      }
      return response.body ? await response.json() as number : 0;
    } catch (error) {
      console.error('Error deleting login:', error);
      throw error;
    }
  }
}
