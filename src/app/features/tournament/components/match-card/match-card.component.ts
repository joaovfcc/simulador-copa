import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KnockoutMatch } from '../../../../core/models/knockout-match.model';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="match-card" [class.final]="match?.round === 'F'">
      <div *ngIf="match?.round === 'F'" class="match-header">
        ⚽ Final
      </div>
      
      <div class="team-row" [class.winner]="match?.winner?.id === match?.teamA?.id">
        <div class="team-info">
          <span class="name">{{ match?.teamA?.name || 'TBD' }}</span>
        </div>
        <div class="score">{{ match?.result?.golsEquipeA ?? '-' }}</div>
      </div>

      <div class="team-row" [class.winner]="match?.winner?.id === match?.teamB?.id">
        <div class="team-info">
          <span class="name">{{ match?.teamB?.name || 'TBD' }}</span>
        </div>
        <div class="score">{{ match?.result?.golsEquipeB ?? '-' }}</div>
      </div>

      <div *ngIf="match?.result?.golsPenaltyTimeA !== undefined" class="penalties">
        (Pen. {{ match?.result?.golsPenaltyTimeA }}–{{ match?.result?.golsPenaltyTimeB }})
      </div>
    </div>
  `,
  styles: [`
    .match-card {
      background-color: #2d2d30;
      border: 1px solid #3c4043;
      border-radius: 8px;
      width: 230px;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      &.final {
        .match-header {
          background-color: #f4b400;
          color: #181818;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 8px 12px;
          text-align: left;
        }
      }
    }

    .team-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      height: 34px;
      border-bottom: 1px solid #3c4043;

      &:last-child {
        border-bottom: none;
      }

      &.winner .name, &.winner .score {
        font-weight: 700;
      }
    }

    .team-info {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .flag {
        font-size: 16px;
      }

      .name {
        color: #ffffff;
        font-size: 13px;
        font-weight: 500;
      }
    }

    .score {
      color: #ffffff;
      font-size: 13px;
      font-weight: 700;
      width: 24px;
      text-align: right;
    }

    .penalties {
      padding: 4px 12px;
      color: #aaaaaa;
      font-size: 9px;
      text-align: right;
      border-top: 1px solid #3c4043;
    }
  `]
})
export class MatchCardComponent {
  @Input() match?: KnockoutMatch;
}
