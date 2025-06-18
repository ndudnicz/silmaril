import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FetchService {

  constructor() { }

  public async getAsync(url: string, headers: HeadersInit): Promise<Response> {
    try {
      headers = AuthService.addAuthHeader(headers ?? {});
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  public async postAsync(url: string, headers: HeadersInit, body: any): Promise<Response> {
    try {
      headers = AuthService.addAuthHeader(headers ?? {});
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      });
      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  public async putAsync(url: string, headers: HeadersInit, body: any): Promise<Response> {
    try {
      headers = AuthService.addAuthHeader(headers ?? {});
      const response = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(body)
      });
      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  public async deleteAsync(url: string, headers: HeadersInit): Promise<Response> {
    try {
      headers = AuthService.addAuthHeader(headers ?? {});
      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers
      });
      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }
}
