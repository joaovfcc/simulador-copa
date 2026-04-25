import { TestBed } from '@angular/core/testing';
import { SimulationService } from './simulation.service';
import { Team } from '../models/team.model';
import { Match } from '../models/match.model';
import { KnockoutMatch } from '../models/knockout-match.model';

describe('SimulationService', () => {
  let service: SimulationService;
  
  const teamA: Team = { id: 'A', name: 'Team A' };
  const teamB: Team = { id: 'B', name: 'Team B' };
  const teamC: Team = { id: 'C', name: 'Team C' };
  const teamD: Team = { id: 'D', name: 'Team D' };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimulationService);
  });

  // Placar
  it('deve retornar um placar com gols entre 0 e 4 para cada time', () => {
    for (let i = 0; i < 100; i++) {
      const goals = service.simulateGoals();
      expect(goals).toBeGreaterThanOrEqual(0);
      expect(goals).toBeLessThanOrEqual(4);
    }
  });

  // Desempate e Pontuação
  it('deve atribuir 3 pontos ao vencedor e 0 ao perdedor', () => {
    const match: Match = { equipeA: teamA.id, equipeB: teamB.id, golsEquipeA: 2, golsEquipeB: 1, played: true };
    const standings = service.calculateStandings([teamA, teamB], [match]);
    
    const sA = standings.find(s => s.team.id === 'A')!;
    const sB = standings.find(s => s.team.id === 'B')!;
    
    expect(sA.points).toBe(3);
    expect(sB.points).toBe(0);
    expect(sA.wins).toBe(1);
    expect(sB.losses).toBe(1);
  });

  it('deve atribuir 1 ponto a cada equipe em caso de empate na fase de grupos', () => {
    const match: Match = { equipeA: teamA.id, equipeB: teamB.id, golsEquipeA: 1, golsEquipeB: 1, played: true };
    const standings = service.calculateStandings([teamA, teamB], [match]);
    
    const sA = standings.find(s => s.team.id === 'A')!;
    const sB = standings.find(s => s.team.id === 'B')!;
    
    expect(sA.points).toBe(1);
    expect(sB.points).toBe(1);
    expect(sA.draws).toBe(1);
    expect(sB.draws).toBe(1);
  });

  it('deve desempatar por pontos como primeiro critério', () => {
    const match1: Match = { equipeA: teamA.id, equipeB: teamB.id, golsEquipeA: 2, golsEquipeB: 0, played: true }; // A: 3 pts, B: 0 pts
    const match2: Match = { equipeA: teamC.id, equipeB: teamA.id, golsEquipeA: 0, golsEquipeB: 1, played: true }; // C: 0 pts, A: 6 pts
    const standings = service.calculateStandings([teamA, teamB, teamC], [match1, match2]);
    
    expect(standings[0].team.id).toBe('A');
  });

  it('deve desempatar por saldo de gols como segundo critério', () => {
    // A e B com 3 pts
    const match1: Match = { equipeA: teamA.id, equipeB: teamC.id, golsEquipeA: 3, golsEquipeB: 0, played: true }; // A: 3 pts, saldo 3
    const match2: Match = { equipeA: teamB.id, equipeB: teamC.id, golsEquipeA: 1, golsEquipeB: 0, played: true }; // B: 3 pts, saldo 1
    const standings = service.calculateStandings([teamA, teamB, teamC], [match1, match2]);
    
    expect(standings[0].team.id).toBe('A');
    expect(standings[1].team.id).toBe('B');
  });

  it('deve usar sorteio aleatório como critério final de desempate', () => {
    const match1: Match = { equipeA: teamA.id, equipeB: teamB.id, golsEquipeA: 0, golsEquipeB: 0, played: true }; 
    const match2: Match = { equipeA: teamB.id, equipeB: teamC.id, golsEquipeA: 0, golsEquipeB: 0, played: true }; 
    const match3: Match = { equipeA: teamA.id, equipeB: teamC.id, golsEquipeA: 0, golsEquipeB: 0, played: true }; 
    
    const standings = service.calculateStandings([teamA, teamB, teamC], [match1, match2, match3]);
    
    expect(standings.length).toBe(3);
    const pointSet = new Set(standings.map(s => s.points));
    expect(pointSet.size).toBe(1);
  });

  // Pênaltis
  it('deve simular série de pênaltis garantindo um vencedor', () => {
    for (let i = 0; i < 50; i++) {
      const { penaltyA, penaltyB } = service.simulatePenalties();
      expect(penaltyA).not.toBe(penaltyB);
    }
  });

  // Mata-mata
  it('deve nunca produzir empate como resultado final de uma partida eliminatória', () => {
    const node: KnockoutMatch = { id: 'R16-1', round: 'R16', teamA, teamB };
    const winner = service.simulateKnockoutMatch(node);
    
    expect(winner).toBeDefined();
    expect([teamA.id, teamB.id]).toContain(winner.id);
    
    if (node.result!.golsEquipeA === node.result!.golsEquipeB) {
      expect(node.result!.golsPenaltyTimeA).toBeDefined();
      expect(node.result!.golsPenaltyTimeB).toBeDefined();
      expect(node.result!.golsPenaltyTimeA).not.toBe(node.result!.golsPenaltyTimeB);
    } else {
      expect(node.result!.golsEquipeA).not.toBe(node.result!.golsEquipeB);
    }
  });

  it('deve propagar o vencedor de cada nó filho para o nó pai da árvore', () => {
    const childA: KnockoutMatch = { id: 'R16-1', round: 'R16', teamA, teamB: teamC };
    const childB: KnockoutMatch = { id: 'R16-2', round: 'R16', teamA: teamB, teamB: teamD };
    
    const parent: KnockoutMatch = { 
      id: 'QF-1', 
      round: 'QF', 
      teamA: null, 
      teamB: null,
      childA,
      childB
    };

    const finalWinner = service.simulateKnockoutMatch(parent);
    
    expect(parent.teamA).toBeDefined();
    expect(parent.teamB).toBeDefined();
    expect([teamA.id, teamC.id]).toContain(parent.teamA!.id);
    expect([teamB.id, teamD.id]).toContain(parent.teamB!.id);
    expect(finalWinner).toBeDefined();
    expect(parent.winner).toBe(finalWinner);
  });

  it('deve preencher teamA e teamB do nó pai com os vencedores dos filhos antes de simular', () => {
    const childA: KnockoutMatch = { id: 'SF-1', round: 'SF', teamA, teamB: teamC };
    const childB: KnockoutMatch = { id: 'SF-2', round: 'SF', teamA: teamB, teamB: teamD };
    
    const parent: KnockoutMatch = { 
      id: 'F', 
      round: 'F', 
      teamA: null, 
      teamB: null,
      childA,
      childB
    };

    service.simulateKnockoutMatch(parent);
    
    expect(parent.teamA).toBe(childA.winner);
    expect(parent.teamB).toBe(childB.winner);
  });

  // Geração do Bracket
  it('deve gerar a árvore completa do mata-mata a partir dos grupos', () => {
    // Mock de 8 grupos (A-H) com 4 times cada
    const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(label => ({
      label: label as any,
      teams: [
        { id: `${label}1`, name: `Team ${label}1` },
        { id: `${label}2`, name: `Team ${label}2` },
        { id: `${label}3`, name: `Team ${label}3` },
        { id: `${label}4`, name: `Team ${label}4` }
      ],
      matches: [
        { equipeA: `${label}1`, equipeB: `${label}2`, golsEquipeA: 2, golsEquipeB: 0, played: true },
        { equipeA: `${label}1`, equipeB: `${label}3`, golsEquipeA: 2, golsEquipeB: 0, played: true },
        { equipeA: `${label}1`, equipeB: `${label}4`, golsEquipeA: 2, golsEquipeB: 0, played: true },
        { equipeA: `${label}2`, equipeB: `${label}3`, golsEquipeA: 1, golsEquipeB: 0, played: true },
        { equipeA: `${label}2`, equipeB: `${label}4`, golsEquipeA: 1, golsEquipeB: 0, played: true },
        { equipeA: `${label}3`, equipeB: `${label}4`, golsEquipeA: 1, golsEquipeB: 0, played: true }
      ] as Match[]
    }));

    const root = service.generateKnockoutBracket(groups);

    // Estrutura básica
    expect(root.round).toBe('F');
    expect(root.id).toBe('F');
    expect(root.childA?.round).toBe('SF');
    expect(root.childB?.round).toBe('SF');

    // Verificação de um cruzamento específico (1º A vs 2º B)
    const sf1 = root.childA!;
    const qf1 = sf1.childA!;
    const r16_1 = qf1.childA!;

    expect(r16_1.id).toBe('R16-1');
    expect(r16_1.teamA?.id).toBe('A1'); // 1º do Grupo A
    expect(r16_1.teamB?.id).toBe('B2'); // 2º do Grupo B
  });
});