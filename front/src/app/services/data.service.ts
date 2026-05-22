import { Injectable } from '@angular/core';
import { Credential } from '../entities/credential';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private _deletedCredential: BehaviorSubject<Credential | null> =
    new BehaviorSubject<Credential | null>(null);
  public readonly deletedCredential: Observable<Credential | null> =
    this._deletedCredential.asObservable();
  setDeletedCredential(credential: Credential | null): void {
    this._deletedCredential.next(credential);
  }

  private _updatedCredential: BehaviorSubject<Credential | null> =
    new BehaviorSubject<Credential | null>(null);
  public readonly updatedCredential: Observable<Credential | null> =
    this._updatedCredential.asObservable();
  setUpdatedCredential(credential: Credential): void {
    this._updatedCredential.next(credential);
  }
}
