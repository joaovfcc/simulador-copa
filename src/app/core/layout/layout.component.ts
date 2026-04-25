import { Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  standalone: true,
  template: `
    <div class="min-h-screen flex flex-col">
      <main class="flex-grow">
        <ng-content></ng-content>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #1e1f22;
    }
  `]
})
export class LayoutComponent {}
