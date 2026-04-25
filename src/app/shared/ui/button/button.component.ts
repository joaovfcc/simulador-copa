import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button [class]="'btn btn-' + variant" [disabled]="disabled">
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 20px;
      height: 37px;
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      white-space: nowrap;

      &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }
    }

    .btn-primary {
      background-color: #f4b400;
      color: #181818;

      &:hover:not(:disabled) {
        background-color: #e5a900;
      }
    }

    .btn-outline {
      background-color: transparent;
      border: 1px solid #f4b400;
      color: #f4b400;

      &:hover:not(:disabled) {
        background-color: rgba(244, 180, 0, 0.1);
      }
    }

    .btn-muted {
      background-color: #3c4043;
      color: #aaaaaa;
      height: 46.5px; /* Matching the "Simulação Completa" height from Figma */
      cursor: default;
    }

    /* Size variations if needed based on Figma */
    .btn-large {
      height: 46.5px;
    }
  `]
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'outline' | 'muted' = 'primary';
  @Input() disabled = false;
}
