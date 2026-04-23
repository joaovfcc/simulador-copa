import { Team } from './team.model';
import { Match } from './match.model';

export interface Group {
  label: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
  teams: Team[];
  matches: Match[];
}
