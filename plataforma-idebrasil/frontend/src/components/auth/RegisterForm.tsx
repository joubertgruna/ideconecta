import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person, Business, Phone, CheckCircle } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserType } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { maskCPF, maskPhoneBR, normalizeEmail, normalizeName } from '../../utils/inputMasks';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`register-tabpanel-${index}`}
      aria-labelledby={`register-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const RegisterForm: React.FC = () => {
  const { state, login, clearError } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    clearError();
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

  const handleFormattedChange = (field: string, value: string) => {
    let formattedValue = value;

    switch (field) {
      case 'nome':
        formattedValue = normalizeName(value);
        break;
      case 'email':
        formattedValue = normalizeEmail(value);
        break;
      case 'telefone':
        formattedValue = maskPhoneBR(value);
        break;
      case 'cpf':
        formattedValue = maskCPF(value);
        break;
      default:
        break;
    }

    formik.setFieldValue(field, formattedValue);
  };

  const getUserType = (index: number): UserType => {
    switch (index) {
      case 0: return 'usuario';
      case 1: return 'empresa';
      default: return 'usuario';
    }
  };

  const getValidationSchema = (userType: UserType) => {
    const baseSchema = {
      nome: Yup.string()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .required('Nome é obrigatório'),
      email: Yup.string()
        .email('Email inválido')
        .required('Email é obrigatório'),
      senha: Yup.string()
        .min(6, 'A senha deve ter pelo menos 6 caracteres')
        .required('Senha é obrigatória'),
      confirmarSenha: Yup.string()
        .oneOf([Yup.ref('senha')], 'As senhas não coincidem')
        .required('Confirmação de senha é obrigatória'),
      telefone: Yup.string()
        .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato: (11) 99999-9999')
        .required('Telefone é obrigatório'),
    };

    if (userType === 'usuario') {
      return Yup.object({
        ...baseSchema,
        cpf: Yup.string()
          .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'Formato: 123.456.789-01')
          .required('CPF é obrigatório'),
        data_nascimento: Yup.date()
          .max(new Date(), 'Data de nascimento não pode ser no futuro')
          .required('Data de nascimento é obrigatória'),
      });
    }

    return Yup.object(baseSchema);
  };

  const formik = useFormik({
    initialValues: {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      telefone: '',
      cpf: '',
      data_nascimento: '',
      tipo: 'usuario' as UserType,
    },
    validationSchema: getValidationSchema(getUserType(tabValue)),
    onSubmit: async (values) => {
      clearError();
      const userType = getUserType(tabValue);
      const response = await authService.register({
        nome: values.nome,
        email: values.email,
        senha: values.senha,
        cpf: values.cpf || undefined,
        telefone: values.telefone,
        data_nascimento: values.data_nascimento || undefined,
        tipo: userType,
      });

      if (response.success) {
        setRegisterSuccess(true);
        // Login automático após cadastro
        setTimeout(async () => {
          await login({ email: values.email, senha: values.senha }, userType);
          navigate(userType === 'admin' ? '/admin' : userType === 'empresa' ? '/perfil' : '/perfil');
        }, 1500);
      } else {
        // Usar o alert local
        formik.setStatus(response.message || 'Erro ao criar conta');
      }
    },
  });

  // Atualizar validação quando a aba muda
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    formik.resetForm({
      values: {
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        telefone: '',
        cpf: '',
        data_nascimento: '',
        tipo: getUserType(tabValue),
      },
    });
  }, [tabValue]); // apenas tabValue — incluir formik causaria loop infinito

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Criar Conta
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="register tabs">
              <Tab
                icon={<Person />}
                label="Usuário"
                id="register-tab-0"
                aria-controls="register-tabpanel-0"
              />
              <Tab
                icon={<Business />}
                label="Empresa"
                id="register-tab-1"
                aria-controls="register-tabpanel-1"
              />
            </Tabs>
          </Box>

          {registerSuccess && (
            <Alert severity="success" sx={{ mt: 2 }} icon={<CheckCircle />}>
              Conta criada com sucesso! Redirecionando...
            </Alert>
          )}

          {formik.status && !registerSuccess && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => formik.setStatus(undefined)}>
              {formik.status}
            </Alert>
          )}

          {state.error && !registerSuccess && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={clearError}>
              {state.error}
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit}>
            <TabPanel value={tabValue} index={0}>
              <TextField
                fullWidth
                id="nome"
                name="nome"
                label="Nome Completo"
                value={formik.values.nome}
                onChange={(e) => handleFormattedChange('nome', e.target.value)}
                onBlur={formik.handleBlur}
                error={formik.touched.nome && Boolean(formik.errors.nome)}
                helperText={formik.touched.nome && formik.errors.nome}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                id="cpf"
                name="cpf"
                label="CPF"
                value={formik.values.cpf}
                onChange={(e) => handleFormattedChange('cpf', e.target.value)}
                onBlur={formik.handleBlur}
                error={formik.touched.cpf && Boolean(formik.errors.cpf)}
                helperText={formik.touched.cpf && formik.errors.cpf}
                margin="normal"
                placeholder="123.456.789-01"
              />

              <TextField
                fullWidth
                id="data_nascimento"
                name="data_nascimento"
                label="Data de Nascimento"
                type="date"
                value={formik.values.data_nascimento}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.data_nascimento && Boolean(formik.errors.data_nascimento)}
                helperText={formik.touched.data_nascimento && formik.errors.data_nascimento}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <TextField
                fullWidth
                id="nome"
                name="nome"
                label="Nome da Empresa"
                value={formik.values.nome}
                onChange={(e) => handleFormattedChange('nome', e.target.value)}
                onBlur={formik.handleBlur}
                error={formik.touched.nome && Boolean(formik.errors.nome)}
                helperText={formik.touched.nome && formik.errors.nome}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business />
                    </InputAdornment>
                  ),
                }}
              />
            </TabPanel>

            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              type="email"
              value={formik.values.email}
              onChange={(e) => handleFormattedChange('email', e.target.value)}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              id="telefone"
              name="telefone"
              label="Telefone"
              value={formik.values.telefone}
              onChange={(e) => handleFormattedChange('telefone', e.target.value)}
              onBlur={formik.handleBlur}
              error={formik.touched.telefone && Boolean(formik.errors.telefone)}
              helperText={formik.touched.telefone && formik.errors.telefone}
              margin="normal"
              placeholder="(11) 99999-9999"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              id="senha"
              name="senha"
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={formik.values.senha}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.senha && Boolean(formik.errors.senha)}
              helperText={formik.touched.senha && formik.errors.senha}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              id="confirmarSenha"
              name="confirmarSenha"
              label="Confirmar Senha"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formik.values.confirmarSenha}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmarSenha && Boolean(formik.errors.confirmarSenha)}
              helperText={formik.touched.confirmarSenha && formik.errors.confirmarSenha}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleClickShowConfirmPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={state.loading || registerSuccess}
            >
              {state.loading ? 'Criando conta...' : registerSuccess ? 'Conta criada!' : 'Criar Conta'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterForm;