import { Box, Container, Typography, Button } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" sx={{ fontSize: '120px', fontWeight: 700, color: 'primary.main' }}>
          404
        </Typography>
        <Typography variant="h4" gutterBottom>
          Página Não Encontrada
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          A página que você está procurando não existe ou foi movida.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/dashboard')}
        >
          Voltar para o Dashboard
        </Button>
      </Box>
    </Container>
  );
}
