import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team } from '../models/team.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly BASE_URL = 'https://development-internship-api.geopostenergy.com/WorldCup';
  private readonly GIT_USER = 'joaovfcc';

  constructor(private http: HttpClient) { }

  getTeams(): Observable<Team[]> {
    const headers = { 'git-user': this.GIT_USER };
    return this.http.get<Team[]>(`${this.BASE_URL}/GetAllTeams`, { headers });
  }
}
