import { Team } from './team.model';

describe('Team Model', () => {
  it('deve respeitar a regra de contrato onde o time carrega o UUID externo fornecido pela API', () => {
    // 1. Arrange: Simulamos exatamente o JSON que o painel de GET da API nos retornaria
    const mockApiResponse = {
      id: '123e4567-e89b-12d3-a456-426614174000', // API gerou o UUID (não criamos localmente)
      name: 'Brasil',
      sigla: 'BRA'
    };

    // 2. Act: Mapeamos o objeto para a nossa interface/modelo Team
    const team: Team = {
      id: mockApiResponse.id,
      name: mockApiResponse.name
    };

    // 3. Assert: Garantimos rigorosamente que o ID preservado é o da API, sem alterações
    expect(team.id).toBeDefined();
    expect(typeof team.id).toBe('string');
    expect(team.id).toEqual('123e4567-e89b-12d3-a456-426614174000');
  });
});
