import { TestBed } from '@angular/core/testing';
import { TournamentStateService } from './tournament-state.service';
import { TournamentState } from '../models/tournament-state.model';
import { Team } from '../models/team.model';

describe('TournamentStateService', () => {
  let service: TournamentStateService;
  const STORAGE_KEY = 'wc-simulator:state:v2';

  const mockTeams: Team[] = Array.from({ length: 32 }, (_, i) => ({
    id: `uuid-${i}`,
    name: `Team ${i}`
  }));

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [TournamentStateService]
    });
    service = TestBed.inject(TournamentStateService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  // Inicialização
  it('deve inicializar com estado vazio se o LocalStorage estiver limpo', () => {
    const state = service.state();
    expect(state.teams).toEqual([]);
    expect(state.groups).toEqual([]);
    expect(state.knockoutRoot).toBeNull();
    expect(state.champion).toBeNull();
  });

  // Hidratação
  it('deve hidratar o estado em memória corretamente a partir de um save válido', () => {
    const mockState: TournamentState = {
      teams: mockTeams.slice(0, 2),
      groups: [],
      knockoutRoot: null,
      champion: null,
      currentStep: 0
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState));
    
    // Re-instanciar para testar carregamento no construtor
    const newService = TestBed.runInInjectionContext(() => new TournamentStateService());
    expect(newService.state()).toEqual(mockState);
  });

  it('deve retornar estado vazio sem lançar erro se o JSON estiver corrompido', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid-json{');
    const newService = TestBed.runInInjectionContext(() => new TournamentStateService());
    expect(newService.state().teams).toEqual([]);
  });

  // Persistência
  it('deve chamar localStorage.setItem com a chave correta ao registrar as 32 seleções', () => {
    const spy = jest.spyOn(Storage.prototype, 'setItem');
    service.setTeams(mockTeams);
    expect(spy).toHaveBeenCalledWith(STORAGE_KEY, expect.any(String));
  });

  it('deve serializar as seleções como JSON válido ao persistir', () => {
    service.setTeams(mockTeams);
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(stored!) as TournamentState;
    expect(parsed.teams).toEqual(mockTeams);
  });

  it('deve rejeitar a ingestão se o array não contiver exatamente 32 equipes', () => {
    expect(() => service.setTeams(mockTeams.slice(0, 31))).toThrow('O torneio exige exatamente 32 equipes.');
  });

  // Integridade do UUID
  it('deve preservar o UUID de cada equipe após um ciclo completo de save/load', () => {
    service.setTeams(mockTeams);
    const newService = TestBed.runInInjectionContext(() => new TournamentStateService());
    expect(newService.state().teams[0].id).toBe(mockTeams[0].id);
  });

  it('deve rejeitar a hidratação se qualquer equipe no save estiver sem UUID', () => {
    const corruptState = {
      teams: [{ name: 'Sem UUID' }],
      groups: [],
      knockoutRoot: null,
      champion: null
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(corruptState));
    const newService = TestBed.runInInjectionContext(() => new TournamentStateService());
    expect(newService.state().teams).toEqual([]);
  });

  // Reset
  it('deve zerar o signal de estado em memória ao chamar resetState()', () => {
    service.setTeams(mockTeams);
    service.resetState();
    expect(service.state().teams).toEqual([]);
  });

  it('deve remover a chave correta do LocalStorage ao chamar resetState()', () => {
    service.setTeams(mockTeams);
    service.resetState();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  // Imutabilidade
  it('não deve permitir que alterações externas no objeto retornado corrompam o estado interno', () => {
    service.setTeams(mockTeams);
    const state = service.state();
    
    // Como o serviço usa Object.freeze, tentar mutar deve lançar TypeError em modo estrito
    expect(() => {
      (state.teams as any).push({ id: 'hacker', name: 'Hacker' });
    }).toThrow();
    
    expect(service.state().teams.length).toBe(32);
    expect(service.state().teams.find(t => t.id === 'hacker')).toBeUndefined();
  });
});
