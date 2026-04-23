import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { gitUserInterceptor } from '../http/git-user.interceptor';
import { Team } from '../models/team.model';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        // Proveremos o HttpClient junto do nosso interceptor para garantir que ele injeta o header
        provideHttpClient(withInterceptors([gitUserInterceptor])),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Garante que não sobrou requisições pendentes sem testar
    httpMock.verify();
  });

  it('deve realizar GET para obter os times, contendo o header de "git-user", e mapeá-los como Team[]', () => {
    // 1. Arrange: Simulamos os dados crus retornados pela API
    const mockApiResponse = [
      { id: '1111-2222', name: 'Alemanha' },
      { id: '3333-4444', name: 'Gana' }
    ];

    // 2. Act: Chamamos nosso método
    service.getTeams().subscribe((teams: Team[]) => {
      expect(teams.length).toBe(2);
      expect(teams[0].id).toBe('1111-2222');
      expect(teams[0].name).toBe('Alemanha');
    });

    // 3. Assert Backend Call: Checamos se ocorreu um (e somente um) GET neste endpoint
    const req = httpMock.expectOne({ 
      method: 'GET', 
      url: 'https://development-internship-api.geopostenergy.com/WorldCup/GetAllTeams' 
    });

    // VALIDAMOS ESTANDO COMPLETAMENTE DE ACORDO: Tem que enviar a sua string de usuário no Git
    expect(req.request.headers.has('git-user')).toBeTruthy();
    expect(req.request.headers.get('git-user')).toBe('joaovfcc');

    // Despacha (flush) a resposta mockada para o subscribe receber e fechar o TDD
    req.flush(mockApiResponse);
  });
});
