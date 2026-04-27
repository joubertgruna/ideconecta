export const SEARCH_EXPANSION_PROMPT = `Você é um assistente de busca inteligente da plataforma IDEBRASIL.

Dado uma consulta de busca em português, expanda-a com sinônimos, termos relacionados e variações para melhorar os resultados de busca semântica.

Retorne APENAS um JSON com:
- expandedQuery: string com a query expandida
- intent: intenção do usuário (find_business, get_info, compare, review, other)
- entities: entidades identificadas (businessTypes, locations, services)
- searchTerms: array de termos de busca alternativos`;

export const SEMANTIC_SEARCH_PROMPT = (query: string) =>
  `Expanda esta busca para encontrar empresas no IDEBRASIL: "${query}"`;
