import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Standing } from '../../../../core/models/standing.model';

@Component({
  selector: 'app-group-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="group-card">
      <div class="header">
        <h3>Grupo {{ label }}</h3>
      </div>
      
      <div class="table-container">
        <div class="table-header">
          <div class="team-col"></div>
          <div class="stat-col">PTS</div>
          <div class="stat-col">PJ</div>
          <div class="stat-col">V</div>
          <div class="stat-col">E</div>
          <div class="stat-col">D</div>
          <div class="stat-col">GM</div>
          <div class="stat-col">GC</div>
          <div class="stat-col">SG</div>
        </div>

        <div *ngFor="let standing of standings; let i = index" 
             class="table-row" 
             [class.qualifier]="i < 2">
          <div class="team-info">
            <span class="rank">{{ i + 1 }}</span>
            <span class="name">{{ standing.team.name }}</span>
            <span class="sigla" *ngIf="standing.team.sigla">({{ standing.team.sigla }})</span>
          </div>
          <div class="stat-col bold">{{ standing.points }}</div>
          <div class="stat-col">{{ standing.wins + standing.draws + standing.losses }}</div>
          <div class="stat-col">{{ standing.wins }}</div>
          <div class="stat-col">{{ standing.draws }}</div>
          <div class="stat-col">{{ standing.losses }}</div>
          <div class="stat-col">{{ standing.goalsFor }}</div>
          <div class="stat-col">{{ standing.goalsAgainst }}</div>
          <div class="stat-col">{{ standing.goalDifference }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .group-card {
      background-color: #2d2d30;
      border: 1px solid #3c4043;
      border-radius: 8px;
      overflow: hidden;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .header {
      padding: 12px 16px;
      h3 {
        color: #ffffff;
        font-family: 'Inter', sans-serif;
        font-size: 16px;
        font-weight: 700;
        margin: 0;
      }
    }

    .table-container {
      display: flex;
      flex-direction: column;
    }

    .table-header {
      display: flex;
      padding: 4px 8px;
      border-bottom: 1px solid #3c4043;
      
      .team-col {
        flex: 1;
      }
    }

    .stat-col {
      width: 36px;
      text-align: right;
      color: #aaaaaa;
      font-family: 'Inter', sans-serif;
      font-size: 10px;
      font-weight: 400;
      letter-spacing: 0.4px;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      &.bold {
        font-weight: 700;
        color: #ffffff;
        font-size: 13px;
      }
    }

    .table-row {
      display: flex;
      height: 48px;
      align-items: center;
      padding: 0 8px;
      position: relative;
      border-bottom: 1px solid #3c4043;

      &:last-child {
        border-bottom: none;
      }

      &.qualifier::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background-color: #4285f4;
      }
    }

    .team-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;

      .rank {
        width: 24px;
        text-align: center;
        color: #aaaaaa;
        font-size: 12px;
      }

      .flag {
        font-size: 18px;
      }

      .name {
        color: #ffffff;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .sigla {
        color: #aaaaaa;
        font-size: 11px;
        font-weight: 400;
      }
    }

    .table-row .stat-col:not(.bold) {
      font-size: 13px;
      color: #ffffff;
    }
  `]
})
export class GroupTableComponent {
  @Input() label: string = '';
  @Input() standings: Standing[] = [];
}
