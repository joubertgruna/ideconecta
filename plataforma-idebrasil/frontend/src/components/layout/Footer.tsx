import React from 'react';
import { Box, Typography, Container, Grid, Link, Divider, Stack, Chip } from '@mui/material';
import { Phone, Email, Language } from '@mui/icons-material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(180deg, #2C2C2C 0%, #1a1a1a 100%)',
        color: 'rgba(255,255,255,0.8)',
        pt: 7,
        pb: 3,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={5}>
          {/* Brand column */}
          <Grid item xs={12} sm={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                component="img"
                src="/logo.png"
                alt="IDECONECTA"
                sx={{
                  height: 36,
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)',
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.65)', maxWidth: 280 }}>
              Plataforma de conexões empresariais para fortalecer a comunidade IDEBRASIL com qualidade, credibilidade e foco em crescimento.
            </Typography>
            <Chip
              label="Rede validada e confiável"
              size="small"
              sx={{ mt: 2, bgcolor: 'rgba(194,53,53,0.2)', color: '#E63946', border: '1px solid rgba(194,53,53,0.3)', fontWeight: 600 }}
            />
          </Grid>

          {/* Links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle2" color="white" fontWeight={700} gutterBottom sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontSize: 11 }}>
              Plataforma
            </Typography>
            <Stack spacing={1.2}>
              {[
                { label: 'Buscar Empresas', href: '/busca' },
                { label: 'Cadastrar Empresa', href: '/empresa/cadastro' },
                { label: 'Entrar', href: '/login' },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  sx={{
                    color: 'rgba(255,255,255,0.65)',
                    textDecoration: 'none',
                    fontSize: 14,
                    transition: 'color 0.2s',
                    '&:hover': { color: '#E63946' },
                  }}
                >
                  {label}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle2" color="white" fontWeight={700} gutterBottom sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontSize: 11 }}>
              IDEBRASIL
            </Typography>
            <Stack spacing={1.2}>
              {[
                { label: 'Sobre', href: '#' },
                { label: 'Cursos', href: '#' },
                { label: 'Franquias', href: '#' },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  sx={{
                    color: 'rgba(255,255,255,0.65)',
                    textDecoration: 'none',
                    fontSize: 14,
                    transition: 'color 0.2s',
                    '&:hover': { color: '#E63946' },
                  }}
                >
                  {label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} sm={4} md={4}>
            <Typography variant="subtitle2" color="white" fontWeight={700} gutterBottom sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontSize: 11 }}>
              Contato
            </Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Phone sx={{ fontSize: 16, color: '#C23535' }} />
                <Typography variant="body2" color="rgba(255,255,255,0.75)">(+55 45) 99111-2468</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Email sx={{ fontSize: 16, color: '#C23535' }} />
                <Typography variant="body2" color="rgba(255,255,255,0.75)">falecom@idebrasil.com.br</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Language sx={{ fontSize: 16, color: '#C23535' }} />
                <Typography variant="body2" color="rgba(255,255,255,0.75)">www.idebrasil.com.br</Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mt: 5, mb: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" color="rgba(255,255,255,0.45)">
            © {new Date().getFullYear()} IDEBRASIL. Todos os direitos reservados.
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#C23535' }} />
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#E63946' }} />
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#A52A2A' }} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
