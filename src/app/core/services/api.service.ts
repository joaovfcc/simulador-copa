import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team } from '../models/team.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // TODO: Ajustaremos o host da API quando você mandar a URL final
  private readonly API_URL = 'https://api.copadomundo.com';

  constructor(private http: HttpClient) {}

  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.API_URL}/teams`);
  }
}
