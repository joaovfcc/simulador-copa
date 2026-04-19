import { Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  standalone: true,
  template: `
    <div class="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <header class="bg-blue-600 text-white p-4 shadow-md">
        <h1 class="text-2xl font-bold text-center">World Cup 2022 Simulator</h1>
      </header>
      
      <main class="flex-grow p-4 md:p-8">
        <ng-content></ng-content>
      </main>
      
      <footer class="bg-gray-800 text-white p-4 text-center text-sm">
        <p>Desenvolvido para fins de validação técnica</p>
      </footer>
    </div>
  `
})
export class LayoutComponent {}
