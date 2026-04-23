import { Team } from './team.model';
import { Group } from './group.model';
import { KnockoutMatch } from './knockout-match.model';

export interface TournamentState {
  teams: Team[];
  groups: Group[];
  knockoutRoot: KnockoutMatch | null;  // raiz da árvore binária do mata-mata
  champion: Team | null;
}
