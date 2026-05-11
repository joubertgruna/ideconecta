import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { UserModel, User } from '../models/user.model';

const router = Router();

// Middleware para verificar token JWT
const authenticateToken = (req: any, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token não fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret-key', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Registrar novo usuário
router.post('/register', [
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('tipo').isIn(['admin', 'empresa', 'usuario']).withMessage('Tipo inválido')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { nome, email, senha, cpf, telefone, data_nascimento, tipo } = req.body;

    // Verificar se email já existe
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    const user = await UserModel.create({
      nome,
      email,
      senha: hashedPassword,
      cpf,
      telefone,
      data_nascimento: data_nascimento ? new Date(data_nascimento) : undefined,
      tipo,
      ativo: true
    });

    // Remover senha do response
    const { senha: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Login para empresas por CPF ou CNPJ (sem senha)
router.post('/login-empresa', [
  body('cpf_cnpj').notEmpty().withMessage('CPF ou CNPJ é obrigatório')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Dados inválidos', errors: errors.array() });
    }

    const { cpf_cnpj } = req.body;
    const clean = (cpf_cnpj as string).replace(/\D/g, '');

    const user = await UserModel.findByCpf(clean);
    if (!user) {
      return res.status(401).json({ success: false, message: 'CPF/CNPJ não encontrado. Verifique seu cadastro.' });
    }

    if (user.tipo === 'admin') {
      return res.status(401).json({ success: false, message: 'Use o painel administrativo para login de admin' });
    }

    if (!user.ativo) {
      return res.status(401).json({ success: false, message: 'Conta desativada. Entre em contato com o suporte.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, tipo: user.tipo },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '24h' }
    );

    const { senha: _, ...userWithoutPassword } = user;
    return res.json({ success: true, message: 'Login realizado com sucesso', token, user: userWithoutPassword });
  } catch (error) {
    console.error('Erro no login empresa:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').notEmpty().withMessage('Senha é obrigatória')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { email, senha } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(senha, user.senha);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar se usuário está ativo
    if (!user.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada'
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, tipo: user.tipo },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '24h' }
    );

    // Remover senha do response
    const { senha: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Obter perfil do usuário logado
router.get('/profile', authenticateToken, async (req: any, res: Response) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Remover senha do response
    const { senha: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Atualizar perfil
router.put('/profile', authenticateToken, [
  body('nome').optional().notEmpty().withMessage('Nome não pode ser vazio'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('telefone').optional(),
  body('data_nascimento').optional().isISO8601().withMessage('Data de nascimento inválida')
], async (req: any, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { nome, email, telefone, data_nascimento, logo_url, cnpj, razao_social, nome_fantasia } = req.body;
    const userId = req.user.id;

    // Verificar se email já existe (se está sendo alterado)
    if (email) {
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Email já está em uso'
        });
      }
    }

    const updateData: Partial<User> = {};
    if (nome) updateData.nome = nome;
    if (email) updateData.email = email;
    if (telefone !== undefined) updateData.telefone = telefone;
    if (data_nascimento) updateData.data_nascimento = new Date(data_nascimento);
    if (logo_url !== undefined) updateData.logo_url = logo_url;
    if (cnpj !== undefined) updateData.cnpj = cnpj;
    if (razao_social !== undefined) updateData.razao_social = razao_social;
    if (nome_fantasia !== undefined) updateData.nome_fantasia = nome_fantasia;

    const updated = await UserModel.update(userId, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Retornar usuário atualizado
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const { senha: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Alterar senha
router.put('/password', authenticateToken, [
  body('senha_atual').notEmpty().withMessage('Senha atual é obrigatória'),
  body('nova_senha').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres')
], async (req: any, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { senha_atual, nova_senha } = req.body;
    const userId = req.user.id;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar senha atual
    const validPassword = await bcrypt.compare(senha_atual, user.senha);
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(nova_senha, 10);

    await UserModel.update(userId, { senha: hashedPassword });

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;