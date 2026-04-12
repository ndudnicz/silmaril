import { Component, input, output } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Credential } from '../../entities/credential';
import { CardStackComponent } from './card-stack/card-stack.component';
import { map } from 'rxjs';

@Component({
  selector: 'app-card-stacks',
  imports: [CardStackComponent],
  templateUrl: './card-stacks.component.html',
  styleUrl: './card-stacks.component.css',
})
export class CardStacksComponent {
  public readonly displayedCredentials = input.required<Credential[]>();
  protected readonly displayedCredentials$ = toObservable(this.displayedCredentials);
  protected readonly clickEvent = output<Credential>();

  displayedCredentialStackEntries = toSignal(
    this.displayedCredentials$.pipe(
      map((credentials) => {
        let credentialStacks: any = {};
        for (const credential of credentials) {
          const stackName =
            credential.decryptedData?.title.charAt(0).toLocaleUpperCase() || 'Uncategorized';
          if (!credentialStacks[stackName]) {
            credentialStacks[stackName] = [];
          }
          credentialStacks[stackName].push(credential);
        }
        return Object.entries(credentialStacks as Record<string, Credential[]>)
          .map(([key, value]) => ({ key, value }))
          .sort((a, b) => a.key.localeCompare(b.key));
      }),
    ),
    { initialValue: [] },
  );
}
