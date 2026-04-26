import { Injectable } from '@angular/core';
import { Credential } from '../entities/credential';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private _deletedLogin: BehaviorSubject<Credential | null> =
    new BehaviorSubject<Credential | null>(null);
  public readonly deletedLogin: Observable<Credential | null> = this._deletedLogin.asObservable();
  setDeletedLogin(login: Credential | null): void {
    this._deletedLogin.next(login);
  }

  private _updatedLogin: BehaviorSubject<Credential | null> =
    new BehaviorSubject<Credential | null>(null);
  public readonly updatedLogin: Observable<Credential | null> = this._updatedLogin.asObservable();
  setUpdatedLogin(login: Credential): void {
    this._updatedLogin.next(login);
  }
}
