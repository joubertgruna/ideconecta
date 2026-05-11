import React from 'react';
import {
  AppBar, Toolbar, Button, Box, Menu, MenuItem,
  IconButton, Avatar, Drawer, List, ListItem, ListItemButton,
  ListItemText, Divider, Typography
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AccountCircle, Business, AdminPanelSettings, Menu as MenuIcon, Close } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    setDrawerOpen(false);
    navigate('/');
  };

  const handleProfile = () => {
    handleClose();
    setDrawerOpen(false);
    navigate('/perfil');
  };

  const getUserIcon = () => {
    switch (state.user?.tipo) {
      case 'admin':
        return <AdminPanelSettings />;
      case 'empresa':
        return (
          <Avatar
            src={state.user?.logo_url || undefined}
            sx={{ width: 28, height: 28, bgcolor: '#C23535' }}
          >
            <Business fontSize="small" />
          </Avatar>
        );
      default:
        return <AccountCircle />;
    }
  };

  const getUserTypeLabel = () => {
    switch (state.user?.tipo) {
      case 'admin': return 'Admin';
      case 'empresa': return 'Empresa';
      default: return 'Usuário';
    }
  };

  const mobileDrawer = (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      PaperProps={{ sx: { width: 270 } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
        <Box component="img" src="/logo.png" alt="IDEBRASIL" sx={{ height: 30, objectFit: 'contain' }} />
        <IconButton onClick={() => setDrawerOpen(false)}>
          <Close />
        </IconButton>
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/busca" onClick={() => setDrawerOpen(false)}>
            <ListItemText primary="Buscar Empresas" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/empresa/cadastro" onClick={() => setDrawerOpen(false)}>
            <ListItemText primary="Cadastrar Empresa" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        </ListItem>

        {state.isAuthenticated ? (
          <>
            <Divider sx={{ my: 1 }} />
            {state.user?.tipo === 'admin' && (
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/admin" onClick={() => setDrawerOpen(false)}>
                  <ListItemText primary="Painel Admin" primaryTypographyProps={{ fontWeight: 600, color: '#C23535' }} />
                </ListItemButton>
              </ListItem>
            )}
            <ListItem disablePadding>
              <ListItemButton onClick={handleProfile}>
                <ListItemText primary="Meu Perfil" primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary="Sair" primaryTypographyProps={{ color: '#C23535', fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem sx={{ px: 2, pt: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                component={Link}
                to="/login"
                onClick={() => setDrawerOpen(false)}
                sx={{ fontWeight: 600, borderColor: '#2C2C2C', color: '#2C2C2C', mb: 1 }}
              >
                Entrar
              </Button>
            </ListItem>
            <ListItem sx={{ px: 2 }}>
              <Button
                fullWidth
                variant="contained"
                component={Link}
                to="/registro"
                onClick={() => setDrawerOpen(false)}
                sx={{ fontWeight: 600, bgcolor: '#C23535', color: '#fff', '&:hover': { bgcolor: '#A52A2A' } }}
              >
                Cadastrar
              </Button>
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  );

  return (
    <AppBar position="static" color="primary" elevation={0} sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
      <Toolbar>
        {/* Logo */}
        <Box
          component={Link}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, textDecoration: 'none' }}
        >
          <Box component="img" src="/logo.png" alt="IDEBRASIL" sx={{ height: 36, objectFit: 'contain' }} />
        </Box>

        {/* Desktop menu */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
          <Button color="inherit" component={Link} to="/busca"
            sx={{ fontWeight: 600, color: '#2C2C2C', '&:hover': { color: '#C23535' } }}>
            Buscar Empresas
          </Button>
          <Button color="inherit" component={Link} to="/empresa/cadastro"
            sx={{ fontWeight: 600, color: '#2C2C2C', '&:hover': { color: '#C23535' } }}>
            Cadastrar Empresa
          </Button>

          {state.isAuthenticated ? (
            <>
              {state.user?.tipo === 'admin' && (
                <Button variant="contained" component={Link} to="/admin"
                  sx={{ fontWeight: 600, backgroundColor: '#C23535', color: '#ffffff', '&:hover': { backgroundColor: '#A52A2A' } }}>
                  Admin
                </Button>
              )}
              <IconButton size="large" onClick={handleMenu} sx={{ color: '#2C2C2C' }}>
                {getUserIcon()}
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    {getUserTypeLabel()}: {state.user?.nome}
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleProfile}>Meu Perfil</MenuItem>
                <MenuItem onClick={handleLogout}>Sair</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login"
                sx={{ fontWeight: 600, color: '#2C2C2C', '&:hover': { color: '#C23535' } }}>
                Entrar
              </Button>
              <Button variant="contained" component={Link} to="/registro"
                sx={{ fontWeight: 600, backgroundColor: '#C23535', color: '#ffffff', '&:hover': { backgroundColor: '#A52A2A' } }}>
                Cadastrar
              </Button>
            </>
          )}
        </Box>

        {/* Mobile: hamburger */}
        <IconButton
          sx={{ display: { xs: 'flex', md: 'none' }, color: '#2C2C2C' }}
          onClick={() => setDrawerOpen(true)}
          aria-label="abrir menu"
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      {mobileDrawer}
    </AppBar>
  );
};

export default Header;
