import { Injectable } from '@angular/core';
import { Team } from '../models/team.model';
import { Match } from '../models/match.model';
import { Standing } from '../models/standing.model';
import { KnockoutMatch } from '../models/knockout-match.model';
import { Group } from '../models/group.model';

@Injectable({
  providedIn: 'root'
})
export class SimulationService {

  /**
   * Distribuição ponderada para produzir placares realistas (0-4 gols)
   */
  simulateGoals(): number {
    const r = Math.random();
    if (r < 0.30) return 0;
    if (r < 0.60) return 1;
    if (r < 0.80) return 2;
    if (r < 0.92) return 3;
    return 4;
  }

  /**
   * Simula série de 5 cobranças + morte súbita até desempate
   */
  simulatePenalties(): { penaltyA: number; penaltyB: number } {
    let penaltyA = 0, penaltyB = 0;

    for (let i = 0; i < 5; i++) {
      if (Math.random() > 0.25) penaltyA++;
      if (Math.random() > 0.25) penaltyB++;
    }

    // Morte súbita se empatado após 5 cobranças
    while (penaltyA === penaltyB) {
      if (Math.random() > 0.25) penaltyA++;
      if (Math.random() > 0.25) penaltyB++;
    }

    return { penaltyA, penaltyB };
  }

  /**
   * Simula placar de uma partida da fase de grupos
   */
  simulateGroupMatch(match: Match): Match {
    match.golsEquipeA = this.simulateGoals();
    match.golsEquipeB = this.simulateGoals();
    match.played = true;
    return match;
  }

  /**
   * Calcula a tabela de classificação baseada nos resultados das partidas
   * Aplica desempate em cascata: Pontos -> Saldo de Gols -> Sorteio
   */
  calculateStandings(teams: Team[], matches: Match[]): Standing[] {
    const standingsMap = new Map<string, Standing>();
    
    teams.forEach(team => {
      standingsMap.set(team.id, {
        team,
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      });
    });

    matches.forEach(m => {
      if (!m.played) return;

      // Encontrar os times no standingsMap baseando-se nos IDs de equipeA e equipeB
      const sA = standingsMap.get(m.equipeA)!;
      const sB = standingsMap.get(m.equipeB)!;

      sA.goalsFor += m.golsEquipeA;
      sA.goalsAgainst += m.golsEquipeB;
      sA.goalDifference = sA.goalsFor - sA.goalsAgainst;

      sB.goalsFor += m.golsEquipeB;
      sB.goalsAgainst += m.golsEquipeA;
      sB.goalDifference = sB.goalsFor - sB.goalsAgainst;

      if (m.golsEquipeA > m.golsEquipeB) {
        sA.points += 3;
        sA.wins++;
        sB.losses++;
      } else if (m.golsEquipeA < m.golsEquipeB) {
        sB.points += 3;
        sB.wins++;
        sA.losses++;
      } else {
        sA.points += 1;
        sA.draws++;
        sB.points += 1;
        sB.draws++;
      }
    });

    return Array.from(standingsMap.values()).sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;
      if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
      return Math.random() > 0.5 ? 1 : -1;
    });
  }

  /**
   * Monta o bracket inicial do mata-mata cruzando os classificados dos grupos
   */
  generateKnockoutBracket(groups: Group[]): KnockoutMatch {
    const standings = groups.reduce((acc, group) => {
      acc[group.label] = this.calculateStandings(group.teams, group.matches);
      return acc;
    }, {} as Record<string, Standing[]>);

    // Oitavas de Final (R16)
    const r16: KnockoutMatch[] = [
      { id: 'R16-1', round: 'R16', teamA: standings['A'][0].team, teamB: standings['B'][1].team },
      { id: 'R16-2', round: 'R16', teamA: standings['C'][0].team, teamB: standings['D'][1].team },
      { id: 'R16-3', round: 'R16', teamA: standings['E'][0].team, teamB: standings['F'][1].team },
      { id: 'R16-4', round: 'R16', teamA: standings['G'][0].team, teamB: standings['H'][1].team },
      { id: 'R16-5', round: 'R16', teamA: standings['B'][0].team, teamB: standings['A'][1].team },
      { id: 'R16-6', round: 'R16', teamA: standings['D'][0].team, teamB: standings['C'][1].team },
      { id: 'R16-7', round: 'R16', teamA: standings['F'][0].team, teamB: standings['E'][1].team },
      { id: 'R16-8', round: 'R16', teamA: standings['H'][0].team, teamB: standings['G'][1].team },
    ];

    // Quartas de Final (QF)
    const qf: KnockoutMatch[] = [
      { id: 'QF-1', round: 'QF', teamA: null, teamB: null, childA: r16[0], childB: r16[1] },
      { id: 'QF-2', round: 'QF', teamA: null, teamB: null, childA: r16[2], childB: r16[3] },
      { id: 'QF-3', round: 'QF', teamA: null, teamB: null, childA: r16[4], childB: r16[5] },
      { id: 'QF-4', round: 'QF', teamA: null, teamB: null, childA: r16[6], childB: r16[7] },
    ];

    // Semifinais (SF)
    const sf: KnockoutMatch[] = [
      { id: 'SF-1', round: 'SF', teamA: null, teamB: null, childA: qf[0], childB: qf[1] },
      { id: 'SF-2', round: 'SF', teamA: null, teamB: null, childA: qf[2], childB: qf[3] },
    ];

    // Final
    return { id: 'F', round: 'F', teamA: null, teamB: null, childA: sf[0], childB: sf[1] };
  }

  /**
   * Resolve uma rodada específica do mata-mata, propagando vencedores
   */
  simulateKnockoutRound(node: KnockoutMatch | undefined | null, targetRound: 'R16' | 'QF' | 'SF' | 'F'): void {
    if (!node) return;

    // Resolve recursivamente para garantir que os filhos (fases anteriores)
    // propaguem seus vencedores antes da fase atual ser simulada
    if (node.childA) this.simulateKnockoutRound(node.childA, targetRound);
    if (node.childB) this.simulateKnockoutRound(node.childB, targetRound);

    // Propaga os vencedores dos filhos se existirem (para nós pai)
    if (node.childA?.winner && !node.teamA) node.teamA = node.childA.winner;
    if (node.childB?.winner && !node.teamB) node.teamB = node.childB.winner;

    // Se este nó for da rodada alvo e tiver os times prontos, mas não simulado ainda
    if (node.round === targetRound && node.teamA && node.teamB && !node.result) {
      this.resolveMatch(node);
    }
  }

  /**
   * Travessia em pós-ordem para resolver a árvore do mata-mata
   */
  simulateKnockoutMatch(node: KnockoutMatch): Team {
    // Caso base: oitavas (ou nós folha com times já definidos)
    if (!node.childA && !node.childB) {
      return this.resolveMatch(node);
    }

    // Pós-ordem: resolve filhos antes do pai
    if (node.childA) {
      node.teamA = this.simulateKnockoutMatch(node.childA);
    }
    if (node.childB) {
      node.teamB = this.simulateKnockoutMatch(node.childB);
    }
    
    return this.resolveMatch(node);
  }

  private resolveMatch(node: KnockoutMatch): Team {
    if (!node.teamA || !node.teamB) {
      throw new Error(`SimulationService: Confronto ${node.id} incompleto.`);
    }

    const goalsA = this.simulateGoals();
    const goalsB = this.simulateGoals();

    if (goalsA !== goalsB) {
      node.result = { 
        equipeA: node.teamA.id, 
        equipeB: node.teamB.id, 
        golsEquipeA: goalsA, 
        golsEquipeB: goalsB 
      };
      node.winner = goalsA > goalsB ? node.teamA : node.teamB;
    } else {
      const { penaltyA, penaltyB } = this.simulatePenalties();
      node.result = { 
        equipeA: node.teamA.id, 
        equipeB: node.teamB.id, 
        golsEquipeA: goalsA, 
        golsEquipeB: goalsB, 
        golsPenaltyTimeA: penaltyA, 
        golsPenaltyTimeB: penaltyB 
      };
      node.winner = penaltyA > penaltyB ? node.teamA : node.teamB;
    }

    return node.winner!;
  }
}
