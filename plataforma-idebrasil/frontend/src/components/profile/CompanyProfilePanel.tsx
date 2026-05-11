import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Delete, Edit, MonitorHeart, MiscellaneousServices, Message, WorkspacePremium } from '@mui/icons-material';

type MonitoringStatus = 'ok' | 'warning' | 'critical';
type MessageStatus = 'rascunho' | 'enviada' | 'arquivada';
type PlanStatus = 'ativo' | 'pausado' | 'cancelado';

interface MonitoringItem {
  id: number;
  titulo: string;
  status: MonitoringStatus;
  observacao: string;
  atualizadoEm: string;
}

interface ServiceItem {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  ativo: boolean;
}

interface MessageItem {
  id: number;
  assunto: string;
  destinatario: string;
  conteudo: string;
  status: MessageStatus;
  atualizadoEm: string;
}

interface PlanItem {
  id: number;
  nome: string;
  ciclo: 'mensal' | 'trimestral' | 'anual';
  valor: number;
  status: PlanStatus;
  atualizadoEm: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface CompanyProfilePanelProps {
  companyName: string;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const nowISO = () => new Date().toISOString();

const CompanyProfilePanel: React.FC<CompanyProfilePanelProps> = ({ companyName }) => {
  const [tab, setTab] = useState(0);

  const [monitoringItems, setMonitoringItems] = useState<MonitoringItem[]>([
    { id: 1, titulo: 'Disponibilidade do perfil', status: 'ok', observacao: 'Perfil público ativo', atualizadoEm: nowISO() },
    { id: 2, titulo: 'Qualidade de atendimento', status: 'warning', observacao: 'Tempo de resposta acima da meta', atualizadoEm: nowISO() },
  ]);
  const [services, setServices] = useState<ServiceItem[]>([
    { id: 1, nome: 'Consultoria Inicial', descricao: 'Diagnóstico e plano de ação', preco: 250, ativo: true },
  ]);
  const [messages, setMessages] = useState<MessageItem[]>([
    { id: 1, assunto: 'Parceria comercial', destinatario: 'fornecedor@idebrasil.com', conteudo: 'Gostaríamos de agendar uma conversa.', status: 'enviada', atualizadoEm: nowISO() },
  ]);
  const [plans, setPlans] = useState<PlanItem[]>([
    { id: 1, nome: 'Plano Básico', ciclo: 'mensal', valor: 79.9, status: 'ativo', atualizadoEm: nowISO() },
  ]);

  const [monitoringDraft, setMonitoringDraft] = useState<Omit<MonitoringItem, 'id'>>({ titulo: '', status: 'ok', observacao: '', atualizadoEm: nowISO() });
  const [serviceDraft, setServiceDraft] = useState<Omit<ServiceItem, 'id'>>({ nome: '', descricao: '', preco: 0, ativo: true });
  const [messageDraft, setMessageDraft] = useState<Omit<MessageItem, 'id'>>({ assunto: '', destinatario: '', conteudo: '', status: 'rascunho', atualizadoEm: nowISO() });
  const [planDraft, setPlanDraft] = useState<Omit<PlanItem, 'id'>>({ nome: '', ciclo: 'mensal', valor: 0, status: 'ativo', atualizadoEm: nowISO() });

  const [editMonitoringId, setEditMonitoringId] = useState<number | null>(null);
  const [editServiceId, setEditServiceId] = useState<number | null>(null);
  const [editMessageId, setEditMessageId] = useState<number | null>(null);
  const [editPlanId, setEditPlanId] = useState<number | null>(null);

  const [openMonitoringDialog, setOpenMonitoringDialog] = useState(false);
  const [openServiceDialog, setOpenServiceDialog] = useState(false);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [openPlanDialog, setOpenPlanDialog] = useState(false);

  const monitoringStats = useMemo(() => {
    const ok = monitoringItems.filter((item) => item.status === 'ok').length;
    const warning = monitoringItems.filter((item) => item.status === 'warning').length;
    const critical = monitoringItems.filter((item) => item.status === 'critical').length;
    return { ok, warning, critical };
  }, [monitoringItems]);

  const formatDate = (iso: string) => new Date(iso).toLocaleString('pt-BR');

  const openMonitoringForm = (item?: MonitoringItem) => {
    if (item) {
      setEditMonitoringId(item.id);
      setMonitoringDraft({
        titulo: item.titulo,
        status: item.status,
        observacao: item.observacao,
        atualizadoEm: item.atualizadoEm,
      });
    } else {
      setEditMonitoringId(null);
      setMonitoringDraft({ titulo: '', status: 'ok', observacao: '', atualizadoEm: nowISO() });
    }
    setOpenMonitoringDialog(true);
  };

  const saveMonitoring = () => {
    const payload = { ...monitoringDraft, atualizadoEm: nowISO() };
    if (editMonitoringId) {
      setMonitoringItems((prev) => prev.map((item) => (item.id === editMonitoringId ? { ...item, ...payload } : item)));
    } else {
      setMonitoringItems((prev) => [...prev, { id: Date.now(), ...payload }]);
    }
    setOpenMonitoringDialog(false);
  };

  const openServiceForm = (item?: ServiceItem) => {
    if (item) {
      setEditServiceId(item.id);
      setServiceDraft({ nome: item.nome, descricao: item.descricao, preco: item.preco, ativo: item.ativo });
    } else {
      setEditServiceId(null);
      setServiceDraft({ nome: '', descricao: '', preco: 0, ativo: true });
    }
    setOpenServiceDialog(true);
  };

  const saveService = () => {
    if (editServiceId) {
      setServices((prev) => prev.map((item) => (item.id === editServiceId ? { ...item, ...serviceDraft } : item)));
    } else {
      setServices((prev) => [...prev, { id: Date.now(), ...serviceDraft }]);
    }
    setOpenServiceDialog(false);
  };

  const openMessageForm = (item?: MessageItem) => {
    if (item) {
      setEditMessageId(item.id);
      setMessageDraft({
        assunto: item.assunto,
        destinatario: item.destinatario,
        conteudo: item.conteudo,
        status: item.status,
        atualizadoEm: item.atualizadoEm,
      });
    } else {
      setEditMessageId(null);
      setMessageDraft({ assunto: '', destinatario: '', conteudo: '', status: 'rascunho', atualizadoEm: nowISO() });
    }
    setOpenMessageDialog(true);
  };

  const saveMessage = () => {
    const payload = { ...messageDraft, atualizadoEm: nowISO() };
    if (editMessageId) {
      setMessages((prev) => prev.map((item) => (item.id === editMessageId ? { ...item, ...payload } : item)));
    } else {
      setMessages((prev) => [...prev, { id: Date.now(), ...payload }]);
    }
    setOpenMessageDialog(false);
  };

  const openPlanForm = (item?: PlanItem) => {
    if (item) {
      setEditPlanId(item.id);
      setPlanDraft({
        nome: item.nome,
        ciclo: item.ciclo,
        valor: item.valor,
        status: item.status,
        atualizadoEm: item.atualizadoEm,
      });
    } else {
      setEditPlanId(null);
      setPlanDraft({ nome: '', ciclo: 'mensal', valor: 0, status: 'ativo', atualizadoEm: nowISO() });
    }
    setOpenPlanDialog(true);
  };

  const savePlan = () => {
    const payload = { ...planDraft, atualizadoEm: nowISO() };
    if (editPlanId) {
      setPlans((prev) => prev.map((item) => (item.id === editPlanId ? { ...item, ...payload } : item)));
    } else {
      setPlans((prev) => [...prev, { id: Date.now(), ...payload }]);
    }
    setOpenPlanDialog(false);
  };

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ px: 3, pt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#C23535' }}>
            Painel da Empresa
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestão de monitoramento, serviços, mensagens e planos de {companyName}.
          </Typography>
        </Box>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
          <Tab icon={<MonitorHeart />} iconPosition="start" label="Monitoramento" />
          <Tab icon={<MiscellaneousServices />} iconPosition="start" label="Serviços" />
          <Tab icon={<Message />} iconPosition="start" label="Mensagens" />
          <Tab icon={<WorkspacePremium />} iconPosition="start" label="Planos" />
        </Tabs>

        <TabPanel value={tab} index={0}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}><Alert severity="success">OK: {monitoringStats.ok}</Alert></Grid>
            <Grid item xs={12} md={4}><Alert severity="warning">Alertas: {monitoringStats.warning}</Alert></Grid>
            <Grid item xs={12} md={4}><Alert severity="error">Críticos: {monitoringStats.critical}</Alert></Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button variant="contained" startIcon={<Add />} onClick={() => openMonitoringForm()}>
              Novo Item
            </Button>
          </Box>
          <List>
            {monitoringItems.map((item) => (
              <ListItem key={item.id} divider>
                <ListItemText
                  primary={item.titulo}
                  secondary={`${item.observacao} • Atualizado em ${formatDate(item.atualizadoEm)}`}
                />
                <Chip
                  label={item.status.toUpperCase()}
                  color={item.status === 'ok' ? 'success' : item.status === 'warning' ? 'warning' : 'error'}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => openMonitoringForm(item)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => setMonitoringItems((prev) => prev.filter((m) => m.id !== item.id))}><Delete /></IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button variant="contained" startIcon={<Add />} onClick={() => openServiceForm()}>
              Novo Serviço
            </Button>
          </Box>
          <List>
            {services.map((service) => (
              <ListItem key={service.id} divider>
                <ListItemText
                  primary={`${service.nome} • R$ ${service.preco.toFixed(2)}`}
                  secondary={service.descricao}
                />
                <Chip label={service.ativo ? 'Ativo' : 'Inativo'} color={service.ativo ? 'success' : 'default'} size="small" sx={{ mr: 1 }} />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => openServiceForm(service)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => setServices((prev) => prev.filter((s) => s.id !== service.id))}><Delete /></IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button variant="contained" startIcon={<Add />} onClick={() => openMessageForm()}>
              Nova Mensagem
            </Button>
          </Box>
          <List>
            {messages.map((message) => (
              <ListItem key={message.id} divider>
                <ListItemText
                  primary={message.assunto}
                  secondary={`${message.destinatario} • ${message.conteudo} • ${formatDate(message.atualizadoEm)}`}
                />
                <Chip label={message.status} size="small" sx={{ mr: 1 }} />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => openMessageForm(message)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => setMessages((prev) => prev.filter((m) => m.id !== message.id))}><Delete /></IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tab} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button variant="contained" startIcon={<Add />} onClick={() => openPlanForm()}>
              Novo Plano
            </Button>
          </Box>
          <List>
            {plans.map((plan) => (
              <ListItem key={plan.id} divider>
                <ListItemText
                  primary={`${plan.nome} (${plan.ciclo}) • R$ ${plan.valor.toFixed(2)}`}
                  secondary={`Atualizado em ${formatDate(plan.atualizadoEm)}`}
                />
                <Chip label={plan.status} color={plan.status === 'ativo' ? 'success' : plan.status === 'pausado' ? 'warning' : 'default'} size="small" sx={{ mr: 1 }} />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => openPlanForm(plan)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => setPlans((prev) => prev.filter((p) => p.id !== plan.id))}><Delete /></IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </TabPanel>
      </CardContent>

      <Dialog open={openMonitoringDialog} onClose={() => setOpenMonitoringDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editMonitoringId ? 'Editar item' : 'Novo item de monitoramento'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField fullWidth label="Título" sx={{ mb: 2 }} value={monitoringDraft.titulo} onChange={(e) => setMonitoringDraft((prev) => ({ ...prev, titulo: e.target.value }))} />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={monitoringDraft.status} onChange={(e) => setMonitoringDraft((prev) => ({ ...prev, status: e.target.value as MonitoringStatus }))}>
              <MenuItem value="ok">OK</MenuItem>
              <MenuItem value="warning">Alerta</MenuItem>
              <MenuItem value="critical">Crítico</MenuItem>
            </Select>
          </FormControl>
          <TextField fullWidth multiline minRows={3} label="Observação" value={monitoringDraft.observacao} onChange={(e) => setMonitoringDraft((prev) => ({ ...prev, observacao: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMonitoringDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={saveMonitoring}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openServiceDialog} onClose={() => setOpenServiceDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editServiceId ? 'Editar serviço' : 'Novo serviço'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField fullWidth label="Nome" sx={{ mb: 2 }} value={serviceDraft.nome} onChange={(e) => setServiceDraft((prev) => ({ ...prev, nome: e.target.value }))} />
          <TextField fullWidth multiline minRows={3} label="Descrição" sx={{ mb: 2 }} value={serviceDraft.descricao} onChange={(e) => setServiceDraft((prev) => ({ ...prev, descricao: e.target.value }))} />
          <TextField fullWidth type="number" label="Preço" value={serviceDraft.preco} onChange={(e) => setServiceDraft((prev) => ({ ...prev, preco: Number(e.target.value) || 0 }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenServiceDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={saveService}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openMessageDialog} onClose={() => setOpenMessageDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editMessageId ? 'Editar mensagem' : 'Nova mensagem'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField fullWidth label="Assunto" sx={{ mb: 2 }} value={messageDraft.assunto} onChange={(e) => setMessageDraft((prev) => ({ ...prev, assunto: e.target.value }))} />
          <TextField fullWidth label="Destinatário" sx={{ mb: 2 }} value={messageDraft.destinatario} onChange={(e) => setMessageDraft((prev) => ({ ...prev, destinatario: e.target.value }))} />
          <TextField fullWidth multiline minRows={3} label="Conteúdo" value={messageDraft.conteudo} onChange={(e) => setMessageDraft((prev) => ({ ...prev, conteudo: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMessageDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={saveMessage}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openPlanDialog} onClose={() => setOpenPlanDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editPlanId ? 'Editar plano' : 'Novo plano'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField fullWidth label="Nome do plano" sx={{ mb: 2 }} value={planDraft.nome} onChange={(e) => setPlanDraft((prev) => ({ ...prev, nome: e.target.value }))} />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Ciclo</InputLabel>
            <Select label="Ciclo" value={planDraft.ciclo} onChange={(e) => setPlanDraft((prev) => ({ ...prev, ciclo: e.target.value as PlanItem['ciclo'] }))}>
              <MenuItem value="mensal">Mensal</MenuItem>
              <MenuItem value="trimestral">Trimestral</MenuItem>
              <MenuItem value="anual">Anual</MenuItem>
            </Select>
          </FormControl>
          <TextField fullWidth type="number" label="Valor" value={planDraft.valor} onChange={(e) => setPlanDraft((prev) => ({ ...prev, valor: Number(e.target.value) || 0 }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPlanDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={savePlan}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default CompanyProfilePanel;