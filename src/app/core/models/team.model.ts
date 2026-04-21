export interface Team {
  id: string; // O UUID recebido da API obrigatoriamente
  name: string;
  sigla?: string; // Coloquei como opcional caso a API forneça, mas a base é ID e Name.
}
