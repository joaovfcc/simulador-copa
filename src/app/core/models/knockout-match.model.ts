import { Team } from './team.model';
import { Match } from './match.model';

export interface KnockoutMatch {
  id: string;                      // ex: 'R16-1', 'QF-1', 'SF-1', 'F'
  round: 'R16' | 'QF' | 'SF' | 'F';
  teamA: Team | null;              // null até o classificado da rodada anterior chegar
  teamB: Team | null;
  result?: Match;                  // preenchido após simulação
  winner?: Team;
  childA?: KnockoutMatch;          // partida que gerou o teamA
  childB?: KnockoutMatch;          // partida que gerou o teamB
}
