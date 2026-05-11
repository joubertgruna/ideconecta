import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Avatar,
  Grid,
  InputAdornment,
  IconButton,
  Divider,
  Collapse,
  Paper,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Business,
  Edit,
  Save,
  Cancel,
  Lock,
  Visibility,
  VisibilityOff,
  VpnKey,
  AccountCircle,
  Badge,
  PhotoCamera,
  DeleteOutline,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { maskCNPJ, maskCPF, maskPhoneBR, normalizeEmail, normalizeName } from '../../utils/inputMasks';
import { empresaService } from '../../services/empresaService';
import CompanyProfilePanel from '../profile/CompanyProfilePanel';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

// ── Estilos compartilhados com AdminDashboard ────────────────────────────────
const cardSx = {
  borderRadius: 3,
  boxShadow: '0 2px 16px rgba(44,44,44,0.08)',
  border: '1px solid rgba(194,53,53,0.07)',
};

const accentCardSx = (color = '#C23535') => ({
  ...cardSx,
  borderLeft: `4px solid ${color}`,
});

const UserProfile: React.FC = () => {
  const { state, updateProfile, clearError } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoSuccess, setLogoSuccess] = useState('');
  const [logoError, setLogoError] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validationSchema = Yup.object({
    nome: Yup.string().min(2, 'Nome deve ter pelo menos 2 caracteres').required('Nome é obrigatório'),
    email: Yup.string().email('Email inválido').required('Email é obrigatório'),
    telefone: Yup.string().matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato: (11) 99999-9999'),
  });

  const formik = useFormik({
    initialValues: {
      nome: state.user?.nome || '',
      email: state.user?.email || '',
      telefone: state.user?.telefone || '',
      cpf: state.user?.cpf || '',
      cnpj: state.user?.cnpj || '',
      razao_social: state.user?.razao_social || '',
      nome_fantasia: state.user?.nome_fantasia || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      await updateProfile(values);
      setIsEditing(false);
    },
  });

  // IMPORTANTE: formik não deve entrar nas deps — causaria loop infinito
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (state.user) {
      formik.resetForm({
        values: {
          nome: state.user.nome || '',
          email: state.user.email || '',
          telefone: state.user.telefone || '',
          cpf: state.user.cpf || '',
          cnpj: state.user.cnpj || '',
          razao_social: state.user.razao_social || '',
          nome_fantasia: state.user.nome_fantasia || '',
        },
      });
    }
  }, [state.user]); // apenas state.user

  const handleEdit = () => { setIsEditing(true); clearError(); };
  const handleCancel = () => { setIsEditing(false); formik.resetForm(); clearError(); };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError('');
    setLogoSuccess('');
    // preview local
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    // upload
    setLogoUploading(true);
    try {
      const resp: any = await empresaService.uploadLogo(file);
      const url = resp?.url || resp?.data?.url || resp?.logo_url || resp?.path;
      if (url) {
        await updateProfile({ logo_url: url });
        setLogoSuccess('Logo atualizada com sucesso!');
        setTimeout(() => setLogoSuccess(''), 3000);
      } else {
        setLogoError('Não foi possível obter a URL da logo.');
      }
    } catch {
      setLogoError('Erro ao fazer upload da logo.');
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleFormattedChange = (field: string, value: string) => {
    let formatted = value;
    switch (field) {
      case 'nome': case 'razao_social': case 'nome_fantasia': formatted = normalizeName(value); break;
      case 'email': formatted = normalizeEmail(value); break;
      case 'telefone': formatted = maskPhoneBR(value); break;
      case 'cpf': formatted = maskCPF(value); break;
      case 'cnpj': formatted = maskCNPJ(value); break;
    }
    formik.setFieldValue(field, formatted);
  };

  const passwordFormik = useFormik({
    initialValues: { senha_atual: '', nova_senha: '', confirmar_senha: '' },
    validationSchema: Yup.object({
      senha_atual: Yup.string().required('Senha atual é obrigatória'),
      nova_senha: Yup.string().min(6, 'Mínimo 6 caracteres').required('Nova senha é obrigatória'),
      confirmar_senha: Yup.string()
        .oneOf([Yup.ref('nova_senha')], 'As senhas não coincidem')
        .required('Confirmação é obrigatória'),
    }),
    onSubmit: async (values, helpers) => {
      setPasswordError('');
      setPasswordSuccess('');
      const response = await authService.changePassword({
        senha_atual: values.senha_atual,
        nova_senha: values.nova_senha,
      });
      if (response.success) {
        setPasswordSuccess('Senha alterada com sucesso!');
        helpers.resetForm();
        setTimeout(() => { setShowPasswordSection(false); setPasswordSuccess(''); }, 2000);
      } else {
        setPasswordError(response.message || 'Erro ao alterar senha');
      }
    },
  });

  if (!state.user) {
    return (
      <Alert severity="warning">Você precisa estar logado para acessar seu perfil.</Alert>
    );
  }

  const getInitials = (name: string) =>
    name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2);

  const getUserTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'admin': return 'Administrador';
      case 'empresa': return 'Empresa';
      default: return 'Usuário';
    }
  };

  const getStatusColor = (tipo: string) => {
    switch (tipo) {
      case 'admin': return '#C23535';
      case 'empresa': return '#1565c0';
      default: return '#2e7d32';
    }
  };

  const profileDisplayName = state.user.tipo === 'empresa'
    ? state.user.nome_fantasia || state.user.razao_social || state.user.nome || 'Empresa'
    : state.user.nome || 'Usuário';

  const isEmpresa = state.user.tipo === 'empresa';
  const tabsConfig = isEmpresa
    ? [
        { label: 'Dados Pessoais', icon: <AccountCircle /> },
        { label: 'Empresa', icon: <Business /> },
        { label: 'Segurança', icon: <Lock /> },
      ]
    : [
        { label: 'Dados Pessoais', icon: <AccountCircle /> },
        { label: 'Segurança', icon: <Lock /> },
      ];

  const securityTabIndex = isEmpresa ? 2 : 1;

  return (
    <Box>
      {/* ── Cards de resumo ── */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          {
            label: 'Nome',
            value: profileDisplayName,
            icon: <Person />,
            color: '#C23535',
          },
          {
            label: 'Tipo de conta',
            value: getUserTypeLabel(state.user.tipo),
            icon: <Badge />,
            color: getStatusColor(state.user.tipo),
          },
          {
            label: 'Email',
            value: state.user.email || '—',
            icon: <Email />,
            color: '#1565c0',
          },
          {
            label: 'Telefone',
            value: state.user.telefone || '—',
            icon: <Phone />,
            color: '#2e7d32',
          },
        ].map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card sx={accentCardSx(card.color)}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                  <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: card.color, wordBreak: 'break-word' }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Painel com abas ── */}
      <Paper sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(44,44,44,0.08)', overflow: 'hidden' }}>
        {/* Avatar + Info no topo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Avatar
            src={state.user.tipo === 'empresa' ? state.user.logo_url || undefined : undefined}
            sx={{ width: 72, height: 72, bgcolor: '#C23535', fontSize: 28 }}
          >
            {state.user.tipo === 'empresa' ? <Business sx={{ fontSize: 36 }} /> : getInitials(profileDisplayName)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700}>{profileDisplayName}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip
                label={getUserTypeLabel(state.user.tipo)}
                size="small"
                sx={{
                  bgcolor: getStatusColor(state.user.tipo),
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Membro desde {new Date(state.user.criado_em || '').toLocaleDateString('pt-BR')}
              </Typography>
            </Box>
          </Box>
          {!isEditing ? (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={handleEdit}
              sx={{ borderColor: '#C23535', color: '#C23535', '&:hover': { borderColor: '#A52A2A', bgcolor: 'rgba(194,53,53,0.05)' }, borderRadius: 2, fontWeight: 600 }}
            >
              Editar Perfil
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={() => formik.handleSubmit()}
                disabled={state.loading}
                sx={{ bgcolor: '#C23535', '&:hover': { bgcolor: '#A52A2A' }, borderRadius: 2, fontWeight: 700 }}
              >
                {state.loading ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                sx={{ borderRadius: 2 }}
              >
                Cancelar
              </Button>
            </Box>
          )}
        </Box>

        {/* Alerts */}
        {state.error && (
          <Box sx={{ px: 3, pt: 2 }}>
            <Alert severity="error" onClose={clearError}>{state.error}</Alert>
          </Box>
        )}

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: 2,
            '& .MuiTab-root.Mui-selected': { color: '#C23535', fontWeight: 700 },
            '& .MuiTabs-indicator': { bgcolor: '#C23535' },
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabsConfig.map((t) => (
            <Tab key={t.label} icon={t.icon} iconPosition="start" label={t.label} />
          ))}
        </Tabs>

        {/* ── ABA: Dados Pessoais ── */}
        <TabPanel value={tabValue} index={0}>
          <Box component="form" onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={cardSx}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#C23535', mb: 2 }}>
                      Informações Básicas
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth size="small" id="nome" name="nome" label="Nome Completo"
                          value={formik.values.nome}
                          onChange={(e) => handleFormattedChange('nome', e.target.value)}
                          onBlur={formik.handleBlur}
                          error={formik.touched.nome && Boolean(formik.errors.nome)}
                          helperText={formik.touched.nome && formik.errors.nome}
                          disabled={!isEditing}
                          InputProps={{ startAdornment: <InputAdornment position="start"><Person /></InputAdornment> }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth size="small" id="email" name="email" label="Email" type="email"
                          value={formik.values.email}
                          onChange={(e) => handleFormattedChange('email', e.target.value)}
                          onBlur={formik.handleBlur}
                          error={formik.touched.email && Boolean(formik.errors.email)}
                          helperText={formik.touched.email && formik.errors.email}
                          disabled={!isEditing}
                          InputProps={{ startAdornment: <InputAdornment position="start"><Email /></InputAdornment> }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth size="small" id="telefone" name="telefone" label="Telefone"
                          value={formik.values.telefone}
                          onChange={(e) => handleFormattedChange('telefone', e.target.value)}
                          onBlur={formik.handleBlur}
                          error={formik.touched.telefone && Boolean(formik.errors.telefone)}
                          helperText={formik.touched.telefone && formik.errors.telefone}
                          disabled={!isEditing}
                          placeholder="(11) 99999-9999"
                          InputProps={{ startAdornment: <InputAdornment position="start"><Phone /></InputAdornment> }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={cardSx}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#C23535', mb: 2 }}>
                      Documentos
                    </Typography>
                    <Grid container spacing={2}>
                      {state.user.tipo === 'usuario' && (
                        <Grid item xs={12}>
                          <TextField
                            fullWidth size="small" id="cpf" name="cpf" label="CPF"
                            value={formik.values.cpf}
                            onChange={(e) => handleFormattedChange('cpf', e.target.value)}
                            onBlur={formik.handleBlur}
                            error={formik.touched.cpf && Boolean(formik.errors.cpf)}
                            helperText={formik.touched.cpf && formik.errors.cpf}
                            disabled={!isEditing}
                            placeholder="123.456.789-01"
                            InputProps={{ startAdornment: <InputAdornment position="start"><Person /></InputAdornment> }}
                          />
                        </Grid>
                      )}
                      {state.user.tipo === 'empresa' && (
                        <Grid item xs={12}>
                          <TextField
                            fullWidth size="small" id="cnpj" name="cnpj" label="CNPJ"
                            value={formik.values.cnpj}
                            onChange={(e) => handleFormattedChange('cnpj', e.target.value)}
                            onBlur={formik.handleBlur}
                            disabled={!isEditing}
                            placeholder="12.345.678/0001-90"
                            InputProps={{ startAdornment: <InputAdornment position="start"><Business /></InputAdornment> }}
                          />
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Para alterar documentos oficiais, entre em contato com o suporte.
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* ── ABA: Empresa (somente tipo=empresa) ── */}
        {isEmpresa && (
          <TabPanel value={tabValue} index={1}>
            <Box component="form" onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>

                {/* Card de logo */}
                <Grid item xs={12} md={4}>
                  <Card sx={cardSx}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} sx={{ color: '#C23535', mb: 2 }}>
                        Logo da Empresa
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ position: 'relative' }}>
                          <Avatar
                            src={logoPreview || state.user.logo_url || undefined}
                            variant="rounded"
                            sx={{ width: 110, height: 110, bgcolor: '#f4f4f5', border: '2px dashed #C23535', borderRadius: 3, fontSize: 40 }}
                          >
                            <Business sx={{ fontSize: 48, color: '#C23535' }} />
                          </Avatar>
                          {logoUploading && (
                            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.75)', borderRadius: 3 }}>
                              <CircularProgress size={32} sx={{ color: '#C23535' }} />
                            </Box>
                          )}
                        </Box>
                        {logoSuccess && <Alert severity="success" sx={{ width: '100%', py: 0.5 }}>{logoSuccess}</Alert>}
                        {logoError && <Alert severity="error" sx={{ width: '100%', py: 0.5 }}>{logoError}</Alert>}
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleLogoChange}
                        />
                        <Button
                          type="button"
                          variant="contained"
                          startIcon={<PhotoCamera />}
                          onClick={() => logoInputRef.current?.click()}
                          disabled={logoUploading}
                          size="small"
                          sx={{ bgcolor: '#C23535', '&:hover': { bgcolor: '#A52A2A' }, borderRadius: 2, fontWeight: 700 }}
                        >
                          {logoUploading ? 'Enviando...' : 'Alterar Logo'}
                        </Button>
                        <Typography variant="caption" color="text.secondary" textAlign="center">
                          JPG, PNG ou WebP · máx. 5 MB
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Card sx={cardSx}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} sx={{ color: '#C23535', mb: 2 }}>
                        Dados da Empresa
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth size="small" label="Razão Social"
                            value={formik.values.razao_social}
                            onChange={(e) => handleFormattedChange('razao_social', e.target.value)}
                            onBlur={formik.handleBlur}
                            disabled={!isEditing}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Business /></InputAdornment> }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth size="small" label="Nome Fantasia"
                            value={formik.values.nome_fantasia}
                            onChange={(e) => handleFormattedChange('nome_fantasia', e.target.value)}
                            onBlur={formik.handleBlur}
                            disabled={!isEditing}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Business /></InputAdornment> }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth size="small" label="CNPJ"
                            value={formik.values.cnpj}
                            onChange={(e) => handleFormattedChange('cnpj', e.target.value)}
                            onBlur={formik.handleBlur}
                            disabled={!isEditing}
                            placeholder="12.345.678/0001-90"
                            InputProps={{ startAdornment: <InputAdornment position="start"><Business /></InputAdornment> }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <CompanyProfilePanel companyName={profileDisplayName} />
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        )}

        {/* ── ABA: Segurança ── */}
        <TabPanel value={tabValue} index={securityTabIndex}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={cardSx}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#C23535', mb: 1 }}>
                    Alterar Senha
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Use uma senha forte com pelo menos 6 caracteres.
                  </Typography>

                  <Button
                    variant="outlined"
                    startIcon={<VpnKey />}
                    onClick={() => {
                      setShowPasswordSection(v => !v);
                      setPasswordError('');
                      setPasswordSuccess('');
                      passwordFormik.resetForm();
                    }}
                    color={showPasswordSection ? 'error' : 'primary'}
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  >
                    {showPasswordSection ? 'Cancelar' : 'Alterar Senha'}
                  </Button>

                  <Collapse in={showPasswordSection}>
                    <Box component="form" onSubmit={passwordFormik.handleSubmit} sx={{ mt: 3 }}>
                      <Divider sx={{ mb: 2 }} />
                      {passwordError && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPasswordError('')}>{passwordError}</Alert>
                      )}
                      {passwordSuccess && (
                        <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>
                      )}
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth size="small" id="senha_atual" name="senha_atual" label="Senha Atual"
                            type={showCurrentPwd ? 'text' : 'password'}
                            value={passwordFormik.values.senha_atual}
                            onChange={passwordFormik.handleChange}
                            onBlur={passwordFormik.handleBlur}
                            error={passwordFormik.touched.senha_atual && Boolean(passwordFormik.errors.senha_atual)}
                            helperText={passwordFormik.touched.senha_atual && passwordFormik.errors.senha_atual}
                            InputProps={{
                              startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>,
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton onClick={() => setShowCurrentPwd(v => !v)} edge="end">
                                    {showCurrentPwd ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth size="small" id="nova_senha" name="nova_senha" label="Nova Senha"
                            type={showNewPwd ? 'text' : 'password'}
                            value={passwordFormik.values.nova_senha}
                            onChange={passwordFormik.handleChange}
                            onBlur={passwordFormik.handleBlur}
                            error={passwordFormik.touched.nova_senha && Boolean(passwordFormik.errors.nova_senha)}
                            helperText={passwordFormik.touched.nova_senha && passwordFormik.errors.nova_senha}
                            InputProps={{
                              startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>,
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton onClick={() => setShowNewPwd(v => !v)} edge="end">
                                    {showNewPwd ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth size="small" id="confirmar_senha" name="confirmar_senha" label="Confirmar Nova Senha"
                            type={showConfirmPwd ? 'text' : 'password'}
                            value={passwordFormik.values.confirmar_senha}
                            onChange={passwordFormik.handleChange}
                            onBlur={passwordFormik.handleBlur}
                            error={passwordFormik.touched.confirmar_senha && Boolean(passwordFormik.errors.confirmar_senha)}
                            helperText={passwordFormik.touched.confirmar_senha && passwordFormik.errors.confirmar_senha}
                            InputProps={{
                              startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>,
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton onClick={() => setShowConfirmPwd(v => !v)} edge="end">
                                    {showConfirmPwd ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            type="submit"
                            variant="contained"
                            startIcon={<Save />}
                            disabled={passwordFormik.isSubmitting}
                            sx={{ bgcolor: '#C23535', '&:hover': { bgcolor: '#A52A2A' }, borderRadius: 2, fontWeight: 700 }}
                          >
                            {passwordFormik.isSubmitting ? 'Salvando...' : 'Salvar Nova Senha'}
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default UserProfile;
