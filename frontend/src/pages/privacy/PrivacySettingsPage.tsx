import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  FormControlLabel,
  Switch,
  Slider,
  Alert,
} from '@mui/material';
import { Save as SaveIcon, Security as SecurityIcon } from '@mui/icons-material';

export default function PrivacySettingsPage() {
  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Configurações de Privacidade Diferencial
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Parâmetros do sistema de privacidade diferencial (LGPD Art. 12)
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Orçamento de Privacidade
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Configure os parâmetros ε (epsilon) e δ (delta) para controlar o nível de privacidade
            </Typography>

            <Box mb={4}>
              <Typography variant="subtitle2" gutterBottom>
                Epsilon (ε) - Nível de Privacidade
              </Typography>
              <Slider
                defaultValue={0.5}
                min={0.1}
                max={2.0}
                step={0.1}
                marks={[
                  { value: 0.1, label: '0.1 (Alto)' },
                  { value: 0.5, label: '0.5' },
                  { value: 1.0, label: '1.0' },
                  { value: 2.0, label: '2.0 (Baixo)' },
                ]}
                valueLabelDisplay="on"
              />
              <Typography variant="caption" color="text.secondary">
                Quanto menor o epsilon, maior a privacidade (mais ruído adicionado)
              </Typography>
            </Box>

            <Box mb={4}>
              <Typography variant="subtitle2" gutterBottom>
                Delta (δ) - Probabilidade de Falha
              </Typography>
              <TextField
                fullWidth
                defaultValue="0.00001"
                label="Delta (δ)"
                helperText="Valor típico: 10⁻⁵ (0.00001)"
                type="number"
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight={600} gutterBottom>
              Mecanismos de Ruído
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Escolha o mecanismo de adição de ruído para anonimização
            </Typography>

            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Mecanismo Laplaciano"
            />
            <Typography variant="caption" display="block" color="text.secondary" mb={2}>
              Adiciona ruído seguindo distribuição de Laplace (recomendado para dados numéricos)
            </Typography>

            <FormControlLabel
              control={<Switch />}
              label="Mecanismo Gaussiano"
            />
            <Typography variant="caption" display="block" color="text.secondary" mb={2}>
              Adiciona ruído seguindo distribuição Gaussiana (requer epsilon maior)
            </Typography>

            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Supressão de Células Pequenas"
            />
            <Typography variant="caption" display="block" color="text.secondary" mb={2}>
              Oculta agregações com menos de 5 registros
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight={600} gutterBottom>
              Sensibilidade de Consultas
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Define a sensibilidade máxima para diferentes tipos de consulta
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contagem"
                  defaultValue="1"
                  type="number"
                  helperText="Sensibilidade para COUNT"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Soma"
                  defaultValue="1000000"
                  type="number"
                  helperText="Sensibilidade para SUM"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Média"
                  defaultValue="100000"
                  type="number"
                  helperText="Sensibilidade para AVG"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Máximo/Mínimo"
                  defaultValue="10000000"
                  type="number"
                  helperText="Sensibilidade para MAX/MIN"
                />
              </Grid>
            </Grid>

            <Box mt={3}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                size="large"
                fullWidth
              >
                Salvar Configurações
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: 'primary.light', mb: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <SecurityIcon />
              <Typography variant="h6" fontWeight={600}>
                Status Atual
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Epsilon (ε)
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                0.5
              </Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Delta (δ)
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                10⁻⁵
              </Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Mecanismo
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                Laplaciano
              </Typography>
            </Box>
            <Alert severity="success" sx={{ mt: 2 }}>
              Nível Alto de Privacidade
            </Alert>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Referências
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • LGPD Art. 12 - Anonimização
              <br />
              • NIST SP 800-188
              <br />
              • Dwork & Roth (2014)
              <br />
              • ISO/IEC 20889:2018
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
