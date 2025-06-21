import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FetchService {

  constructor() { }

  public async getAsync(url: string, requestInit: RequestInit): Promise<Response> {
    try {
      requestInit.headers = AuthService.addAuthHeader(requestInit.headers ?? {});
      requestInit.method = 'GET';
      const response = await fetch(url, requestInit);
      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  public async postAsync(url: string, requestInit: RequestInit): Promise<Response> {
    try {
          if (!(requestInit.headers instanceof Headers)) {
      requestInit.headers = new Headers(requestInit.headers);
    }
      requestInit.headers = AuthService.addAuthHeader(requestInit.headers ?? {});
      requestInit.method = 'POST';
      if (!requestInit.headers.has('Content-Type')) {
        requestInit.headers.append('Content-Type', 'application/json');
      }
      console.log('Request Init:', requestInit);
      
      const response = await fetch(url, requestInit);
      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  public async putAsync(url: string, requestInit: RequestInit): Promise<Response> {
    try {
      requestInit.headers = AuthService.addAuthHeader(requestInit.headers ?? {});
      requestInit.method = 'PUT';
      if (!requestInit.headers.has('Content-Type')) {
        requestInit.headers.append('Content-Type', 'application/json');
      }
      const response = await fetch(url, requestInit);
      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  public async deleteAsync(url: string, requestInit: RequestInit): Promise<Response> {
    try {
      requestInit.headers = AuthService.addAuthHeader(requestInit.headers ?? {});
      requestInit.method = 'DELETE';
      const response = await fetch(url, requestInit);
      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }
}
