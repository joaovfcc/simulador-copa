import { Injectable } from '@angular/core';
import { Team } from '../models/team.model';
import { Group } from '../models/group.model';
import { Round } from '../models/round.model';
import { Match } from '../models/match.model';

const GROUP_LABELS: Group['label'][] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

@Injectable({
  providedIn: 'root'
})
export class GroupDrawService {

  drawGroups(teams: Team[]): Group[] {
    if (teams.length !== 32) {
      throw new Error(`GroupDrawService: esperado 32 equipes, recebido ${teams.length}.`);
    }

    const shuffled = this.shuffle([...teams]); // nunca muta o array original

    return GROUP_LABELS.map((label, i) => ({
      label,
      teams: shuffled.slice(i * 4, i * 4 + 4),
      matches: [],
    }));
  }

  generateRounds(teams: Team[]): Round[] {
    // Algoritmo de rotação circular (round-robin)
    // O time na posição 0 é fixo; os outros 3 rotacionam a cada rodada
    const [fixed, ...rotating] = [...teams];
    const rounds: Round[] = [];

    for (let i = 0; i < 3; i++) {
      const r = [...rotating]; // cópia para não mutar durante a iteração

      rounds.push({
        matches: [
          this.makeMatch(fixed, r[2]),
          this.makeMatch(r[0], r[1]),
        ],
      });

      // Rotação clockwise: move o último para o início
      rotating.unshift(rotating.pop()!);
    }

    return rounds;
  }

  // ─── Helpers privados ─────────────────────────────────────────────────────

  private makeMatch(teamA: Team, teamB: Team): Match {
    return { equipeA: teamA.id, equipeB: teamB.id, golsEquipeA: 0, golsEquipeB: 0, played: false };
  }

  private shuffle<T>(arr: T[]): T[] {
    // Fisher-Yates — distribuição uniforme garantida
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
