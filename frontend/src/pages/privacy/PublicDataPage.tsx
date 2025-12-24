import { Box, Typography, Paper, Grid, Card, CardContent, Button, Chip } from '@mui/material';
import {
  Download as DownloadIcon,
  Security as SecurityIcon,
  BarChart as ChartIcon,
  Public as PublicIcon,
} from '@mui/icons-material';

export default function PublicDataPage() {
  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Dados Públicos com Privacidade Diferencial
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Consulta a dados agregados e anonimizados segundo técnicas de privacidade diferencial (LGPD Art. 12)
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <SecurityIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    ε (Epsilon)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Orçamento de Privacidade
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h4" color="primary" fontWeight={600}>
                0.5
              </Typography>
              <Chip label="Nível Alto de Privacidade" color="success" size="small" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <ChartIcon color="secondary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Datasets
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Conjuntos Disponíveis
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h4" color="secondary" fontWeight={600}>
                12
              </Typography>
              <Chip label="Dados Agregados" color="info" size="small" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <PublicIcon color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Consultas
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Realizadas Hoje
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h4" color="success.main" fontWeight={600}>
                247
              </Typography>
              <Chip label="Portal Aberto" color="success" size="small" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Datasets Disponíveis para Consulta
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Dados anonimizados com ruído laplaciano (ε=0.5, δ=10⁻⁵)
            </Typography>

            <Grid container spacing={2}>
              {[
                { title: 'Imóveis por Tipo', records: '15.847', category: 'Cadastro' },
                { title: 'Distribuição por Bairro', records: '23.456', category: 'GIS' },
                { title: 'Evolução Temporal', records: '8.912', category: 'Histórico' },
                { title: 'Valor Médio por Região', records: '12.334', category: 'Econômico' },
                { title: 'Densidade Demográfica', records: '45.678', category: 'População' },
                { title: 'Uso do Solo', records: '18.234', category: 'Planejamento' },
              ].map((dataset, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {dataset.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dataset.records} registros agregados
                        </Typography>
                        <Box mt={1}>
                          <Chip label={dataset.category} size="small" />
                        </Box>
                      </Box>
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        size="small"
                      >
                        Exportar
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: 'info.light' }}>
            <Box display="flex" gap={2}>
              <SecurityIcon color="primary" />
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Conformidade LGPD
                </Typography>
                <Typography variant="body2">
                  Todos os dados disponibilizados passam por algoritmos de privacidade diferencial, 
                  impedindo a reidentificação de indivíduos e garantindo conformidade com o Art. 12 da 
                  Lei nº 13.709/2018 (LGPD). O orçamento de privacidade (ε) está configurado para nível alto.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
