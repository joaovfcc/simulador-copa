import { Match } from './match.model';
import { Team } from './team.model';

describe('Match Model', () => {
  it('deve representar as propiedades base de uma partida entre duas equipes mantendo ids exigidos', () => {
    
    const team1: Team = { id: 'uuid-1', name: 'França' };
    const team2: Team = { id: 'uuid-2', name: 'Argentina' };

    // Construção de uma partida simulada no TDD
    const match: Match = {
      equipeA: team1.id,
      equipeB: team2.id,
      golsEquipeA: 3,
      golsEquipeB: 3,
      golsPenaltyTimeA: 2,
      golsPenaltyTimeB: 4 // Argentina ganha
    };

    expect(match.equipeA).toEqual('uuid-1');
    expect(match.equipeB).toEqual('uuid-2');
    expect(match.golsPenaltyTimeB).toBeGreaterThan(match.golsPenaltyTimeA as number);
  });
});
