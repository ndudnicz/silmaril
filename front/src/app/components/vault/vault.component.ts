import { Component, OnInit } from '@angular/core';
import { VaultService } from '../../services/vault.service';

@Component({
  selector: 'app-vault',
  imports: [],
  templateUrl: './vault.component.html',
  styleUrl: './vault.component.css'
})
export class VaultComponent implements OnInit {

  constructor(private vaultService: VaultService) { }

  ngOnInit(): void {
    console.log('VaultComponent initialized', this.vaultService.isUnlocked(), this.vaultService.getKey());
    
  }

  // Add methods to handle vault operations, e.g., adding, removing, or viewing items

}
