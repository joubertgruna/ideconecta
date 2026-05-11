import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Business,
  LocationOn,
  Phone,
  Email,
  Language,
  Instagram,
  ArrowBack,
  // Edit removed (unused)
  Share,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';
import { empresaService, Empresa } from '../services/empresaService';

const EmpresaDetalhes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    if (id) {
      carregarEmpresa(parseInt(id));
    }
  }, [id]);

  const carregarEmpresa = async (empresaId: number) => {
    setLoading(true);
    try {
      const response = await empresaService.obterEmpresa(empresaId);
      if (response.success && response.data) {
        setEmpresa(response.data);
      } else {
        setError('Empresa não encontrada');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao carregar empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    navigate('/busca');
  };

  const handleFavoritar = () => {
    setFavorited(!favorited);
    // TODO: Implementar lógica de favoritos no backend
  };

  const handleCompartilhar = () => {
    if (navigator.share) {
      navigator.share({
        title: empresa?.nome_fantasia || empresa?.razao_social,
        text: `Confira ${empresa?.nome_fantasia || empresa?.razao_social} no IDEBRASIL`,
        url: window.location.href,
      });
    } else {
      // Fallback para copiar URL
      navigator.clipboard.writeText(window.location.href);
      // TODO: Mostrar toast de confirmação
    }
  };

  const handleContato = () => {
    setContactDialogOpen(true);
  };

  const handleEnviarContato = () => {
    // TODO: Implementar envio de mensagem de contato
    console.log('Enviando mensagem:', contactMessage);
    setContactDialogOpen(false);
    setContactMessage('');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'verificado': return 'Verificada';
      case 'rejeitado': return 'Rejeitada';
      case 'pendente': return 'Pendente';
      default: return 'Desconhecido';
    }
  };

  const getRamoLabel = (ramo: string) => {
    switch (ramo) {
      case 'comercio': return 'Comércio';
      case 'industrial': return 'Industrial';
      case 'prestacao_servico': return 'Prestação de Serviço';
      default: return ramo;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#C23535' }} />
      </Box>
    );
  }

  if (error || !empresa) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error || 'Empresa não encontrada'}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={handleVoltar} sx={{ color: '#C23535' }}>
          Voltar para busca
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f4f4f5', minHeight: '100vh' }}>
      {/* Hero Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #C23535 0%, #A52A2A 100%)',
          py: { xs: 5, md: 7 },
          color: '#fff',
        }}
      >
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBack />}
            onClick={handleVoltar}
            sx={{ color: 'rgba(255,255,255,0.85)', mb: 3, '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            Voltar para busca
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Avatar
              src={empresa.logo_url}
              variant="rounded"
              sx={{
                width: { xs: 72, md: 96 },
                height: { xs: 72, md: 96 },
                bgcolor: 'rgba(255,255,255,0.2)',
                border: '3px solid rgba(255,255,255,0.4)',
                borderRadius: 3,
                fontSize: 36,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              <Business sx={{ fontSize: 36 }} />
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                sx={{ color: '#fff', fontWeight: 700, mb: 0.5, fontSize: { xs: '1.5rem', md: '2rem' } }}
              >
                {empresa.nome_fantasia || empresa.razao_social}
              </Typography>
              {empresa.nome_fantasia && (
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                  {empresa.razao_social}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={getRamoLabel(empresa.ramo_atuacao)}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600 }}
                />
                <Chip
                  label={getStatusLabel(empresa.status)}
                  size="small"
                  sx={{
                    bgcolor: empresa.status === 'verificado' ? 'rgba(46,125,50,0.7)' : 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={handleFavoritar}
                sx={{ color: favorited ? '#FFD4D7' : 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}
              >
                {favorited ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
              <IconButton
                onClick={handleCompartilhar}
                sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}
              >
                <Share />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
        <Grid container spacing={3}>
          {/* Informações Principais */}
          <Grid item xs={12} md={8}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 2px 16px rgba(44,44,44,0.08)',
                border: '1px solid rgba(194,53,53,0.1)',
                mb: 3,
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: '#C23535', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Business fontSize="small" /> Sobre a Empresa
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#2C2C2C' }}>
                  {empresa.descricao_servico}
                </Typography>

                <Divider sx={{ my: 3, borderColor: 'rgba(194,53,53,0.1)' }} />

                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: '#C23535', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Phone fontSize="small" /> Informações de Contato
                </Typography>

                <Grid container spacing={2}>
                  {empresa.telefone && (
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: '#fafafa',
                          border: '1px solid #f0f0f0',
                        }}
                      >
                        <Phone sx={{ color: '#C23535', fontSize: 20 }} />
                        <Typography variant="body2" fontWeight={500}>{empresa.telefone}</Typography>
                      </Box>
                    </Grid>
                  )}

                  {empresa.email_empresa && (
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: '#fafafa',
                          border: '1px solid #f0f0f0',
                        }}
                      >
                        <Email sx={{ color: '#C23535', fontSize: 20 }} />
                        <Typography variant="body2" fontWeight={500}>{empresa.email_empresa}</Typography>
                      </Box>
                    </Grid>
                  )}

                  {empresa.website && (
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: '#fafafa',
                          border: '1px solid #f0f0f0',
                        }}
                      >
                        <Language sx={{ color: '#C23535', fontSize: 20 }} />
                        <Typography
                          variant="body2"
                          component="a"
                          href={empresa.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ color: '#C23535', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                        >
                          {empresa.website}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {empresa.instagram && (
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: '#fafafa',
                          border: '1px solid #f0f0f0',
                        }}
                      >
                        <Instagram sx={{ color: '#C23535', fontSize: 20 }} />
                        <Typography
                          variant="body2"
                          component="a"
                          href={`https://instagram.com/${empresa.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ color: '#C23535', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                        >
                          @{empresa.instagram}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>

                <Button
                  variant="contained"
                  onClick={handleContato}
                  fullWidth
                  size="large"
                  sx={{
                    mt: 3,
                    bgcolor: '#C23535',
                    '&:hover': { bgcolor: '#A52A2A' },
                    borderRadius: 2,
                    fontWeight: 700,
                    py: 1.5,
                  }}
                >
                  Entrar em Contato
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 2px 16px rgba(44,44,44,0.08)',
                border: '1px solid rgba(194,53,53,0.1)',
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#C23535', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn fontSize="small" /> Localização
                </Typography>
                <Typography variant="body2" fontWeight={500} color="#2C2C2C">
                  {empresa.endereco}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  {empresa.cidade}{empresa.cidade && empresa.estado ? ', ' : ''}{empresa.estado}
                </Typography>
                {empresa.cep && (
                  <Typography variant="body2" color="text.secondary">
                    CEP: {empresa.cep}
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 2px 16px rgba(44,44,44,0.08)',
                border: '1px solid rgba(194,53,53,0.1)',
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#C23535', mb: 2 }}>
                  Dados Cadastrais
                </Typography>
                {[
                  { label: 'CNPJ', value: empresa.cnpj },
                  { label: 'Responsável', value: empresa.nome },
                  { label: 'Email', value: empresa.email },
                ].map(({ label, value }) => value ? (
                  <Box key={label} sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" fontSize={10}>
                      {label}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>{value}</Typography>
                  </Box>
                ) : null)}
              </CardContent>
            </Card>

            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 2px 16px rgba(44,44,44,0.08)',
                border: '1px solid rgba(194,53,53,0.1)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#C23535', mb: 2 }}>
                  Membro desde
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(empresa.criado_em || Date.now()).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Dialog de Contato */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#C23535' }}>Entrar em Contato</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Envie uma mensagem para {empresa.nome_fantasia || empresa.razao_social}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Mensagem"
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setContactDialogOpen(false)} sx={{ color: '#666' }}>Cancelar</Button>
          <Button
            onClick={handleEnviarContato}
            variant="contained"
            disabled={!contactMessage.trim()}
            sx={{ bgcolor: '#C23535', '&:hover': { bgcolor: '#A52A2A' }, borderRadius: 2, fontWeight: 700 }}
          >
            Enviar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmpresaDetalhes;