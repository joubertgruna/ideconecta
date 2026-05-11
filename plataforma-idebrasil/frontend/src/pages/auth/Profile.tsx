import React from 'react';
import { Container, Typography, Box, Button, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UserProfile from '../../components/auth/UserProfile';
import { useAuth } from '../../contexts/AuthContext';

const Profile: React.FC = () => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!state.loading && !state.isAuthenticated) {
      navigate('/login');
    }
  }, [state.loading, state.isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Só exibe spinner durante verificação inicial de auth (não durante updateProfile)
  if (state.loading && !state.isAuthenticated) {
    return (
      <Box sx={{ backgroundColor: '#f4f4f5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#C23535' }} />
      </Box>
    );
  }

  if (!state.isAuthenticated) {
    return (
      <Box sx={{ backgroundColor: '#f4f4f5', minHeight: '100vh' }}>
        <Container maxWidth="sm" sx={{ pt: 8, textAlign: 'center' }}>
          <Alert severity="warning">
            Você precisa estar logado para acessar esta página.
          </Alert>
          <Button variant="contained" sx={{ mt: 2, bgcolor: '#C23535', '&:hover': { bgcolor: '#A52A2A' } }}
            onClick={() => navigate('/login')}>
            Fazer Login
          </Button>
        </Container>
      </Box>
    );
  }

  const getUserTypeLabel = (tipo?: string) => {
    switch (tipo) {
      case 'admin': return 'Administrador';
      case 'empresa': return 'Empresa';
      default: return 'Usuário';
    }
  };

  const displayName = state.user?.tipo === 'empresa'
    ? state.user?.nome_fantasia || state.user?.razao_social || state.user?.nome || 'Empresa'
    : state.user?.nome || 'Usuário';

  return (
    <Box sx={{ backgroundColor: '#f4f4f5', minHeight: '100vh' }}>
      {/* Hero Header — mesmo padrão do AdminDashboard */}
      <Box sx={{ background: 'linear-gradient(135deg, #C23535 0%, #A52A2A 100%)', py: { xs: 4, md: 5 }, color: '#fff' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} color="#fff" sx={{ fontFamily: 'ASAP, sans-serif' }}>
                Meu Perfil
              </Typography>
              <Typography sx={{ opacity: 0.85, mt: 0.5, fontSize: '0.95rem' }}>
                IDEBRASIL — {displayName} &nbsp;·&nbsp; {getUserTypeLabel(state.user?.tipo)}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={handleLogout}
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' }, borderRadius: 2, fontWeight: 600 }}
            >
              Sair
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Conteúdo */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <UserProfile />
      </Container>
    </Box>
  );
};

export default Profile;