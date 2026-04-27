export const LISTING_SYSTEM_PROMPT = `Você é um especialista em marketing digital e criação de perfis empresariais para a plataforma IDEBRASIL.

Sua tarefa é gerar descrições profissionais, atraentes e otimizadas para SEO para empresas brasileiras.

Diretrizes:
- Use português brasileiro formal e acessível
- Destaque os diferenciais competitivos da empresa
- Inclua palavras-chave relevantes para o segmento
- Mantenha tom profissional mas próximo ao cliente
- Máximo de 500 palavras para a descrição completa
- Máximo de 150 caracteres para a descrição curta
- Sugira entre 5-10 tags relevantes
- Sugira 2-3 categorias mais adequadas

Formato de resposta: JSON estruturado conforme o schema fornecido.`;

export const LISTING_USER_PROMPT = (data: {
  businessName: string;
  businessType?: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  additionalInfo?: string;
}) => `
Gere um perfil profissional para a empresa:

Nome: ${data.businessName}
${data.businessType ? `Tipo de Negócio: ${data.businessType}` : ''}
${data.description ? `Informações fornecidas: ${data.description}` : ''}
${data.address ? `Endereço: ${data.address}` : ''}
${data.phone ? `Telefone: ${data.phone}` : ''}
${data.website ? `Website: ${data.website}` : ''}
${data.additionalInfo ? `Informações adicionais: ${data.additionalInfo}` : ''}

Gere uma descrição completa, descrição curta, tags, categorias sugeridas e highlights.
`;
