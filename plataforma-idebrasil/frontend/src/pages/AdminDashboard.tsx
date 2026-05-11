import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Tooltip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  Divider,
} from '@mui/material';
import {
  Business,
  CheckCircle,
  Cancel,
  Pending,
  MoreVert,
  Email,
  Visibility,
  BarChart,
  People,
  MonitorHeart,
  PersonAdd,
  DeleteForever,
  Store,
  AccessTime,
  Edit,
  CreditCard,
  WorkspacePremium,
  Star,
  StarBorder,
  School,
  UploadFile,
  DeleteSweep,
  Search,
  AddBusiness,
} from '@mui/icons-material';
import { adminService, EmpresaStats, AdminEmpresa } from '../services/adminService';
import Relatorios from './Relatorios';
import { maskCEP, maskCNPJ, maskCPF, maskPhoneBR, normalizeEmail, normalizeName, normalizeText } from '../utils/inputMasks';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface AdminUsuario {
  id: number;
  nome: string;
  email: string;
  cpf: string | null;
  telefone: string | null;
  logo_url?: string | null;
  tipo: 'admin' | 'empresa' | 'usuario';
  ativo: number;
  data_criacao: string;
}

interface MonitoramentoData {
  totalUsuarios: number;
  totalEmpresas: number;
  verificadas: number;
  pendentes: number;
  cadastrosHoje: number;
  empresasHoje: number;
  porMes: { mes: string; total: number }[];
  porCategoria: { categoria: string; total: number }[];
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const AdminDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState<EmpresaStats | null>(null);
  const [empresas, setEmpresas] = useState<AdminEmpresa[]>([]);
  const [usuarios, setUsuarios] = useState<AdminUsuario[]>([]);
  const [monitoramento, setMonitoramento] = useState<MonitoramentoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<AdminEmpresa | null>(null);
  const [dialogAction, setDialogAction] = useState<'aprovar' | 'rejeitar' | 'visualizar' | 'enviar_mensagem' | null>(null);
  const [observacao, setObservacao] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuEmpresa, setMenuEmpresa] = useState<AdminEmpresa | null>(null);

  // Delete user confirm
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  // Editar empresa
  const [editEmpresaOpen, setEditEmpresaOpen] = useState(false);
  const [editEmpresaData, setEditEmpresaData] = useState<Partial<AdminEmpresa> & { id?: number }>({});

  // Excluir empresa
  const [deleteEmpresaId, setDeleteEmpresaId] = useState<number | null>(null);

  // Editar usuário
  const [editUsuarioOpen, setEditUsuarioOpen] = useState(false);
  const [editUsuarioData, setEditUsuarioData] = useState<Partial<AdminUsuario> & { id?: number }>({});

  // Criar empresa
  const [novaEmpresaOpen, setNovaEmpresaOpen] = useState(false);
  const [novaEmpresaData, setNovaEmpresaData] = useState({
    razao_social: '', nome_fantasia: '', cnpj: '', cpf: '',
    email_empresa: '', telefone: '', endereco: '', bairro: '',
    cep: '', cidade: '', estado: '', ramo_atuacao: 'prestacao_servico',
    categoria_id: '' as string | number, descricao_servico: '',
    website: '', instagram: '', status: 'verificado',
  });
  const [novaEmpresaLoading, setNovaEmpresaLoading] = useState(false);

  // Criar usuário
  const [novoUsuarioOpen, setNovoUsuarioOpen] = useState(false);
  const [novoUsuarioData, setNovoUsuarioData] = useState({
    nome: '', email: '', senha: '', cpf: '', telefone: '', tipo: 'usuario',
  });
  const [novoUsuarioLoading, setNovoUsuarioLoading] = useState(false);

  // Planos
  interface EmpresaPlano {
    id: number;
    nome_fantasia: string | null;
    razao_social: string;
    cnpj: string;
    status: string;
    plano: 'gratuito' | 'basico' | 'premium';
    plano_validade: string | null;
    plano_atualizado_em: string | null;
    responsavel: string | null;
    email_responsavel: string | null;
  }
  const [planos, setPlanos] = useState<EmpresaPlano[]>([]);
  const [planosLoading, setPlanosLoading] = useState(false);
  const [editPlanoOpen, setEditPlanoOpen] = useState(false);
  const [editPlanoData, setEditPlanoData] = useState<{ id: number; plano: 'gratuito' | 'basico' | 'premium'; plano_validade: string; nome: string }>({ id: 0, plano: 'gratuito', plano_validade: '', nome: '' });
  const [planosFilter, setPlanosFilter] = useState<'todos' | 'gratuito' | 'basico' | 'premium'>('todos');

  // Alunos
  interface Aluno { id: number; nome: string; cpf: string; email: string | null; telefone: string | null; curso: string | null; turma: string | null; status_aluno: string; importado_em: string; }
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunosTotal, setAlunosTotal] = useState(0);
  const [alunosLoading, setAlunosLoading] = useState(false);
  const [alunosBusca, setAlunosBusca] = useState('');
  const [importProgress, setImportProgress] = useState<number | null>(null);
  const [importResult, setImportResult] = useState<{ importados: number; duplicatas: number; erros: number; total: number } | null>(null);
  const [limparAlunosConfirm, setLimparAlunosConfirm] = useState(false);

  const alunoFormVazio = { nome: '', cpf: '', email: '', telefone: '', curso: '', turma: '', status_aluno: 'ativo' };
  const [alunoDialogOpen, setAlunoDialogOpen] = useState(false);
  const [alunoDialogModo, setAlunoDialogModo] = useState<'criar' | 'editar'>('criar');
  const [alunoForm, setAlunoForm] = useState(alunoFormVazio);
  const [alunoEditId, setAlunoEditId] = useState<number | null>(null);
  const [alunoFormLoading, setAlunoFormLoading] = useState(false);
  const [excluirAlunoConfirm, setExcluirAlunoConfirm] = useState<Aluno | null>(null);

  const formatFieldValue = (field: string, value: any) => {
    if (typeof value !== 'string') return value;

    switch (field) {
      case 'nome':
      case 'razao_social':
      case 'nome_fantasia':
        return normalizeName(value);
      case 'email':
      case 'email_empresa':
        return normalizeEmail(value);
      case 'cpf':
        return maskCPF(value);
      case 'cnpj':
        return maskCNPJ(value);
      case 'telefone':
      case 'celular':
        return maskPhoneBR(value);
      case 'cep':
        return maskCEP(value);
      case 'endereco':
      case 'bairro':
      case 'cidade':
      case 'curso':
      case 'turma':
        return normalizeText(value);
      case 'estado':
        return value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 2);
      default:
        return value;
    }
  };

  const setAlunoFormField = (field: string, value: any) => {
    setAlunoForm((prev) => ({ ...prev, [field]: formatFieldValue(field, value) }));
  };

  const setEditEmpresaField = (field: string, value: any) => {
    setEditEmpresaData((prev) => ({ ...prev, [field]: formatFieldValue(field, value) }));
  };

  const setEditUsuarioField = (field: string, value: any) => {
    setEditUsuarioData((prev) => ({ ...prev, [field]: formatFieldValue(field, value) }));
  };

  const setNovaEmpresaField = (field: string, value: any) => {
    setNovaEmpresaData((prev) => ({ ...prev, [field]: formatFieldValue(field, value) }));
  };

  const setNovoUsuarioField = (field: string, value: any) => {
    setNovoUsuarioData((prev) => ({ ...prev, [field]: formatFieldValue(field, value) }));
  };

  useEffect(() => {
    carregarDashboard();
  }, []);

  const carregarDashboard = async () => {
    setLoading(true);
    try {
      const [statsResponse, empresasResponse, usuariosResponse, monResponse] = await Promise.all([
        adminService.obterEstatisticas(),
        adminService.listarTodasEmpresas({ limite: 100 }),
        adminService.listarUsuarios(),
        adminService.obterMonitoramento(),
      ]);

      setStats(statsResponse);
      if (empresasResponse.success) setEmpresas(empresasResponse.data);
      if (usuariosResponse.success) setUsuarios(usuariosResponse.data);
      if (monResponse.success) setMonitoramento(monResponse.data);
    } catch (error: any) {
      setError('Erro ao carregar dados do painel');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 5 && planos.length === 0) {
      carregarPlanos();
    }
    if (newValue === 6 && alunos.length === 0) {
      carregarAlunos();
    }
  };

  const carregarPlanos = async () => {
    setPlanosLoading(true);
    try {
      const res = await adminService.listarPlanos();
      if (res.success) setPlanos(res.data);
    } catch (e) {
      setError('Erro ao carregar planos');
    } finally {
      setPlanosLoading(false);
    }
  };

  const handleOpenEditPlano = (empresa: any) => {
    setEditPlanoData({
      id: empresa.id,
      plano: empresa.plano || 'gratuito',
      plano_validade: empresa.plano_validade ? empresa.plano_validade.slice(0, 10) : '',
      nome: empresa.nome_fantasia || empresa.razao_social,
    });
    setEditPlanoOpen(true);
  };

  const handleSavePlano = async () => {
    try {
      await adminService.atualizarPlano(editPlanoData.id, editPlanoData.plano, editPlanoData.plano_validade || undefined);
      setPlanos(prev => prev.map(p => p.id === editPlanoData.id ? { ...p, plano: editPlanoData.plano, plano_validade: editPlanoData.plano_validade || null } : p));
      setEditPlanoOpen(false);
      setSuccessMsg('Plano atualizado com sucesso!');
    } catch (e) {
      setError('Erro ao salvar plano');
    }
  };

  const carregarAlunos = async (busca?: string) => {
    setAlunosLoading(true);
    try {
      const res = await adminService.listarAlunos(busca);
      if (res.success) { setAlunos(res.alunos); setAlunosTotal(res.total); }
    } catch (e) { setError('Erro ao carregar alunos'); }
    finally { setAlunosLoading(false); }
  };

  const handleImportarCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportResult(null);
    setImportProgress(0);
    try {
      const res = await adminService.importarAlunos(file, setImportProgress);
      setImportResult(res);
      carregarAlunos(alunosBusca);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao importar CSV');
    } finally {
      setImportProgress(null);
      e.target.value = '';
    }
  };

  const handleLimparAlunos = async () => {
    try {
      await adminService.limparAlunos();
      setAlunos([]);
      setAlunosTotal(0);
      setLimparAlunosConfirm(false);
      setSuccessMsg('Base de alunos limpa com sucesso!');
    } catch (e) { setError('Erro ao limpar base de alunos'); }
  };

  const handleAbrirNovoAluno = () => {
    setAlunoForm(alunoFormVazio);
    setAlunoEditId(null);
    setAlunoDialogModo('criar');
    setAlunoDialogOpen(true);
  };

  const handleAbrirEditarAluno = (aluno: Aluno) => {
    setAlunoForm({
      nome: aluno.nome,
      cpf: aluno.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
      email: aluno.email || '',
      telefone: aluno.telefone || '',
      curso: aluno.curso || '',
      turma: aluno.turma || '',
      status_aluno: aluno.status_aluno,
    });
    setAlunoEditId(aluno.id);
    setAlunoDialogModo('editar');
    setAlunoDialogOpen(true);
  };

  const handleSalvarAluno = async () => {
    if (!alunoForm.nome || !alunoForm.cpf) {
      setError('Nome e CPF são obrigatórios');
      return;
    }
    setAlunoFormLoading(true);
    try {
      if (alunoDialogModo === 'criar') {
        await adminService.criarAluno(alunoForm);
        setSuccessMsg('Aluno adicionado com sucesso!');
      } else if (alunoEditId) {
        await adminService.atualizarAluno(alunoEditId, alunoForm);
        setSuccessMsg('Aluno atualizado com sucesso!');
      }
      setAlunoDialogOpen(false);
      carregarAlunos(alunosBusca);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao salvar aluno');
    } finally {
      setAlunoFormLoading(false);
    }
  };

  const handleExcluirAluno = async () => {
    if (!excluirAlunoConfirm) return;
    try {
      await adminService.removerAluno(excluirAlunoConfirm.id);
      setExcluirAlunoConfirm(null);
      setSuccessMsg('Aluno removido com sucesso!');
      carregarAlunos(alunosBusca);
    } catch (e) { setError('Erro ao remover aluno'); }
  };

  const handleCriarEmpresa = async () => {
    setNovaEmpresaLoading(true);
    try {
      await adminService.criarEmpresa({
        ...novaEmpresaData,
        categoria_id: novaEmpresaData.categoria_id ? Number(novaEmpresaData.categoria_id) : undefined,
      });
      setNovaEmpresaOpen(false);
      setNovaEmpresaData({
        razao_social: '', nome_fantasia: '', cnpj: '', cpf: '',
        email_empresa: '', telefone: '', endereco: '', bairro: '',
        cep: '', cidade: '', estado: '', ramo_atuacao: 'prestacao_servico',
        categoria_id: '', descricao_servico: '', website: '', instagram: '', status: 'verificado',
      });
      setSuccessMsg('Empresa criada com sucesso!');
      // Reload empresas list
      const res = await adminService.listarTodasEmpresas();
      if (res.success) setEmpresas(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao criar empresa');
    } finally {
      setNovaEmpresaLoading(false);
    }
  };

  const handleCriarUsuario = async () => {
    setNovoUsuarioLoading(true);
    try {
      await adminService.criarUsuario(novoUsuarioData);
      setNovoUsuarioOpen(false);
      setNovoUsuarioData({ nome: '', email: '', senha: '', cpf: '', telefone: '', tipo: 'usuario' });
      setSuccessMsg('Usuário criado com sucesso!');
      // Reload usuarios list
      const res = await adminService.listarUsuarios();
      if (res.success) setUsuarios(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao criar usuário');
    } finally {
      setNovoUsuarioLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, empresa: AdminEmpresa) => {
    setMenuAnchor(event.currentTarget);
    setMenuEmpresa(empresa);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuEmpresa(null);
  };

  const handleActionDialog = (action: 'aprovar' | 'rejeitar' | 'visualizar' | 'enviar_mensagem', empresa: AdminEmpresa) => {
    setSelectedEmpresa(empresa);
    setDialogAction(action);
    setObservacao('');
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedEmpresa(null);
    setDialogAction(null);
    setObservacao('');
    setMensagem('');
  };

  const handleConfirmAction = async () => {
    if (!selectedEmpresa || !dialogAction) return;
    try {
      if (dialogAction === 'aprovar') {
        await adminService.aprovarEmpresa(selectedEmpresa.id!, observacao);
        setSuccessMsg('Empresa aprovada com sucesso!');
      } else if (dialogAction === 'rejeitar') {
        await adminService.rejeitarEmpresa(selectedEmpresa.id!, observacao);
        setSuccessMsg('Empresa rejeitada.');
      } else if (dialogAction === 'enviar_mensagem') {
        await adminService.enviarMensagem(selectedEmpresa.id!, {
          assunto: 'Mensagem da equipe IDEBRASIL',
          mensagem,
          destinatario_email: selectedEmpresa.email,
          empresa_id: selectedEmpresa.id!,
        });
        setSuccessMsg('Mensagem enviada!');
      }
      await carregarDashboard();
      handleDialogClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao executar ação');
    }
  };

  const handleToggleUsuario = async (id: number, atualAtivo: number) => {
    try {
      await adminService.alterarStatusUsuario(id, atualAtivo === 0);
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ativo: atualAtivo === 0 ? 1 : 0 } : u));
      setSuccessMsg(`Usuário ${atualAtivo === 0 ? 'ativado' : 'desativado'}`);
    } catch {
      setError('Erro ao alterar status do usuário');
    }
  };

  const handleDeleteUsuario = async () => {
    if (!deleteUserId) return;
    try {
      await adminService.deletarUsuario(deleteUserId);
      setUsuarios(prev => prev.filter(u => u.id !== deleteUserId));
      setDeleteUserId(null);
      setSuccessMsg('Usuário removido com sucesso');
    } catch {
      setError('Erro ao remover usuário');
    }
  };

  // ── Editar Empresa ──────────────────────────────────────────────────────────
  const handleOpenEditEmpresa = (empresa: AdminEmpresa) => {
    setEditEmpresaData({ ...empresa });
    setEditEmpresaOpen(true);
    handleMenuClose();
  };

  const handleSaveEmpresa = async () => {
    if (!editEmpresaData.id) return;
    try {
      await adminService.editarEmpresa(editEmpresaData.id, editEmpresaData);
      setEmpresas(prev => prev.map(e => e.id === editEmpresaData.id ? { ...e, ...editEmpresaData } as AdminEmpresa : e));
      setEditEmpresaOpen(false);
      setSuccessMsg('Empresa atualizada com sucesso!');
    } catch {
      setError('Erro ao atualizar empresa');
    }
  };

  // ── Excluir Empresa ─────────────────────────────────────────────────────────
  const handleDeleteEmpresa = async () => {
    if (!deleteEmpresaId) return;
    try {
      await adminService.excluirEmpresa(deleteEmpresaId);
      setEmpresas(prev => prev.filter(e => e.id !== deleteEmpresaId));
      setDeleteEmpresaId(null);
      setSuccessMsg('Empresa removida com sucesso');
    } catch {
      setError('Erro ao remover empresa');
    }
  };

  // ── Editar Usuário ──────────────────────────────────────────────────────────
  const handleOpenEditUsuario = (usuario: AdminUsuario) => {
    setEditUsuarioData({ ...usuario });
    setEditUsuarioOpen(true);
  };

  const handleSaveUsuario = async () => {
    if (!editUsuarioData.id) return;
    try {
      await adminService.editarUsuario(editUsuarioData.id, {
        nome: editUsuarioData.nome,
        email: editUsuarioData.email,
        cpf: editUsuarioData.cpf ?? undefined,
        telefone: editUsuarioData.telefone ?? undefined,
        tipo: editUsuarioData.tipo,
        ativo: !!editUsuarioData.ativo,
      });
      setUsuarios(prev => prev.map(u => u.id === editUsuarioData.id ? { ...u, ...editUsuarioData } as AdminUsuario : u));
      setEditUsuarioOpen(false);
      setSuccessMsg('Usuário atualizado com sucesso!');
    } catch {
      setError('Erro ao atualizar usuário');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verificado': return 'success';
      case 'rejeitado': return 'error';
      case 'pendente': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verificado': return <CheckCircle />;
      case 'rejeitado': return <Cancel />;
      case 'pendente': return <Pending />;
      default: return <Business />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'admin': return 'error';
      case 'empresa': return 'primary';
      default: return 'default';
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ color: '#C23535' }} />
        <Typography sx={{ mt: 2 }}>Carregando painel...</Typography>
      </Container>
    );
  }

  const pendentesCount = empresas.filter(e => e.status === 'pendente').length;

  return (
    <Box sx={{ backgroundColor: '#f4f4f5', minHeight: '100vh' }}>
      {/* Hero Header */}
      <Box sx={{ background: 'linear-gradient(135deg, #C23535 0%, #A52A2A 100%)', py: { xs: 4, md: 5 }, color: '#fff' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} color="#fff" sx={{ fontFamily: 'ASAP, sans-serif' }}>
                Painel Administrativo
              </Typography>
              <Typography sx={{ opacity: 0.85, mt: 0.5, fontSize: '0.95rem' }}>
                IDEBRASIL — Gestão e Monitoramento da Plataforma
              </Typography>
            </Box>
            <Button variant="outlined" size="small" onClick={carregarDashboard}
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' }, borderRadius: 2, fontWeight: 600 }}>
              Atualizar
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>
      )}
      {successMsg && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccessMsg(null)}>{successMsg}</Alert>
      )}

      {/* Cards de resumo */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: 'Total Empresas', value: stats?.total_empresas ?? 0, icon: <Business />, color: '#C23535' },
          { label: 'Verificadas', value: stats?.empresas_verificadas ?? 0, icon: <CheckCircle />, color: '#2e7d32' },
          { label: 'Pendentes', value: pendentesCount, icon: <Pending />, color: '#ed6c02' },
          { label: 'Usuários Cadastrados', value: usuarios.length, icon: <People />, color: '#1565c0' },
        ].map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card sx={{ borderRadius: 3, borderLeft: `4px solid ${card.color}`, boxShadow: '0 2px 16px rgba(44,44,44,0.08)', border: '1px solid rgba(194,53,53,0.07)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                  <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                </Box>
                <Typography variant="h3" fontWeight={700} sx={{ color: card.color }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Abas */}
      <Paper sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(44,44,44,0.08)', overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2,
            '& .MuiTab-root.Mui-selected': { color: '#C23535', fontWeight: 700 },
            '& .MuiTabs-indicator': { bgcolor: '#C23535' },
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<Pending />} iconPosition="start" label={`Pendentes ${pendentesCount > 0 ? `(${pendentesCount})` : ''}`} />
          <Tab icon={<Business />} iconPosition="start" label="Todas as Empresas" />
          <Tab icon={<People />} iconPosition="start" label="Usuários" />
          <Tab icon={<MonitorHeart />} iconPosition="start" label="Monitoramento" />
          <Tab icon={<BarChart />} iconPosition="start" label="Relatórios" />
          <Tab icon={<CreditCard />} iconPosition="start" label="Planos / Anúncios" />
          <Tab icon={<School />} iconPosition="start" label="Base de Alunos" />
        </Tabs>

        {/* === ABA: PENDENTES === */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#C23535' }}>Empresas aguardando aprovação</Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#C23535' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Empresa</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Responsável</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Categoria</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Cadastro</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="center" sx={{ color: '#fff', fontWeight: 700 }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {empresas.filter(e => e.status === 'pendente').map((empresa) => (
                  <TableRow key={empresa.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={empresa.logo_url || undefined} sx={{ width: 30, height: 30, bgcolor: '#C23535' }}>
                          <Business fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {empresa.nome_fantasia || empresa.razao_social}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{empresa.cnpj}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{empresa.nome}</Typography>
                      <Typography variant="caption" color="text.secondary">{empresa.email}</Typography>
                    </TableCell>
                    <TableCell>{empresa.categoria_nome}</TableCell>
                    <TableCell>{formatDate(empresa.criado_em)}</TableCell>
                    <TableCell>
                      <Chip icon={getStatusIcon(empresa.status)} label={empresa.status}
                        color={getStatusColor(empresa.status) as any} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, empresa)}>
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {empresas.filter(e => e.status === 'pendente').length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="h6">Nenhuma empresa pendente</Typography>
              <Typography variant="body2" color="text.secondary">Todas as empresas foram analisadas</Typography>
            </Box>
          )}
        </TabPanel>

        {/* === ABA: TODAS AS EMPRESAS === */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#C23535' }}>Todas as empresas cadastradas ({empresas.length})</Typography>
            <Button variant="contained" startIcon={<Business />} onClick={() => setNovaEmpresaOpen(true)} size="small"
              sx={{ bgcolor: '#C23535', '&:hover': { bgcolor: '#A52A2A' }, borderRadius: 2, fontWeight: 700 }}>
              Nova Empresa
            </Button>
          </Box>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#C23535' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Empresa</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Responsável</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Categoria</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Cadastro</TableCell>
                  <TableCell align="center" sx={{ color: '#fff', fontWeight: 700 }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {empresas.map((empresa) => (
                  <TableRow key={empresa.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={empresa.logo_url || undefined} sx={{ width: 30, height: 30, bgcolor: '#C23535' }}>
                          <Business fontSize="small" />
                        </Avatar>
                        <Typography variant="body2" fontWeight="bold">
                          {empresa.nome_fantasia || empresa.razao_social}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{empresa.nome}</TableCell>
                    <TableCell>{empresa.categoria_nome}</TableCell>
                    <TableCell>
                      <Chip icon={getStatusIcon(empresa.status)} label={empresa.status}
                        color={getStatusColor(empresa.status) as any} size="small" />
                    </TableCell>
                    <TableCell>{formatDate(empresa.criado_em)}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, empresa)}>
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* === ABA: USUÁRIOS === */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#C23535' }}>Usuários cadastrados ({usuarios.length})</Typography>
            <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setNovoUsuarioOpen(true)} size="small"
              sx={{ bgcolor: '#C23535', '&:hover': { bgcolor: '#A52A2A' }, borderRadius: 2, fontWeight: 700 }}>
              Novo Usuário
            </Button>
          </Box>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                  <TableRow sx={{ bgcolor: '#C23535' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Nome</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>E-mail</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>CPF</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Tipo</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Cadastro</TableCell>
                  <TableCell align="center" sx={{ color: '#fff', fontWeight: 700 }}>Editar</TableCell>
                  <TableCell align="center" sx={{ color: '#fff', fontWeight: 700 }}>Ativo</TableCell>
                  <TableCell align="center" sx={{ color: '#fff', fontWeight: 700 }}>Remover</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id} hover sx={{ opacity: usuario.ativo ? 1 : 0.5 }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: 12,
                          bgcolor: usuario.tipo === 'admin' ? '#C23535' : usuario.tipo === 'empresa' ? '#1565c0' : '#555' }}
                          src={usuario.tipo === 'empresa' ? usuario.logo_url || undefined : undefined}
                        >
                          {usuario.tipo === 'empresa' ? <Business fontSize="small" /> : usuario.nome?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2">{usuario.nome}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{usuario.email}</Typography></TableCell>
                    <TableCell><Typography variant="caption">{usuario.cpf || '-'}</Typography></TableCell>
                    <TableCell>
                      <Chip label={usuario.tipo} color={getTipoColor(usuario.tipo) as any} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell><Typography variant="caption">{formatDate(usuario.data_criacao)}</Typography></TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar usuário">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEditUsuario(usuario)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={usuario.ativo ? 'Clique para desativar' : 'Clique para ativar'}>
                        <Switch
                          checked={!!usuario.ativo}
                          onChange={() => handleToggleUsuario(usuario.id, usuario.ativo)}
                          disabled={usuario.tipo === 'admin'}
                          size="small"
                          color="success"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Remover usuário">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteUserId(usuario.id)}
                            disabled={usuario.tipo === 'admin'}
                          >
                            <DeleteForever fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* === ABA: MONITORAMENTO === */}
        <TabPanel value={tabValue} index={3}>
          {monitoramento ? (
            <Grid container spacing={3}>
              {/* Cards de hoje */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#C23535' }}>Atividade hoje</Typography>
                <Grid container spacing={2}>
                  {[
                    { label: 'Cadastros hoje', value: monitoramento.cadastrosHoje, icon: <PersonAdd />, color: '#1565c0' },
                    { label: 'Empresas hoje', value: monitoramento.empresasHoje, icon: <Store />, color: '#C23535' },
                    { label: 'Total usuários', value: monitoramento.totalUsuarios, icon: <People />, color: '#555' },
                    { label: 'Em análise', value: monitoramento.pendentes, icon: <AccessTime />, color: '#ed6c02' },
                  ].map((item) => (
                    <Grid item xs={6} sm={3} key={item.label}>
                      <Card sx={{ borderRadius: 3, borderLeft: `4px solid ${item.color}`, boxShadow: '0 2px 12px rgba(44,44,44,0.07)' }}>
                        <CardContent sx={{ py: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Box sx={{ color: item.color }}>{item.icon}</Box>
                            <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                          </Box>
                          <Typography variant="h4" fontWeight={700} sx={{ color: item.color }}>
                            {item.value}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* Empresas por categoria */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#C23535' }}>Empresas por categoria</Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  {monitoramento.porCategoria.map((item, i) => {
                    const max = Math.max(...monitoramento.porCategoria.map(c => c.total), 1);
                    return (
                      <Box key={i} sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">{item.categoria}</Typography>
                          <Typography variant="body2" fontWeight={700}>{item.total}</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(item.total / max) * 100}
                          sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: '#C23535' } }}
                        />
                      </Box>
                    );
                  })}
                  {monitoramento.porCategoria.length === 0 && (
                    <Typography color="text.secondary" variant="body2">Sem dados</Typography>
                  )}
                </Paper>
              </Grid>

              {/* Cadastros por mês */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#C23535' }}>Cadastros — últimos 6 meses</Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  {monitoramento.porMes.map((item, i) => {
                    const max = Math.max(...monitoramento.porMes.map(m => m.total), 1);
                    const [ano, mes] = item.mes.split('-');
                    const nomeMes = new Date(Number(ano), Number(mes) - 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
                    return (
                      <Box key={i} sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">{nomeMes}</Typography>
                          <Typography variant="body2" fontWeight={700}>{item.total}</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(item.total / max) * 100}
                          sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: '#A52A2A' } }}
                        />
                      </Box>
                    );
                  })}
                  {monitoramento.porMes.length === 0 && (
                    <Typography color="text.secondary" variant="body2">Sem dados no período</Typography>
                  )}
                </Paper>
              </Grid>

              {/* Taxa de aprovação */}
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Taxa de aprovação</Typography>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {monitoramento.totalEmpresas > 0
                        ? Math.round((monitoramento.verificadas / monitoramento.totalEmpresas) * 100)
                        : 0}%
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Aprovadas</Typography>
                    <Typography variant="h4" fontWeight={700} color="success.main">{monitoramento.verificadas}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Pendentes</Typography>
                    <Typography variant="h4" fontWeight={700} color="warning.main">{monitoramento.pendentes}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total cadastradas</Typography>
                    <Typography variant="h4" fontWeight={700}>{monitoramento.totalEmpresas}</Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Typography color="text.secondary">Sem dados de monitoramento</Typography>
          )}
        </TabPanel>

        {/* === ABA: RELATÓRIOS === */}
        <TabPanel value={tabValue} index={4}>
          <Relatorios />
        </TabPanel>

        {/* === ABA: PLANOS / ANÚNCIOS === */}
        <TabPanel value={tabValue} index={5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#C23535' }}>Gerenciar Planos das Empresas</Typography>
            <Button size="small" variant="outlined" onClick={carregarPlanos} disabled={planosLoading}
              sx={{ borderColor: '#C23535', color: '#C23535', '&:hover': { borderColor: '#A52A2A', bgcolor: 'rgba(194,53,53,0.04)' }, borderRadius: 2, fontWeight: 600 }}>
              Atualizar
            </Button>
          </Box>

          {/* Cards resumo por plano */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Gratuito', key: 'gratuito', color: '#757575', icon: <StarBorder /> },
              { label: 'Básico', key: 'basico', color: '#1565c0', icon: <Star /> },
              { label: 'Premium', key: 'premium', color: '#C23535', icon: <WorkspacePremium /> },
            ].map(({ label, key, color, icon }) => (
              <Grid item xs={12} sm={4} key={key}>
                <Card sx={{ borderRadius: 3, borderLeft: `4px solid ${color}`, boxShadow: '0 2px 12px rgba(44,44,44,0.07)', cursor: 'pointer', bgcolor: planosFilter === key ? `${color}10` : 'background.paper' }}
                  onClick={() => setPlanosFilter(planosFilter === key ? 'todos' : key as any)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ color }}>{icon}</Box>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                    </Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color, mt: 1 }}>
                      {planos.filter(p => p.plano === key).length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">empresas</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Filtro chips */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {(['todos', 'gratuito', 'basico', 'premium'] as const).map(f => (
              <Chip key={f} label={f === 'todos' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
                onClick={() => setPlanosFilter(f)}
                color={planosFilter === f ? 'primary' : 'default'}
                variant={planosFilter === f ? 'filled' : 'outlined'}
                size="small" />
            ))}
          </Box>

          {planosLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#C23535' }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Empresa</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Responsável</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 700 }}>Plano Atual</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Válido até</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Atualizado em</TableCell>
                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 700 }}>Ação</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {planos
                    .filter(p => planosFilter === 'todos' || p.plano === planosFilter)
                    .map((emp) => (
                      <TableRow key={emp.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {emp.nome_fantasia || emp.razao_social}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">{emp.cnpj}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{emp.responsavel || '—'}</Typography>
                          <Typography variant="caption" color="text.secondary">{emp.email_responsavel || ''}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip size="small"
                            label={emp.status}
                            color={emp.status === 'verificado' ? 'success' : emp.status === 'rejeitado' ? 'error' : 'warning'} />
                        </TableCell>
                        <TableCell align="center">
                          <Chip size="small"
                            icon={emp.plano === 'premium' ? <WorkspacePremium fontSize="small" /> : emp.plano === 'basico' ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
                            label={emp.plano.charAt(0).toUpperCase() + emp.plano.slice(1)}
                            sx={{
                              bgcolor: emp.plano === 'premium' ? '#C23535' : emp.plano === 'basico' ? '#1565c0' : '#757575',
                              color: 'white',
                              '& .MuiChip-icon': { color: 'white' },
                            }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {emp.plano_validade ? new Date(emp.plano_validade).toLocaleDateString('pt-BR') : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {emp.plano_atualizado_em ? new Date(emp.plano_atualizado_em).toLocaleDateString('pt-BR') : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Alterar plano">
                            <IconButton size="small" onClick={() => handleOpenEditPlano(emp)} color="primary">
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  {planos.filter(p => planosFilter === 'todos' || p.plano === planosFilter).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        Nenhuma empresa encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* ===================== ABA 6 — BASE DE ALUNOS ===================== */}
        <TabPanel value={tabValue} index={6}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#C23535' }}>Base de Alunos IDEBRASIL</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button size="small" variant="outlined" startIcon={<School />} onClick={() => carregarAlunos(alunosBusca)} disabled={alunosLoading}
                sx={{ borderColor: '#C23535', color: '#C23535', borderRadius: 2, fontWeight: 600 }}>
                Atualizar
              </Button>
              <Button size="small" variant="outlined" color="error" startIcon={<DeleteSweep />} onClick={() => setLimparAlunosConfirm(true)}
                sx={{ borderRadius: 2, fontWeight: 600 }}>
                Limpar Base
              </Button>
              <Button size="small" variant="outlined" color="primary" startIcon={<UploadFile />} disabled={importProgress !== null} component="label"
                sx={{ borderRadius: 2, fontWeight: 600 }}>
                Importar CSV
                <input type="file" accept=".csv,text/csv" hidden onChange={handleImportarCSV} />
              </Button>
              <Button size="small" variant="contained" startIcon={<PersonAdd />} onClick={handleAbrirNovoAluno}
                sx={{ bgcolor: '#C23535', '&:hover': { bgcolor: '#A52A2A' }, borderRadius: 2, fontWeight: 700 }}>
                Novo Aluno
              </Button>
            </Box>
          </Box>

          {/* Instruções */}
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Formato do CSV:</strong> O arquivo deve conter as colunas <code>nome</code>, <code>cpf</code> (obrigatórios) e opcionalmente <code>email</code>, <code>telefone</code>, <code>curso</code>, <code>turma</code>.
            CPFs duplicados serão atualizados automaticamente.
          </Alert>

          {/* Progresso de importação */}
          {importProgress !== null && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>Enviando arquivo... {importProgress}%</Typography>
              <LinearProgress variant="determinate" value={importProgress} sx={{ '& .MuiLinearProgress-bar': { bgcolor: '#C23535' } }} />
            </Box>
          )}

          {/* Resultado da importação */}
          {importResult && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setImportResult(null)}>
              ✅ Importação concluída — <strong>{importResult.importados}</strong> registros importados
              {importResult.duplicatas > 0 && `, ${importResult.duplicatas} atualizados`}
              {importResult.erros > 0 && `, ${importResult.erros} erros`}
              {' '}(total no arquivo: {importResult.total})
            </Alert>
          )}

          {/* Stats */}
          <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip icon={<School />} label={`${alunosTotal} alunos na base`} color="primary" variant="outlined" />
          </Box>

          {/* Busca */}
          <TextField
            size="small"
            placeholder="Buscar por nome, CPF ou email..."
            value={alunosBusca}
            onChange={e => { setAlunosBusca(e.target.value); if (!e.target.value) carregarAlunos(); }}
            onKeyDown={e => e.key === 'Enter' && carregarAlunos(alunosBusca)}
            sx={{ mb: 2, width: 380, maxWidth: '100%' }}
            InputProps={{ startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }}
          />

          {alunosLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <TableContainer component={Paper} elevation={1}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white' }}>Nome</TableCell>
                    <TableCell sx={{ color: 'white' }}>CPF</TableCell>
                    <TableCell sx={{ color: 'white' }}>Email</TableCell>
                    <TableCell sx={{ color: 'white' }}>Curso</TableCell>
                    <TableCell sx={{ color: 'white' }}>Turma</TableCell>
                    <TableCell sx={{ color: 'white' }}>Status</TableCell>
                    <TableCell sx={{ color: 'white' }}>Importado em</TableCell>
                    <TableCell sx={{ color: 'white' }} align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alunos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        {alunosBusca ? 'Nenhum aluno encontrado para a busca.' : 'Nenhum aluno cadastrado ainda. Importe um CSV ou adicione manualmente.'}
                      </TableCell>
                    </TableRow>
                  ) : alunos.map(aluno => (
                    <TableRow key={aluno.id} hover>
                      <TableCell>{aluno.nome}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>
                        {aluno.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                      </TableCell>
                      <TableCell>{aluno.email || '—'}</TableCell>
                      <TableCell>{aluno.curso || '—'}</TableCell>
                      <TableCell>{aluno.turma || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={aluno.status_aluno}
                          size="small"
                          color={aluno.status_aluno === 'ativo' ? 'success' : aluno.status_aluno === 'formado' ? 'info' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{new Date(aluno.importado_em).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar">
                          <IconButton size="small" color="primary" onClick={() => handleAbrirEditarAluno(aluno)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton size="small" color="error" onClick={() => setExcluirAlunoConfirm(aluno)}>
                            <DeleteForever fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>

      {/* Dialog confirmar limpeza de alunos */}
      <Dialog open={limparAlunosConfirm} onClose={() => setLimparAlunosConfirm(false)} maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ color: '#C23535', fontWeight: 700 }}>Limpar Base de Alunos</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Isso vai remover <strong>todos os {alunosTotal} alunos</strong> da base. Esta ação não pode ser desfeita.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLimparAlunosConfirm(false)}>Cancelar</Button>
          <Button onClick={handleLimparAlunos} variant="contained" color="error">Limpar Tudo</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog criar / editar aluno */}
      <Dialog open={alunoDialogOpen} onClose={() => setAlunoDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ color: '#C23535', fontWeight: 700 }}>{alunoDialogModo === 'criar' ? 'Novo Aluno' : 'Editar Aluno'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={8}>
              <TextField fullWidth label="Nome completo *" value={alunoForm.nome}
                onChange={e => setAlunoFormField('nome', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="CPF *" value={alunoForm.cpf}
                onChange={e => setAlunoFormField('cpf', e.target.value)}
                placeholder="000.000.000-00" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" value={alunoForm.email}
                onChange={e => setAlunoFormField('email', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Telefone" value={alunoForm.telefone}
                onChange={e => setAlunoFormField('telefone', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Curso" value={alunoForm.curso}
                onChange={e => setAlunoFormField('curso', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="Turma" value={alunoForm.turma}
                onChange={e => setAlunoFormField('turma', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={alunoForm.status_aluno}
                  onChange={e => setAlunoForm(f => ({ ...f, status_aluno: e.target.value }))}>
                  <MenuItem value="ativo">Ativo</MenuItem>
                  <MenuItem value="inativo">Inativo</MenuItem>
                  <MenuItem value="formado">Formado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlunoDialogOpen(false)} disabled={alunoFormLoading}>Cancelar</Button>
          <Button onClick={handleSalvarAluno} variant="contained"
            disabled={alunoFormLoading || !alunoForm.nome || !alunoForm.cpf}
            sx={{ bgcolor: '#C23535', '&:hover': { bgcolor: '#A52A2A' }, borderRadius: 2, fontWeight: 700 }}>
            {alunoFormLoading ? <CircularProgress size={20} /> : alunoDialogModo === 'criar' ? 'Adicionar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog confirmar exclusão de aluno */}
      <Dialog open={!!excluirAlunoConfirm} onClose={() => setExcluirAlunoConfirm(null)} maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ color: '#C23535', fontWeight: 700 }}>Excluir Aluno</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Tem certeza que deseja excluir o aluno <strong>{excluirAlunoConfirm?.nome}</strong> (CPF: {excluirAlunoConfirm?.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')})?
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExcluirAlunoConfirm(null)}>Cancelar</Button>
          <Button onClick={handleExcluirAluno} variant="contained" color="error">Excluir</Button>
        </DialogActions>
      </Dialog>
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => menuEmpresa && handleActionDialog('visualizar', menuEmpresa)}>
          <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
          <ListItemText>Visualizar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => menuEmpresa && handleOpenEditEmpresa(menuEmpresa)}>
          <ListItemIcon><Edit fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        {menuEmpresa?.status === 'pendente' && (
          <>
            <MenuItem onClick={() => menuEmpresa && handleActionDialog('aprovar', menuEmpresa)}>
              <ListItemIcon><CheckCircle fontSize="small" color="success" /></ListItemIcon>
              <ListItemText>Aprovar</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => menuEmpresa && handleActionDialog('rejeitar', menuEmpresa)}>
              <ListItemIcon><Cancel fontSize="small" color="error" /></ListItemIcon>
              <ListItemText>Rejeitar</ListItemText>
            </MenuItem>
          </>
        )}
        <MenuItem onClick={() => menuEmpresa && handleActionDialog('enviar_mensagem', menuEmpresa)}>
          <ListItemIcon><Email fontSize="small" /></ListItemIcon>
          <ListItemText>Enviar Mensagem</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { if (menuEmpresa?.id) { setDeleteEmpresaId(menuEmpresa.id); handleMenuClose(); } }} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteForever fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Excluir Empresa</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialog de ações de empresa */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ color: '#C23535', fontWeight: 700 }}>
          {dialogAction === 'aprovar' && 'Aprovar Empresa'}
          {dialogAction === 'rejeitar' && 'Rejeitar Empresa'}
          {dialogAction === 'visualizar' && 'Detalhes da Empresa'}
          {dialogAction === 'enviar_mensagem' && 'Enviar Mensagem'}
        </DialogTitle>
        <DialogContent>
          {selectedEmpresa && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedEmpresa.nome_fantasia || selectedEmpresa.razao_social}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography><strong>Responsável:</strong> {selectedEmpresa.nome}</Typography>
                  <Typography><strong>Email:</strong> {selectedEmpresa.email}</Typography>
                  <Typography><strong>Celular:</strong> {selectedEmpresa.celular}</Typography>
                  <Typography><strong>CPF:</strong> {selectedEmpresa.cpf}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography><strong>Razão Social:</strong> {selectedEmpresa.razao_social}</Typography>
                  <Typography><strong>CNPJ:</strong> {selectedEmpresa.cnpj}</Typography>
                  <Typography><strong>Categoria:</strong> {selectedEmpresa.categoria_nome}</Typography>
                  <Typography><strong>Status:</strong> {selectedEmpresa.status}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography><strong>Endereço:</strong> {selectedEmpresa.endereco}</Typography>
                  <Typography><strong>Descrição:</strong> {selectedEmpresa.descricao_servico}</Typography>
                </Grid>
              </Grid>
              {(dialogAction === 'aprovar' || dialogAction === 'rejeitar') && (
                <TextField
                  fullWidth multiline rows={3}
                  label={dialogAction === 'rejeitar' ? 'Motivo da rejeição *' : 'Observação (opcional)'}
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  sx={{ mt: 2 }}
                  required={dialogAction === 'rejeitar'}
                />
              )}
              {dialogAction === 'enviar_mensagem' && (
                <TextField
                  fullWidth multiline rows={4}
                  label="Mensagem *"
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Digite a mensagem para a empresa..."
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancelar</Button>
          {dialogAction !== 'visualizar' && (
            <Button
              onClick={handleConfirmAction}
              variant="contained"
              color={dialogAction === 'aprovar' ? 'success' : dialogAction === 'rejeitar' ? 'error' : 'primary'}
              disabled={
                (dialogAction === 'rejeitar' && !observacao) ||
                (dialogAction === 'enviar_mensagem' && !mensagem)
              }
            >
              {dialogAction === 'aprovar' && 'Aprovar'}
              {dialogAction === 'rejeitar' && 'Rejeitar'}
              {dialogAction === 'enviar_mensagem' && 'Enviar'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Confirmação deletar usuário */}
      <Dialog open={!!deleteUserId} onClose={() => setDeleteUserId(null)}
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ color: '#C23535', fontWeight: 700 }}>Remover usuário?</DialogTitle>
        <DialogContent>
          <Typography>Esta ação não pode ser desfeita. O usuário será removido permanentemente.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteUserId(null)}>Cancelar</Button>
          <Button onClick={handleDeleteUsuario} color="error" variant="contained">Remover</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmação excluir empresa */}
      <Dialog open={!!deleteEmpresaId} onClose={() => setDeleteEmpresaId(null)}
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ color: '#C23535', fontWeight: 700 }}>Excluir empresa?</DialogTitle>
        <DialogContent>
          <Typography>Esta ação removerá permanentemente a empresa e todos os seus dados. Deseja continuar?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteEmpresaId(null)}>Cancelar</Button>
          <Button onClick={handleDeleteEmpresa} color="error" variant="contained">Excluir</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Editar Empresa */}
      <Dialog open={editEmpresaOpen} onClose={() => setEditEmpresaOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#C23535', fontWeight: 700 }}>
          <Edit color="primary" /> Editar Empresa
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Dados principais</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth size="small" label="Razão Social"
                  value={editEmpresaData.razao_social || ''}
                  onChange={e => setEditEmpresaField('razao_social', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth size="small" label="Nome Fantasia"
                  value={editEmpresaData.nome_fantasia || ''}
                  onChange={e => setEditEmpresaField('nome_fantasia', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth size="small" label="CNPJ"
                  value={editEmpresaData.cnpj || ''}
                  onChange={e => setEditEmpresaField('cnpj', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select value={editEmpresaData.status || ''} label="Status"
                    onChange={e => setEditEmpresaData(p => ({ ...p, status: e.target.value as any }))}>
                    <MenuItem value="pendente">Pendente</MenuItem>
                    <MenuItem value="verificado">Verificado</MenuItem>
                    <MenuItem value="rejeitado">Rejeitado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Endereço</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth size="small" label="Endereço"
                  value={editEmpresaData.endereco || ''}
                  onChange={e => setEditEmpresaField('endereco', e.target.value)} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth size="small" label="Bairro"
                  value={editEmpresaData.bairro || ''}
                  onChange={e => setEditEmpresaField('bairro', e.target.value)} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth size="small" label="CEP"
                  value={editEmpresaData.cep || ''}
                  onChange={e => setEditEmpresaField('cep', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth size="small" label="Cidade"
                  value={editEmpresaData.cidade || ''}
                  onChange={e => setEditEmpresaField('cidade', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth size="small" label="Estado (sigla)"
                  value={editEmpresaData.estado || ''}
                  inputProps={{ maxLength: 2 }}
                  onChange={e => setEditEmpresaField('estado', e.target.value)} />
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Contato & digital</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth size="small" label="Telefone"
                  value={editEmpresaData.telefone || ''}
                  onChange={e => setEditEmpresaField('telefone', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth size="small" label="E-mail da Empresa"
                  value={editEmpresaData.email_empresa || ''}
                  onChange={e => setEditEmpresaField('email_empresa', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth size="small" label="Website"
                  value={editEmpresaData.website || ''}
                  onChange={e => setEditEmpresaData(p => ({ ...p, website: e.target.value }))} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth size="small" label="Instagram"
                  value={editEmpresaData.instagram || ''}
                  onChange={e => setEditEmpresaData(p => ({ ...p, instagram: e.target.value }))} />
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Categoria & descrição</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Ramo de Atuação</InputLabel>
                  <Select value={editEmpresaData.ramo_atuacao || ''} label="Ramo de Atuação"
                    onChange={e => setEditEmpresaData(p => ({ ...p, ramo_atuacao: e.target.value as any }))}>
                    <MenuItem value="comercio">Comércio</MenuItem>
                    <MenuItem value="industrial">Industrial</MenuItem>
                    <MenuItem value="prestacao_servico">Prestação de Serviço</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth size="small" multiline rows={3} label="Descrição da Empresa"
                  value={editEmpresaData.descricao_servico || ''}
                  onChange={e => setEditEmpresaData(p => ({ ...p, descricao_servico: e.target.value }))} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditEmpresaOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveEmpresa} variant="contained"
            sx={{ bgcolor: '#C23535', '&:hover': { bgcolor: '#A52A2A' }, borderRadius: 2, fontWeight: 700 }}>Salvar Alterações</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Editar Usuário */}
      <Dialog open={editUsuarioOpen} onClose={() => setEditUsuarioOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#C23535', fontWeight: 700 }}>
          <Edit color="primary" /> Editar Usuário
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Nome Completo"
                value={editUsuarioData.nome || ''}
                onChange={e => setEditUsuarioField('nome', e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="E-mail" type="email"
                value={editUsuarioData.email || ''}
                onChange={e => setEditUsuarioField('email', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth size="small" label="CPF"
                value={editUsuarioData.cpf || ''}
                onChange={e => setEditUsuarioField('cpf', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth size="small" label="Telefone"
                value={editUsuarioData.telefone || ''}
                onChange={e => setEditUsuarioField('telefone', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select value={editUsuarioData.tipo || ''} label="Tipo"
                  onChange={e => setEditUsuarioData(p => ({ ...p, tipo: e.target.value as any }))}>
                  <MenuItem value="empresa">Empresa</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={editUsuarioData.ativo !== undefined ? String(editUsuarioData.ativo) : ''} label="Status"
                  onChange={e => setEditUsuarioData(p => ({ ...p, ativo: e.target.value === '1' ? 1 : 0 }))}>
                  <MenuItem value="1">Ativo</MenuItem>
                  <MenuItem value="0">Inativo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUsuarioOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveUsuario} variant="contained"
            sx={{ bgcolor: '#C23535', '&:hover': { bgcolor: '#A52A2A' }, borderRadius: 2, fontWeight: 700 }}>Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Editar Plano */}
      <Dialog open={editPlanoOpen} onClose={() => setEditPlanoOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#C23535', fontWeight: 700 }}>
          <CreditCard color="primary" /> Alterar Plano
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {editPlanoData.nome}
          </Typography>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Plano</InputLabel>
                <Select value={editPlanoData.plano} label="Plano"
                  onChange={e => setEditPlanoData(p => ({ ...p, plano: e.target.value as any }))}>
                  <MenuItem value="gratuito">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StarBorder fontSize="small" sx={{ color: '#757575' }} /> Gratuito
                    </Box>
                  </MenuItem>
                  <MenuItem value="basico">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Star fontSize="small" sx={{ color: '#1565c0' }} /> Básico
                    </Box>
                  </MenuItem>
                  <MenuItem value="premium">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WorkspacePremium fontSize="small" sx={{ color: '#C23535' }} /> Premium
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Válido até (opcional)" type="date"
                value={editPlanoData.plano_validade}
                onChange={e => setEditPlanoData(p => ({ ...p, plano_validade: e.target.value }))}
                InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>

          {/* Descrição dos planos */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Benefícios por plano:
            </Typography>
            <Typography variant="caption" color="text.secondary" component="div">🆓 <strong>Gratuito:</strong> Perfil básico na plataforma</Typography>
            <Typography variant="caption" color="text.secondary" component="div">⭐ <strong>Básico:</strong> Destaque na busca + logo</Typography>
            <Typography variant="caption" color="text.secondary" component="div">👑 <strong>Premium:</strong> Topo dos resultados + banner + análises</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditPlanoOpen(false)}>Cancelar</Button>
          <Button onClick={handleSavePlano} variant="contained"
            sx={{ bgcolor: '#C23535', '&:hover': { bgcolor: '#A52A2A' }, borderRadius: 2, fontWeight: 700 }}>Salvar Plano</Button>
        </DialogActions>
      </Dialog>

      {/* ========== DIALOG NOVA EMPRESA ========== */}
      <Dialog open={novaEmpresaOpen} onClose={() => setNovaEmpresaOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#C23535', fontWeight: 700 }}>
          <AddBusiness color="primary" /> Cadastrar Nova Empresa
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Razão Social *" value={novaEmpresaData.razao_social}
                onChange={e => setNovaEmpresaField('razao_social', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Nome Fantasia" value={novaEmpresaData.nome_fantasia}
                onChange={e => setNovaEmpresaField('nome_fantasia', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="CNPJ *" value={novaEmpresaData.cnpj}
                onChange={e => setNovaEmpresaField('cnpj', e.target.value)} placeholder="00.000.000/0001-00" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="CPF do Responsável *" value={novaEmpresaData.cpf}
                onChange={e => setNovaEmpresaField('cpf', e.target.value)} placeholder="000.000.000-00" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="E-mail da Empresa" value={novaEmpresaData.email_empresa}
                onChange={e => setNovaEmpresaField('email_empresa', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Telefone" value={novaEmpresaData.telefone}
                onChange={e => setNovaEmpresaField('telefone', e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Endereço" value={novaEmpresaData.endereco}
                onChange={e => setNovaEmpresaField('endereco', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" label="Bairro" value={novaEmpresaData.bairro}
                onChange={e => setNovaEmpresaField('bairro', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" label="Cidade" value={novaEmpresaData.cidade}
                onChange={e => setNovaEmpresaField('cidade', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField fullWidth size="small" label="Estado (UF)" value={novaEmpresaData.estado}
                onChange={e => setNovaEmpresaField('estado', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField fullWidth size="small" label="CEP" value={novaEmpresaData.cep}
                onChange={e => setNovaEmpresaField('cep', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Ramo de Atuação</InputLabel>
                <Select value={novaEmpresaData.ramo_atuacao} label="Ramo de Atuação"
                  onChange={e => setNovaEmpresaData(p => ({ ...p, ramo_atuacao: e.target.value }))}>
                  <MenuItem value="comercio">Comércio</MenuItem>
                  <MenuItem value="industrial">Industrial</MenuItem>
                  <MenuItem value="prestacao_servico">Prestação de Serviço</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={novaEmpresaData.status} label="Status"
                  onChange={e => setNovaEmpresaData(p => ({ ...p, status: e.target.value }))}>
                  <MenuItem value="verificado">Verificado</MenuItem>
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="rejeitado">Rejeitado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Descrição dos Serviços" value={novaEmpresaData.descricao_servico}
                onChange={e => setNovaEmpresaData(p => ({ ...p, descricao_servico: e.target.value }))} multiline rows={3} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Website" value={novaEmpresaData.website}
                onChange={e => setNovaEmpresaData(p => ({ ...p, website: e.target.value }))} placeholder="https://" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Instagram" value={novaEmpresaData.instagram}
                onChange={e => setNovaEmpresaData(p => ({ ...p, instagram: e.target.value }))} placeholder="@usuario" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNovaEmpresaOpen(false)} disabled={novaEmpresaLoading}>Cancelar</Button>
          <Button
            onClick={handleCriarEmpresa}
            variant="contained"
            disabled={novaEmpresaLoading || !novaEmpresaData.razao_social || !novaEmpresaData.cnpj || !novaEmpresaData.cpf}
            startIcon={novaEmpresaLoading ? <CircularProgress size={16} /> : <AddBusiness />}
            sx={{ bgcolor: '#C23535', '&:hover': { bgcolor: '#A52A2A' }, borderRadius: 2, fontWeight: 700 }}>
            {novaEmpresaLoading ? 'Salvando...' : 'Cadastrar Empresa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========== DIALOG NOVO USUÁRIO ========== */}
      <Dialog open={novoUsuarioOpen} onClose={() => setNovoUsuarioOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#C23535', fontWeight: 700 }}>
          <PersonAdd color="primary" /> Criar Novo Usuário
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Nome completo *" value={novoUsuarioData.nome}
                onChange={e => setNovoUsuarioField('nome', e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="E-mail *" type="email" value={novoUsuarioData.email}
                onChange={e => setNovoUsuarioField('email', e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Senha *" type="password" value={novoUsuarioData.senha}
                onChange={e => setNovoUsuarioData(p => ({ ...p, senha: e.target.value }))}
                helperText="Mínimo 6 caracteres" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="CPF" value={novoUsuarioData.cpf}
                onChange={e => setNovoUsuarioField('cpf', e.target.value)} placeholder="000.000.000-00" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Telefone" value={novoUsuarioData.telefone}
                onChange={e => setNovoUsuarioField('telefone', e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo de Usuário</InputLabel>
                <Select value={novoUsuarioData.tipo} label="Tipo de Usuário"
                  onChange={e => setNovoUsuarioData(p => ({ ...p, tipo: e.target.value }))}>
                  <MenuItem value="usuario">Usuário Comum</MenuItem>
                  <MenuItem value="empresa">Empresa</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNovoUsuarioOpen(false)} disabled={novoUsuarioLoading}>Cancelar</Button>
          <Button
            onClick={handleCriarUsuario}
            variant="contained"
            disabled={novoUsuarioLoading || !novoUsuarioData.nome || !novoUsuarioData.email || novoUsuarioData.senha.length < 6}
            startIcon={novoUsuarioLoading ? <CircularProgress size={16} /> : <PersonAdd />}
            sx={{ bgcolor: '#C23535', '&:hover': { bgcolor: '#A52A2A' }, borderRadius: 2, fontWeight: 700 }}>
            {novoUsuarioLoading ? 'Criando...' : 'Criar Usuário'}
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
    </Box>
  );
};

export default AdminDashboard;
