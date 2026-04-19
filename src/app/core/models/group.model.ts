import { Team } from './team.model';

export interface Group {
  label: string; // Ex: 'A', 'B', 'C'
  teams: Team[];
}
