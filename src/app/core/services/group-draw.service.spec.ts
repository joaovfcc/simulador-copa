import { TestBed } from '@angular/core/testing';
import { GroupDrawService } from './group-draw.service';
import { Team } from '../models/team.model';

const make32Teams = (): Team[] =>
  Array.from({ length: 32 }, (_, i) => ({
    id: `uuid-${i}`,
    name: `Seleção ${i}`,
  }));

describe('GroupDrawService', () => {
  let service: GroupDrawService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupDrawService);
  });

  // ─── Distribuição dos grupos ──────────────────────────────────────────────

  it('deve gerar exatamente 8 grupos', () => {
    const groups = service.drawGroups(make32Teams());
    expect(groups).toHaveLength(8);
  });

  it('deve rotular os grupos de A a H', () => {
    const groups = service.drawGroups(make32Teams());
    const labels = groups.map(g => g.label);
    expect(labels).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
  });

  it('deve alocar exatamente 4 equipes por grupo', () => {
    const groups = service.drawGroups(make32Teams());
    groups.forEach(g => expect(g.teams).toHaveLength(4));
  });

  it('deve distribuir todas as 32 equipes sem deixar nenhuma de fora', () => {
    const teams = make32Teams();
    const groups = service.drawGroups(teams);
    const allIds = groups.flatMap(g => g.teams.map(t => t.id));
    expect(allIds).toHaveLength(32);
  });

  it('não deve repetir nenhuma equipe em grupos diferentes', () => {
    const groups = service.drawGroups(make32Teams());
    const allIds = groups.flatMap(g => g.teams.map(t => t.id));
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(32);
  });

  it('deve rejeitar entrada com número diferente de 32 equipes', () => {
    expect(() => service.drawGroups(make32Teams().slice(0, 20))).toThrow();
  });

  it('deve produzir distribuições diferentes em chamadas sucessivas', () => {
    const teams = make32Teams();
    const groupsA = service.drawGroups(teams).map(g => g.teams.map(t => t.id).join());
    const groupsB = service.drawGroups(teams).map(g => g.teams.map(t => t.id).join());
    // Chance estatística de serem iguais é astronomicamente baixa
    expect(groupsA).not.toEqual(groupsB);
  });

  // ─── Geração de rodadas (round-robin) ────────────────────────────────────

  it('deve gerar exatamente 3 rodadas por grupo', () => {
    const groups = service.drawGroups(make32Teams());
    groups.forEach(g => {
      const rounds = service.generateRounds(g.teams);
      expect(rounds).toHaveLength(3);
    });
  });

  it('deve gerar exatamente 2 jogos por rodada', () => {
    const groups = service.drawGroups(make32Teams());
    groups.forEach(g => {
      const rounds = service.generateRounds(g.teams);
      rounds.forEach(r => expect(r.matches).toHaveLength(2));
    });
  });

  it('deve garantir que todas as 4 equipes se enfrentaram ao fim das 3 rodadas', () => {
    const teams = make32Teams().slice(0, 4);
    const rounds = service.generateRounds(teams);
    const matchups = rounds
      .flatMap(r => r.matches)
      .map(m => [m.teamA.id, m.teamB.id].sort().join('vs'));

    // 4 times = 6 confrontos únicos possíveis (C(4,2))
    const unique = new Set(matchups);
    expect(unique.size).toBe(6);
  });

  it('não deve repetir nenhum confronto dentro do grupo', () => {
    const teams = make32Teams().slice(0, 4);
    const rounds = service.generateRounds(teams);
    const matchups = rounds
      .flatMap(r => r.matches)
      .map(m => [m.teamA.id, m.teamB.id].sort().join('vs'));

    const unique = new Set(matchups);
    expect(unique.size).toBe(matchups.length);
  });

  it('nenhum time deve jogar mais de uma vez na mesma rodada', () => {
    const teams = make32Teams().slice(0, 4);
    const rounds = service.generateRounds(teams);
    rounds.forEach(r => {
      const idsInRound = r.matches.flatMap(m => [m.teamA.id, m.teamB.id]);
      const unique = new Set(idsInRound);
      expect(unique.size).toBe(idsInRound.length);
    });
  });
});
