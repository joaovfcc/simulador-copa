import { Injectable, signal, computed } from '@angular/core';
import { TournamentState } from '../models/tournament-state.model';
import { Team } from '../models/team.model';

@Injectable({
  providedIn: 'root'
})
export class TournamentStateService {
  private readonly STORAGE_KEY = 'wc-simulator:state';

  private readonly _state = signal<TournamentState>(this.loadInitialState());

  /**
   * Signal público somente leitura para o estado da competição.
   * Retorna uma cópia para garantir que alterações externas não corrompam o estado interno.
   * Usamos Object.freeze para evitar mutações acidentais no objeto retornado.
   */
  readonly state = computed(() => {
    const s = this._state();
    return {
      ...s,
      teams: Object.freeze([...s.teams]) as Team[],
      groups: Object.freeze([...s.groups])
    };
  });

  constructor() {}

  private loadInitialState(): TournamentState {
    const defaultState: TournamentState = {
      teams: [],
      groups: [],
      knockoutRoot: null,
      champion: null
    };

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return defaultState;

      const parsed = JSON.parse(stored) as TournamentState;
      
      // Validação de integridade: todas as equipes devem ter o UUID preservado
      const isValid = parsed.teams && Array.isArray(parsed.teams) && 
                      parsed.teams.every(team => !!team.id);
                      
      if (!isValid) {
        return defaultState;
      }

      return parsed;
    } catch {
      // Retorna estado inicial limpo em caso de erro no JSON
      return defaultState;
    }
  }

  /**
   * Registra as 32 seleções e persiste o estado inicial.
   * @throws Erro se o número de seleções for diferente de 32.
   */
  setTeams(teams: Team[]): void {
    if (teams.length !== 32) {
      throw new Error('O torneio exige exatamente 32 equipes.');
    }

    // Usamos spread para garantir que estamos criando novas referências (imutabilidade)
    this.updateState({ 
      ...this._state(), 
      teams: [...teams] 
    });
  }

  /**
   * Remove todo o progresso da simulação e limpa o LocalStorage.
   */
  resetState(): void {
    this._state.set({
      teams: [],
      groups: [],
      knockoutRoot: null,
      champion: null
    });
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Atualiza o signal e sincroniza com o LocalStorage.
   */
  private updateState(newState: TournamentState): void {
    // Congelamos o estado interno para garantir que nada o altere fora do fluxo do signal
    this._state.set(newState);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newState));
  }
}
