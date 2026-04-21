import { Group } from './group.model';
import { Team } from './team.model';

describe('Group Model', () => {
  it('deve armazenar a letra do grupo (A-H) e a relação das equipes nele contidas', () => {
    
    // Arrange
    const t1: Team = { id: 'u-1', name: 'Brasil' };
    const t2: Team = { id: 'u-2', name: 'Sérvia' };
    const t3: Team = { id: 'u-3', name: 'Suíça' };
    const t4: Team = { id: 'u-4', name: 'Camarões' };

    // Act
    const groupG: Group = {
      label: 'G', 
      teams: [t1, t2, t3, t4]
    };

    // Assert
    expect(groupG.label).toBe('G');
    expect(groupG.teams.length).toBe(4);
    expect(groupG.teams[0].id).toBe('u-1');
  });
});
