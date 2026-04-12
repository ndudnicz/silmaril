import { Injectable } from '@angular/core';
import { Credential } from '../entities/credential';
import { BehaviorSubject, Observable } from 'rxjs';
import { Vault } from '../entities/vault';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor() {}

  // private _selectedLogin: BehaviorSubject<Credential | null> = new BehaviorSubject<Credential | null>(null);
  // public readonly selectedLogin: Observable<Credential | null> = this._selectedLogin.asObservable();
  // setSelectedLogin(login: Credential | null): void {
  //   this._selectedLogin.next(login);
  // }
  // clearSelectedLogin(): void {
  //   this._selectedLogin.next(null);
  // }

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

  private _vaults: BehaviorSubject<Vault[] | null> = new BehaviorSubject<Vault[] | null>(null);
  public readonly vaults: Observable<Vault[] | null> = this._vaults.asObservable();
  setVaults(vaults: Vault[]): void {
    this._vaults.next(vaults);
  }
  addVault(vault: Vault): void {
    console.log('Adding vault:', vault);
    const currentVaults = this._vaults.getValue() || [];
    this._vaults.next([...currentVaults, vault]);
  }
  updateVault(vault: Vault): void {
    console.log('Updating vault:', vault);
    const currentVaults = this._vaults.getValue() || [];
    const index = currentVaults.findIndex((v) => v.id === vault.id);
    if (index !== -1) {
      currentVaults[index] = vault;
      this._vaults.next([...currentVaults]);
    } else {
      console.warn('Vault not found for update:', vault);
    }
  }
  deleteVault(vaultId: string): void {
    console.log('Removing vault with ID:', vaultId);
    const currentVaults = this._vaults.getValue() || [];
    const updatedVaults = currentVaults.filter((v) => v.id !== vaultId);
    this._vaults.next(updatedVaults);
  }
  getVaults(): Vault[] {
    return this._vaults.getValue() ?? [];
  }

  vaults$(): Observable<Vault[] | null> {
    return this.vaults;
  }
}
