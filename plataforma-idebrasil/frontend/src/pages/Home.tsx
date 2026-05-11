import React from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';

const Home: React.FC = () => {
  const stats = {
    empresas: 150,
    categorias: 15,
    estados: 26
  };

  const diferenciais = [
    {
      icon: <VerifiedRoundedIcon sx={{ fontSize: 30 }} />,
      title: 'Rede validada e confiável',
      description: 'Cadastros com processo de validação administrativa para elevar qualidade das conexões.'
    },
    {
      icon: <InsightsRoundedIcon sx={{ fontSize: 30 }} />,
      title: 'Busca inteligente',
      description: 'Filtre por categoria, localidade e ramo para chegar em parceiros com mais precisão.'
    },
    {
      icon: <SecurityRoundedIcon sx={{ fontSize: 30 }} />,
      title: 'Dados com governança',
      description: 'Fluxo transparente, trilha de aprovação e visibilidade para uma comunidade mais segura.'
    }
  ];

  const jornada = [
    {
      step: '01',
      title: 'Cadastre sua empresa',
      description: 'Complete o perfil com dados institucionais, contato e categoria de atuação.'
    },
    {
      step: '02',
      title: 'Valide e publique',
      description: 'A equipe analisa as informações para garantir padrão e confiabilidade da rede.'
    },
    {
      step: '03',
      title: 'Conecte e cresça',
      description: 'Apareça nas buscas, receba oportunidades e fortaleça o ecossistema IDECONECTA.'
    }
  ];

  return (
    <Box sx={{ backgroundColor: '#f4f4f5' }}>
      {/* Hero Section - glass + premium look */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          py: { xs: 8, md: 12 },
          background: 'linear-gradient(135deg, #2C2C2C 0%, #3A3A3A 45%, #C23535 100%)',
          color: '#ffffff'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none'
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                icon={<BoltRoundedIcon />}
                label="IDECONECTA • ecossistema empresarial"
                sx={{
                  mb: 3,
                  px: 1,
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.25)'
                }}
              />

              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.6rem', md: '3.4rem' },
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  mb: 2,
                  color: '#fff'
                }}
              >
                Conexões que aceleram
                <Box component="span" sx={{ color: '#FFD4D7', display: 'block' }}>
                  negócios de verdade
                </Box>
              </Typography>

              <Typography sx={{ fontSize: { xs: '1rem', md: '1.18rem' }, color: '#ffffff', maxWidth: 640, mb: 4, textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                O IDECONECTA conecta empresas, empreendedores e oportunidades com padrão de curadoria,
                visibilidade qualificada e experiência moderna para geração de parcerias estratégicas.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  to="/busca"
                  startIcon={<SearchIcon />}
                  sx={{
                    minWidth: 210,
                    backgroundColor: '#ffffff',
                    color: '#2C2C2C',
                    fontWeight: 700,
                    borderRadius: '999px',
                    '&:hover': {
                      backgroundColor: '#f2f2f2',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Explorar empresas
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  to="/empresa/cadastro"
                  startIcon={<RocketLaunchRoundedIcon />}
                  sx={{
                    minWidth: 210,
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.6)',
                    borderRadius: '999px',
                    fontWeight: 700,
                    '&:hover': {
                      borderColor: '#fff',
                      bgcolor: 'rgba(255,255,255,0.12)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Quero me cadastrar
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card
                sx={{
                  p: { xs: 2.5, md: 3 },
                  background: 'rgba(255,255,255,0.16)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(12px)',
                  color: '#fff',
                  boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25)',
                  borderRadius: 4,
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.01)',
                    boxShadow: '0 24px 54px rgba(0, 0, 0, 0.3)'
                  }
                }}
              >
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 1.5 }}>
                  Por que o IDECONECTA?
                </Typography>
                <Typography sx={{ opacity: 1, color: '#ffffff', mb: 2.5 }}>
                  Plataforma criada para fortalecer relações comerciais com qualidade,
                  credibilidade e foco em crescimento sustentável.
                </Typography>
                <Stack spacing={1.5}>
                  <Chip icon={<HubRoundedIcon />} label="Networking estratégico" sx={{ justifyContent: 'flex-start', color: '#fff', bgcolor: 'rgba(0,0,0,0.18)' }} />
                  <Chip icon={<VerifiedRoundedIcon />} label="Empresas com validação" sx={{ justifyContent: 'flex-start', color: '#fff', bgcolor: 'rgba(0,0,0,0.18)' }} />
                  <Chip icon={<InsightsRoundedIcon />} label="Descoberta por filtros avançados" sx={{ justifyContent: 'flex-start', color: '#fff', bgcolor: 'rgba(0,0,0,0.18)' }} />
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Metrics */}
      <Container maxWidth="lg" sx={{ mt: { xs: -3, md: -4 }, mb: 2, position: 'relative', zIndex: 2 }}>
        <Card sx={{ borderRadius: 4, p: { xs: 2, md: 3 }, backgroundColor: '#ffffff', boxShadow: '0 18px 40px rgba(44,44,44,0.12)' }}>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Typography sx={{ fontSize: { xs: '1.8rem', md: '2.1rem' }, fontWeight: 700, color: '#C23535' }}>{stats.empresas}+</Typography>
              <Typography variant="body2">Empresas cadastradas</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography sx={{ fontSize: { xs: '1.8rem', md: '2.1rem' }, fontWeight: 700, color: '#C23535' }}>{stats.categorias}</Typography>
              <Typography variant="body2">Categorias ativas</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography sx={{ fontSize: { xs: '1.8rem', md: '2.1rem' }, fontWeight: 700, color: '#C23535' }}>{stats.estados}</Typography>
              <Typography variant="body2">Estados atendidos</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography sx={{ fontSize: { xs: '1.8rem', md: '2.1rem' }, fontWeight: 700, color: '#C23535' }}>24/7</Typography>
              <Typography variant="body2">Descoberta de parceiros</Typography>
            </Grid>
          </Grid>
        </Card>
      </Container>

      {/* Value Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 9 } }}>
        <Stack spacing={1.5} sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Uma plataforma feita para conexões de alto valor
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 900 }}>
            Mantivemos o foco no que importa: experiência simples, confiável e orientada a resultado.
            O IDECONECTA ajuda empresas a se encontrarem mais rápido e com critérios claros.
          </Typography>
        </Stack>

        <Grid container spacing={4}>
          {diferenciais.map((item) => (
            <Grid item xs={12} md={4} key={item.title}>
              <Card
                sx={{
                  height: '100%',
                  p: 3,
                  borderRadius: 4,
                  border: '1px solid rgba(194,53,53,0.15)',
                  background: 'linear-gradient(180deg, #ffffff 0%, #f9f9f9 100%)',
                  '&:hover': { transform: 'translateY(-6px)' }
                }}
              >
                <Box sx={{ color: '#C23535', mb: 2 }}>{item.icon}</Box>
                <Typography variant="h5" sx={{ mb: 1.2, fontWeight: 700 }}>{item.title}</Typography>
                <Typography variant="body1">{item.description}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Journey Section */}
      <Box sx={{ py: { xs: 7, md: 10 }, backgroundColor: '#ffffff' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 4 }}>
            Como funciona no IDECONECTA
          </Typography>

          <Grid container spacing={3}>
            {jornada.map((item) => (
              <Grid item xs={12} md={4} key={item.step}>
                <Card sx={{ height: '100%', p: 3, borderRadius: 4 }}>
                  <Typography sx={{ color: '#C23535', fontWeight: 700, mb: 1 }}>{item.step}</Typography>
                  <Typography variant="h5" sx={{ mb: 1.2, fontWeight: 700 }}>{item.title}</Typography>
                  <Typography variant="body1">{item.description}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Original features kept with new visual treatment */}
      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 9 } }}>
        <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700 }}>
          Recursos essenciais da plataforma
        </Typography>
        <Typography align="center" sx={{ mb: 4, maxWidth: 840, mx: 'auto' }}>
          Mantivemos as funcionalidades principais que já estavam disponíveis e refinamos a experiência visual.
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 3, borderRadius: 4 }}>
              <CardContent>
                <BusinessIcon sx={{ fontSize: 48, color: '#C23535', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                  Cadastre sua empresa
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Preencha os dados, valide seu perfil e ganhe visibilidade para novos negócios.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 3, borderRadius: 4 }}>
              <CardContent>
                <SearchIcon sx={{ fontSize: 48, color: '#C23535', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                  Encontre parceiros
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Descubra empresas por categoria, estado e cidade com busca rápida e prática.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: '#2C2C2C', color: 'white', py: { xs: 7, md: 9 }, textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#ffffff' }}>
            Pronto para conectar com a comunidade IDEBRASIL?
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.9, color: '#ffffff' }}>
            Junte-se a centenas de empreendedores já cadastrados na nossa plataforma.
          </Typography>
          <Divider sx={{ maxWidth: 300, mx: 'auto', mb: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/empresa/cadastro"
            sx={{
              minWidth: 250,
              bgcolor: '#C23535',
              borderRadius: '999px',
              fontWeight: 700,
              '&:hover': {
                bgcolor: '#A52A2A',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Cadastrar Minha Empresa
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;