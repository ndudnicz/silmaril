import { Injectable } from '@angular/core';
import { Login } from '../entities/login';
import { BehaviorSubject, Observable } from 'rxjs';
import { Vault } from '../entities/vault';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  private _selectedLogin: BehaviorSubject<Login | null> = new BehaviorSubject<Login | null>(null);
  public readonly selectedLogin: Observable<Login | null> = this._selectedLogin.asObservable();
  setSelectedLogin(login: Login | null): void {
    this._selectedLogin.next(login);
  }
  clearSelectedLogin(): void {
    this._selectedLogin.next(null);
  }

  private _deletedLogin: BehaviorSubject<Login | null> = new BehaviorSubject<Login | null>(null);
  public readonly deletedLogin: Observable<Login | null> = this._deletedLogin.asObservable();
  setDeletedLogin(login: Login | null): void {
    this._deletedLogin.next(login);
  }

  private _updatedLogin: BehaviorSubject<Login | null> = new BehaviorSubject<Login | null>(null);
  public readonly updatedLogin: Observable<Login | null> = this._updatedLogin.asObservable();
  setUpdatedLogin(login: Login): void {
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
    const index = currentVaults.findIndex(v => v.id === vault.id);
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
    const updatedVaults = currentVaults.filter(v => v.id !== vaultId);
    this._vaults.next(updatedVaults);
  }
  getVaults(): Vault[] {
    return this._vaults.getValue() ?? [];
  }
}
