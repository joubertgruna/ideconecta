-- Inicialização do banco de dados IDEBRASIL Platform

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Criar banco de dados (se não existir)
CREATE DATABASE IF NOT EXISTS idebrasil_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE idebrasil_platform;

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    ramo_atuacao ENUM('comercio', 'industrial', 'prestacao_servico') NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de empresas
CREATE TABLE IF NOT EXISTS empresas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    celular VARCHAR(20) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    endereco TEXT NOT NULL,
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    telefone VARCHAR(20),
    email_empresa VARCHAR(255),
    website VARCHAR(255),
    instagram VARCHAR(255),
    descricao_servico TEXT NOT NULL,
    ramo_atuacao ENUM('comercio', 'industrial', 'prestacao_servico') NOT NULL,
    categoria_id INT NOT NULL,
    logo_url VARCHAR(500),
    status ENUM('pendente', 'verificado', 'rejeitado') DEFAULT 'pendente',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    cpf VARCHAR(14),
    telefone VARCHAR(20),
    data_nascimento DATE,
    tipo ENUM('admin', 'empresa', 'usuario') NOT NULL DEFAULT 'usuario',
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de usuários administrativos (futuramente)
CREATE TABLE IF NOT EXISTS admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir categorias iniciais
INSERT INTO categorias (nome, ramo_atuacao) VALUES
-- Comércio
('Alimentação', 'comercio'),
('Vestuário', 'comercio'),
('Material de Construção', 'comercio'),
('Informática', 'comercio'),
('Farmácia', 'comercio'),
('Supermercado', 'comercio'),
('Loja de Conveniência', 'comercio'),
('Artigos Esportivos', 'comercio'),
('Livros e Papelaria', 'comercio'),
('Eletrodomésticos', 'comercio'),

-- Industrial
('Metalurgia', 'industrial'),
('Alimentos e Bebidas', 'industrial'),
('Têxtil', 'industrial'),
('Química', 'industrial'),
('Plástico', 'industrial'),
('Madeira', 'industrial'),
('Cerâmica', 'industrial'),
('Vidro', 'industrial'),
('Papel e Celulose', 'industrial'),
('Automotiva', 'industrial'),

-- Prestação de Serviços
('Consultoria', 'prestacao_servico'),
('Manutenção', 'prestacao_servico'),
('Transporte', 'prestacao_servico'),
('Educação', 'prestacao_servico'),
('Saúde', 'prestacao_servico'),
('Contabilidade', 'prestacao_servico'),
('Advocacia', 'prestacao_servico'),
('Marketing', 'prestacao_servico'),
('Tecnologia da Informação', 'prestacao_servico'),
('Engenharia', 'prestacao_servico');

-- Criar índices para melhor performance
CREATE INDEX idx_empresas_status ON empresas(status);
CREATE INDEX idx_empresas_categoria ON empresas(categoria_id);
CREATE INDEX idx_empresas_ramo ON empresas(ramo_atuacao);
CREATE INDEX idx_empresas_cpf ON empresas(cpf);
CREATE INDEX idx_empresas_cidade ON empresas(cidade);
CREATE INDEX idx_empresas_estado ON empresas(estado);
CREATE INDEX idx_empresas_criado_em ON empresas(criado_em);

-- Usuário admin inicial (senha: admin123)
INSERT INTO admin_users (username, password_hash, email) VALUES
('admin', '$2b$10$rOz8vZxZxZxZxZxZxZxZxO8vZxZxZxZxZxZxZxZxZxZxZxZxZx', 'admin@idebrasil.com.br');

-- =============================================
-- DADOS DE TESTE - Empresas para validação do módulo de busca
-- =============================================
INSERT INTO empresas (nome, email, celular, cpf, razao_social, nome_fantasia, cnpj, endereco, numero, bairro, cidade, estado, cep, telefone, email_empresa, website, descricao_servico, ramo_atuacao, categoria_id, status) VALUES
('TechSoluções LTDA', 'contato@techsolucoes.com.br', '(11) 99999-0001', '111.111.111-01', 'TechSoluções Tecnologia LTDA', 'TechSoluções', '11.111.111/0001-01', 'Rua das Palmeiras, 100', '100', 'Centro', 'São Paulo', 'SP', '01310-100', '(11) 3333-0001', 'contato@techsolucoes.com.br', 'https://techsolucoes.com.br', 'Desenvolvimento de sistemas e consultoria em TI para empresas de todos os portes.', 'prestacao_servico', 29, 'verificado'),
('Mercado Bom Preço', 'compras@bomprecao.com.br', '(21) 99999-0002', '222.222.222-02', 'Mercado Bom Preço EIRELI', 'Bom Preço', '22.222.222/0001-02', 'Av. das Américas, 500', '500', 'Barra da Tijuca', 'Rio de Janeiro', 'RJ', '22640-100', '(21) 2222-0002', 'compras@bomprecao.com.br', NULL, 'Supermercado com grande variedade de produtos alimentícios, limpeza e higiene.', 'comercio', 6, 'verificado'),
('Construtora Norte Sul', 'obras@nortesul.com.br', '(31) 99999-0003', '333.333.333-03', 'Norte Sul Construções LTDA', 'Norte Sul', '33.333.333/0001-03', 'Rua dos Andradas, 200', '200', 'Savassi', 'Belo Horizonte', 'MG', '30112-020', '(31) 3333-0003', 'obras@nortesul.com.br', 'https://nortesul.eng.br', 'Engenharia civil, reformas e construções residenciais e comerciais.', 'prestacao_servico', 30, 'verificado'),
('Metalúrgica ABC', 'vendas@metalurgicaabc.com.br', '(11) 99999-0004', '444.444.444-04', 'Metalúrgica ABC Indústria LTDA', 'Metal ABC', '44.444.444/0001-04', 'Rua Industrial, 1000', '1000', 'Distrito Industrial', 'Guarulhos', 'SP', '07140-000', '(11) 2244-0004', 'vendas@metalurgicaabc.com.br', NULL, 'Fabricação de peças e componentes metálicos sob encomenda para indústria.', 'industrial', 11, 'verificado'),
('Clínica Saúde Plena', 'agenda@saudeplena.med.br', '(11) 99999-0005', '555.555.555-05', 'Saúde Plena Serviços Médicos SS', 'Saúde Plena', '55.555.555/0001-05', 'Av. Paulista, 1500', '1500', 'Bela Vista', 'São Paulo', 'SP', '01310-200', '(11) 3300-0005', 'agenda@saudeplena.med.br', 'https://saudeplena.med.br', 'Clínica multidisciplinar com médicos especialistas, exames e tratamentos.', 'prestacao_servico', 25, 'verificado'),
('Contabilidade Fácil', 'atendimento@contabilfacil.com.br', '(41) 99999-0006', '666.666.666-06', 'Contabilidade Fácil SS LTDA', 'ContaFácil', '66.666.666/0001-06', 'Rua XV de Novembro, 300', '300', 'Centro', 'Curitiba', 'PR', '80020-310', '(41) 3300-0006', 'atendimento@contabilfacil.com.br', NULL, 'Serviços contábeis completos: abertura de empresa, folha, declarações e consultoria fiscal.', 'prestacao_servico', 26, 'verificado'),
('Loja Fashion Style', 'vendas@fashionstyle.com.br', '(51) 99999-0007', '777.777.777-07', 'Fashion Style Comércio LTDA', 'Fashion Style', '77.777.777/0001-07', 'Av. Ipiranga, 400', '400', 'Centro Histórico', 'Porto Alegre', 'RS', '90160-090', '(51) 3388-0007', 'vendas@fashionstyle.com.br', 'https://fashionstyle.com.br', 'Moda feminina e masculina com as últimas tendências nacionais e internacionais.', 'comercio', 2, 'verificado'),
('Indústria Têxtil Boa Linha', 'comercial@boalinha.ind.br', '(16) 99999-0008', '888.888.888-08', 'Boa Linha Têxtil Indústria LTDA', 'Boa Linha', '88.888.888/0001-08', 'Rodovia SP-310, Km 5', 'S/N', 'Distrito Industrial', 'Ribeirão Preto', 'SP', '14090-000', '(16) 3600-0008', 'comercial@boalinha.ind.br', NULL, 'Fabricação de tecidos e confecções para atacado e varejo em todo o Brasil.', 'industrial', 13, 'verificado'),
('Transporte Rápido Express', 'operacoes@rapidoexpress.com.br', '(62) 99999-0009', '999.999.999-09', 'Rápido Express Transportes LTDA', 'Rápido Express', '99.999.999/0001-09', 'Av. T-63, 1200', '1200', 'Jardim Goiás', 'Goiânia', 'GO', '74280-050', '(62) 3300-0009', 'operacoes@rapidoexpress.com.br', NULL, 'Transporte de cargas fracionadas e lotação para todo o território nacional.', 'prestacao_servico', 23, 'verificado'),
('Marketing Digital 360', 'hello@mktdigital360.com.br', '(11) 99999-0010', '101.010.101-10', 'Marketing Digital 360 Agência LTDA', 'MKT360', '10.101.010/0001-10', 'Rua Frei Caneca, 80', '80', 'Consolação', 'São Paulo', 'SP', '01307-000', '(11) 3333-0010', 'hello@mktdigital360.com.br', 'https://mkt360.com.br', 'Agência de marketing digital: SEO, redes sociais, gestão de tráfego pago e branding.', 'prestacao_servico', 28, 'verificado'),
('Farmácia Vida Saudável', 'atendimento@vidasaudavel.farm.br', '(85) 99999-0011', '111.222.333-11', 'Vida Saudável Farmácia LTDA', 'Vida Saudável', '11.122.233/0001-11', 'Av. Bezerra de Menezes, 600', '600', 'São Gerardo', 'Fortaleza', 'CE', '60325-000', '(85) 3388-0011', 'atendimento@vidasaudavel.farm.br', NULL, 'Farmácia completa com medicamentos, cosméticos, perfumaria e manipulação.', 'comercio', 5, 'verificado'),
('Advocacia Silva & Associados', 'contato@silvaadvocacia.adv.br', '(71) 99999-0012', '121.212.121-12', 'Silva & Associados Advocacia SS', 'Silva Advocacia', '12.121.212/0001-12', 'Av. Tancredo Neves, 800', '800', 'Caminho das Árvores', 'Salvador', 'BA', '41820-021', '(71) 3300-0012', 'contato@silvaadvocacia.adv.br', 'https://silvaadvocacia.adv.br', 'Escritório de advocacia com atuação em direito empresarial, trabalhista e cível.', 'prestacao_servico', 27, 'verificado');

-- Tabela de alunos (para importação e gerenciamento)
CREATE TABLE IF NOT EXISTS alunos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(255),
    telefone VARCHAR(20),
    curso VARCHAR(100),
    turma VARCHAR(50),
    status_aluno ENUM('ativo', 'inativo', 'concluído') DEFAULT 'ativo',
    importado_por VARCHAR(100) DEFAULT 'admin',
    data_importacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    importado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_alunos_cpf (cpf),
    INDEX idx_alunos_status (status_aluno),
    INDEX idx_alunos_data_importacao (data_importacao),
    INDEX idx_alunos_curso (curso)
);

-- Logs de auditoria (futuramente)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tabela VARCHAR(50) NOT NULL,
    acao VARCHAR(20) NOT NULL,
    registro_id INT,
    usuario_id INT,
    dados_antigos JSON,
    dados_novos JSON,
    ip_address VARCHAR(45),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);