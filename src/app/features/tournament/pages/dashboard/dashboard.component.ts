import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentStateService } from '../../../../core/services/tournament-state.service';
import { SimulationService } from '../../../../core/services/simulation.service';
import { ApiService } from '../../../../core/services/api.service';
import { GroupDrawService } from '../../../../core/services/group-draw.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { GroupTableComponent } from '../../components/group-table/group-table.component';
import { MatchCardComponent } from '../../components/match-card/match-card.component';
import { Standing } from '../../../../core/models/standing.model';
import { KnockoutMatch } from '../../../../core/models/knockout-match.model';
import { Team } from '../../../../core/models/team.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    ButtonComponent, 
    GroupTableComponent, 
    MatchCardComponent
  ],
  template: `
    <div class="dashboard-layout">
      <nav class="navbar">
        <div class="logo">
          <span class="icon">🏆</span>
          <h1>WC Simulator</h1>
        </div>
        
        <div class="tabs">
          <a (click)="activeTab = 'grupos'" [class.active]="activeTab === 'grupos'">Grupos</a>
          <a (click)="activeTab = 'mata-mata'" [class.active]="activeTab === 'mata-mata'">Mata-Mata</a>
        </div>

        <div class="actions">
          <span class="status-text" *ngIf="simulationComplete">Simulação Completa</span>
        </div>
      </nav>

      <main class="content-area">
        <div *ngIf="loading" class="loading-state">
          <p>Buscando seleções...</p>
        </div>

        <div *ngIf="!loading && activeTab === 'grupos'" class="tab-content">
          <div class="section-header">
            <h2>Fase de Grupos</h2>
          </div>
          <div class="groups-grid">
            <app-group-table 
              *ngFor="let group of groups" 
              [label]="group.label" 
              [standings]="getStandings(group)">
            </app-group-table>
          </div>
          <div class="legend">
            <span class="indicator"></span>
            <span>Classifica para as Oitavas de Final</span>
          </div>
        </div>

        <div *ngIf="!loading && activeTab === 'mata-mata'" class="tab-content">
          <div class="section-header">
            <h2>Mata-Mata</h2>
          </div>
          <div class="knockout-stage">
            <div *ngIf="!r16Matches.length" class="empty-state">
              <p>Simule a fase de grupos para ver o chaveamento.</p>
            </div>
            <div *ngIf="r16Matches.length" class="bracket-container">
              <div class="bracket-column">
                <span class="column-title">Oitavas</span>
                <div class="matches">
                  <app-match-card *ngFor="let m of r16Matches" [match]="m"></app-match-card>
                </div>
              </div>
              <div class="bracket-column">
                <span class="column-title">Quartas</span>
                <div class="matches">
                  <app-match-card *ngFor="let m of qfMatches" [match]="m"></app-match-card>
                </div>
              </div>
              <div class="bracket-column">
                <span class="column-title">Semis</span>
                <div class="matches">
                  <app-match-card *ngFor="let m of sfMatches" [match]="m"></app-match-card>
                </div>
              </div>
              <div class="bracket-column">
                <span class="column-title">Final</span>
                <div class="matches">
                  <app-match-card *ngIf="finalMatch" [match]="finalMatch"></app-match-card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div class="floating-bar" *ngIf="!loading">
        <div class="step-info">
          <span *ngIf="currentStep === 0">Sorteio Realizado</span>
          <span *ngIf="currentStep === 1">Grupos - Rodada 1 simulada</span>
          <span *ngIf="currentStep === 2">Grupos - Rodada 2 simulada</span>
          <span *ngIf="currentStep === 3">Grupos - Fase de Grupos concluída</span>
          <span *ngIf="currentStep === 4">Mata-Mata - Oitavas simuladas</span>
          <span *ngIf="currentStep === 5">Mata-Mata - Quartas simuladas</span>
          <span *ngIf="currentStep === 6">Mata-Mata - Semifinais simuladas</span>
          <span *ngIf="currentStep === 7">Simulação Completa 🏆</span>
        </div>
        <div class="bar-actions">
          <app-button *ngIf="currentStep < 7" (click)="simulateStep()">Avançar</app-button>
          <app-button variant="outline" (click)="reset()">Reiniciar</app-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      min-height: 100vh;
      background-color: #181818;
      font-family: 'Inter', system-ui, sans-serif;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      padding-bottom: 120px; /* Space for floating bar */
    }

    .navbar {
      display: flex;
      align-items: center;
      height: 60px;
      padding: 0 32px;
      background-color: #2d2d30;
      border-bottom: 1px solid #3c4043;
      position: sticky;
      top: 0;
      z-index: 100;
      gap: 0;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-right: 40px;

      .icon { font-size: 22px; }
      .title {
        font-size: 16px;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: -0.02em;
      }
    }

    .tabs {
      display: flex;
      gap: 24px;
      flex: 1 1 0%;
      height: 100%;
      align-items: center;
      
      a {
        color: #aaaaaa;
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;
        padding-bottom: 4px;
        position: relative;
        top: 2px;
        
        &.active {
          color: #f4b400;
          border-bottom: 2px solid #f4b400;
          padding-bottom: 2px;
        }

        &:hover:not(.active) {
          color: #ffffff;
        }
      }
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 16px;

      .status-text {
        color: #aaaaaa;
        font-size: 13px;
      }
    }

    .content-area {
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    .loading-state, .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 300px;
      color: #aaaaaa;
      font-size: 16px;
    }

    .section-header h2 {
      font-size: 20px;
      font-weight: 700;
      margin: 0 0 24px 0;
      letter-spacing: -0.4px;
    }

    .groups-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
      gap: 16px;
    }

    .legend {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 24px;
      color: #aaaaaa;
      font-size: 12px;

      .indicator {
        width: 12px;
        height: 12px;
        background-color: #4285f4;
        border-radius: 2px;
      }
    }

    .knockout-stage {
      background-color: #1e1f22;
      border: 1px solid #3c4043;
      border-radius: 8px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      overflow-x: auto;
    }

    .bracket-container {
      display: flex;
      gap: 32px;
      min-width: max-content;
    }

    .bracket-column {
      display: flex;
      flex-direction: column;
      gap: 24px;
      width: 230px;

      .column-title {
        color: #aaaaaa;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        text-align: center;
        margin-bottom: 8px;
      }

      .matches {
        display: flex;
        flex-direction: column;
        gap: 16px;
        flex: 1;
        justify-content: center;
      }

      .divider {
        height: 1px;
        background-color: #3c4043;
        margin: 16px 0;
      }
    }

    .floating-bar {
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(45, 45, 48, 0.95);
      backdrop-filter: blur(12px);
      padding: 12px 32px;
      border-radius: 64px;
      display: flex;
      align-items: center;
      gap: 32px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5);
      border: 1px solid #3c4043;
      z-index: 1000;
    }

    .step-info {
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      min-width: 200px;
    }

    .bar-actions {
      display: flex;
      gap: 12px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private stateService = inject(TournamentStateService);
  private simulationService = inject(SimulationService);
  private apiService = inject(ApiService);
  private groupDrawService = inject(GroupDrawService);

  tournamentState = this.stateService.state;
  simulationComplete = false;
  activeTab: 'grupos' | 'mata-mata' = 'grupos';
  loading = false;

  get currentStep() {
    return this.tournamentState().currentStep || 0;
  }

  ngOnInit() {
    if (this.tournamentState().groups.length === 0) {
      this.initTournament();
    } else {
      // Restaurar estado da UI após F5
      if (this.currentStep > 3) {
        this.activeTab = 'mata-mata';
      }
      if (this.currentStep === 7) {
        this.simulationComplete = true;
      }
    }
  }

  private initTournament() {
    this.loading = true;
    this.apiService.getTeams().subscribe({
      next: (response: any) => {
        console.log('Dados recebidos da API:', response);
        
        // Tratar se a API retornar um array direto ou um objeto envelopado (Result, data, etc)
        const teams = Array.isArray(response) ? response : (response.Result || response.result || response.data || response.Teams || []);

        const mappedTeams: Team[] = teams.map((t: any) => ({
          id: t.id || t.Token || t.token || t.idTeam || t.Id || Math.random().toString(),
          name: t.name || t.Nome || t.nome || t.Name || t.nmTeam || 'Seleção Desconhecida',
          sigla: t.sigla || t.Sigla
        }));

        this.stateService.setTeams(mappedTeams);
        const groups = this.groupDrawService.drawGroups(mappedTeams);
        
        groups.forEach(g => {
          const rounds = this.groupDrawService.generateRounds(g.teams);
          g.matches = rounds.flatMap(r => r.matches);
        });

        this.stateService.setGroups(groups);
        this.stateService.setStep(0);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar seleções:', err);
        this.loading = false;
      }
    });
  }

  get groups() {
    return this.tournamentState().groups;
  }

  get r16Matches(): KnockoutMatch[] {
    const root = this.tournamentState().knockoutRoot;
    if (!root) return [];
    
    const matches: KnockoutMatch[] = [];
    const traverse = (node: KnockoutMatch) => {
      if (node.round === 'R16') {
        matches.push(node);
        return;
      }
      if (node.childA) traverse(node.childA);
      if (node.childB) traverse(node.childB);
    };
    traverse(root);
    return matches;
  }

  get qfMatches(): KnockoutMatch[] {
    const root = this.tournamentState().knockoutRoot;
    if (!root) return [];
    
    const matches: KnockoutMatch[] = [];
    const traverse = (node: KnockoutMatch) => {
      if (node.round === 'QF') {
        matches.push(node);
        return;
      }
      if (node.childA) traverse(node.childA);
      if (node.childB) traverse(node.childB);
    };
    traverse(root);
    return matches;
  }

  get sfMatches(): KnockoutMatch[] {
    const root = this.tournamentState().knockoutRoot;
    if (!root) return [];
    
    const matches: KnockoutMatch[] = [];
    const traverse = (node: KnockoutMatch) => {
      if (node.round === 'SF') {
        matches.push(node);
        return;
      }
      if (node.childA) traverse(node.childA);
      if (node.childB) traverse(node.childB);
    };
    traverse(root);
    return matches;
  }

  get finalMatch(): KnockoutMatch | null {
    const root = this.tournamentState().knockoutRoot;
    return root && root.round === 'F' ? root : null;
  }

  getStandings(group: any): Standing[] {
    return this.simulationService.calculateStandings(group.teams, group.matches);
  }

  simulateStep() {
    const state = this.tournamentState();
    const nextStep = this.currentStep + 1;

    if (this.currentStep < 3) {
      // Simula uma rodada da fase de grupos (índices 0-1, 2-3, 4-5)
      const updatedGroups = state.groups.map(g => {
        const start = this.currentStep * 2;
        const simulatedMatches = [...g.matches];
        simulatedMatches[start] = this.simulationService.simulateGroupMatch({ ...simulatedMatches[start] });
        simulatedMatches[start + 1] = this.simulationService.simulateGroupMatch({ ...simulatedMatches[start + 1] });
        return { ...g, matches: simulatedMatches };
      });

      this.stateService.setGroups(updatedGroups);
      this.stateService.setStep(nextStep);

      if (nextStep === 3) {
        // Ao fim da rodada 3, gera o bracket inicial (vazio)
        const root = this.simulationService.generateKnockoutBracket(updatedGroups);
        this.stateService.setKnockout(root);
      }
    } else {
      // Mata-Mata
      this.activeTab = 'mata-mata';
      const root = this.tournamentState().knockoutRoot;
      if (root) {
        const roundMap: Record<number, 'R16' | 'QF' | 'SF' | 'F'> = {
          3: 'R16', 4: 'QF', 5: 'SF', 6: 'F'
        };
        
        this.simulationService.simulateKnockoutRound(root, roundMap[this.currentStep]);
        this.stateService.setKnockout({ ...root });
        this.stateService.setStep(nextStep);
        
        if (nextStep === 7) {
          this.simulationComplete = true;
          this.submitFinalResult();
        }
      }
    }
  }

  private submitFinalResult() {
    const final = this.finalMatch;
    if (!final || !final.result || !final.winner) return;

    const payload = {
      equipeA: final.teamA?.id,
      equipeB: final.teamB?.id,
      golsEquipeA: final.result.golsEquipeA,
      golsEquipeB: final.result.golsEquipeB,
      golsPenaltyTimeA: final.result.golsPenaltyTimeA || 0,
      golsPenaltyTimeB: final.result.golsPenaltyTimeB || 0
    };

    this.apiService.submitFinalResult(payload).subscribe({
      next: (res) => {
        console.log('Resultado final enviado com sucesso:', res);
        alert(`Simulação concluída! Campeão: ${final.winner?.name}`);
      },
      error: (err) => {
        console.error('Erro ao enviar resultado final:', err);
      }
    });
  }

  reset() {
    this.stateService.resetState();
    this.simulationComplete = false;
    this.activeTab = 'grupos';
    this.initTournament();
  }
}
