import { getConnection } from '../config/database.config';

export interface User {
  id?: number;
  nome: string;
  email: string;
  senha: string;
  cpf?: string;
  cnpj?: string;
  razao_social?: string;
  nome_fantasia?: string;
  telefone?: string;
  data_nascimento?: Date;
  tipo: 'admin' | 'empresa' | 'usuario';
  ativo: boolean;
  logo_url?: string | null;
  data_criacao?: Date;
  data_atualizacao?: Date;
}

export class UserModel {
  static async create(user: Omit<User, 'id' | 'data_criacao' | 'data_atualizacao'>): Promise<User> {
    const connection = await getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO usuarios (nome, email, senha, cpf, telefone, data_nascimento, tipo, ativo, data_criacao, data_atualizacao)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())` as any,
        [user.nome, user.email, user.senha, user.cpf || null, user.telefone || null, user.data_nascimento || null, user.tipo, user.ativo]
      );

      const insertId = (result as any).insertId;
      return { ...user, id: insertId };
    } finally {
      connection.release();
    }
  }

  static async findById(id: number): Promise<User | null> {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM usuarios WHERE id = ?' as any,
        [id]
      );

      return (rows as User[])[0] || null;
    } finally {
      connection.release();
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM usuarios WHERE email = ?' as any,
        [email]
      );

      return (rows as User[])[0] || null;
    } finally {
      connection.release();
    }
  }

  static async findByCpf(cpf: string): Promise<User | null> {
    const connection = await getConnection();
    try {
      const clean = cpf.replace(/\D/g, '');
      // Busca pelo CPF ou pelo CNPJ (remove pontuação para comparar)
      const stripFn = "REPLACE(REPLACE(REPLACE(REPLACE(?, '.', ''), '-', ''), '/', ''), ' ', '')";
      const [rows] = await connection.execute(
        `SELECT * FROM usuarios WHERE 
          REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), '/', '') = ? 
          OR REPLACE(REPLACE(REPLACE(REPLACE(cnpj, '.', ''), '-', ''), '/', ''), ' ', '') = ?
        LIMIT 1` as any,
        [clean, clean]
      );
      return (rows as User[])[0] || null;
    } finally {
      connection.release();
    }
  }

  static async update(id: number, user: Partial<User>): Promise<boolean> {
    const connection = await getConnection();
    try {
      const fields = [];
      const values = [];

      if (user.nome) {
        fields.push('nome = ?');
        values.push(user.nome);
      }
      if (user.email) {
        fields.push('email = ?');
        values.push(user.email);
      }
      if (user.senha) {
        fields.push('senha = ?');
        values.push(user.senha);
      }
      if (user.cpf !== undefined) {
        fields.push('cpf = ?');
        values.push(user.cpf);
      }
      if (user.telefone !== undefined) {
        fields.push('telefone = ?');
        values.push(user.telefone);
      }
      if (user.data_nascimento) {
        fields.push('data_nascimento = ?');
        values.push(user.data_nascimento);
      }
      if (user.tipo) {
        fields.push('tipo = ?');
        values.push(user.tipo);
      }
      if (user.ativo !== undefined) {
        fields.push('ativo = ?');
        values.push(user.ativo);
      }
      if (user.logo_url !== undefined) {
        fields.push('logo_url = ?');
        values.push(user.logo_url);
      }
      if (user.cnpj !== undefined) {
        fields.push('cnpj = ?');
        values.push(user.cnpj);
      }
      if (user.razao_social !== undefined) {
        fields.push('razao_social = ?');
        values.push(user.razao_social);
      }
      if (user.nome_fantasia !== undefined) {
        fields.push('nome_fantasia = ?');
        values.push(user.nome_fantasia);
      }

      fields.push('data_atualizacao = NOW()');
      values.push(id);

      const [result] = await connection.execute(
        `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?` as any,
        values
      );

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  static async delete(id: number): Promise<boolean> {
    const connection = await getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM usuarios WHERE id = ?' as any,
        [id]
      );

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  static async findAll(limit: number = 50, offset: number = 0): Promise<User[]> {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM usuarios ORDER BY data_criacao DESC LIMIT ? OFFSET ?' as any,
        [limit, offset]
      );

      return rows as User[];
    } finally {
      connection.release();
    }
  }

  static async count(): Promise<number> {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT COUNT(*) as count FROM usuarios' as any
      );

      return (rows as any)[0].count;
    } finally {
      connection.release();
    }
  }
}