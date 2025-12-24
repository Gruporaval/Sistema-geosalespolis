import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CloudSync as SyncIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Sync as RefreshIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

export default function IntegrationsPage() {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Integrações Externas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Conexões com sistemas externos e sincronização de dados
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<RefreshIcon />} size="large">
          Sincronizar Tudo
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Sistema Tributário
                </Typography>
                <Chip label="Ativo" color="success" size="small" />
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Sincronização com sistema de IPTU e taxas municipais
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Última sincronização"
                    secondary="24/12/2025 às 14:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SyncIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Registros sincronizados"
                    secondary="15.847 imóveis"
                  />
                </ListItem>
              </List>
              <Box mt={2} display="flex" gap={1}>
                <Button variant="outlined" startIcon={<RefreshIcon />} size="small" fullWidth>
                  Sincronizar
                </Button>
                <Button variant="outlined" startIcon={<SettingsIcon />} size="small" fullWidth>
                  Configurar
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Geosampa
                </Typography>
                <Chip label="Ativo" color="success" size="small" />
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Integração com base cartográfica do município
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Última sincronização"
                    secondary="24/12/2025 às 13:45"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SyncIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Camadas atualizadas"
                    secondary="12 layers GIS"
                  />
                </ListItem>
              </List>
              <Box mt={2} display="flex" gap={1}>
                <Button variant="outlined" startIcon={<RefreshIcon />} size="small" fullWidth>
                  Sincronizar
                </Button>
                <Button variant="outlined" startIcon={<SettingsIcon />} size="small" fullWidth>
                  Configurar
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Portal Cidadão
                </Typography>
                <Chip label="Inativo" color="default" size="small" />
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Portal de serviços online para cidadãos
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <ErrorIcon color="disabled" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Última sincronização"
                    secondary="Nunca sincronizado"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SyncIcon color="disabled" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Status"
                    secondary="Aguardando configuração"
                  />
                </ListItem>
              </List>
              <Box mt={2} display="flex" gap={1}>
                <Button variant="outlined" disabled startIcon={<RefreshIcon />} size="small" fullWidth>
                  Sincronizar
                </Button>
                <Button variant="outlined" startIcon={<SettingsIcon />} size="small" fullWidth>
                  Configurar
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Receita Federal
                </Typography>
                <Chip label="Ativo" color="success" size="small" />
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Consulta de CNPJs e dados empresariais
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Última consulta"
                    secondary="24/12/2025 às 14:20"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SyncIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Consultas hoje"
                    secondary="47 consultas"
                  />
                </ListItem>
              </List>
              <Box mt={2} display="flex" gap={1}>
                <Button variant="outlined" startIcon={<RefreshIcon />} size="small" fullWidth>
                  Testar
                </Button>
                <Button variant="outlined" startIcon={<SettingsIcon />} size="small" fullWidth>
                  Configurar
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Correios (CEP)
                </Typography>
                <Chip label="Ativo" color="success" size="small" />
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Validação e consulta de CEPs
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Última consulta"
                    secondary="24/12/2025 às 14:35"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SyncIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Consultas hoje"
                    secondary="123 consultas"
                  />
                </ListItem>
              </List>
              <Box mt={2} display="flex" gap={1}>
                <Button variant="outlined" startIcon={<RefreshIcon />} size="small" fullWidth>
                  Testar
                </Button>
                <Button variant="outlined" startIcon={<SettingsIcon />} size="small" fullWidth>
                  Configurar
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Google Maps API
                </Typography>
                <Chip label="Ativo" color="success" size="small" />
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Geocodificação e mapas interativos
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Status"
                    secondary="Operacional"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SyncIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Requisições hoje"
                    secondary="2.456 requests"
                  />
                </ListItem>
              </List>
              <Box mt={2} display="flex" gap={1}>
                <Button variant="outlined" startIcon={<RefreshIcon />} size="small" fullWidth>
                  Testar
                </Button>
                <Button variant="outlined" startIcon={<SettingsIcon />} size="small" fullWidth>
                  Configurar
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
