import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'transparent', // SEM background
      }}
    >
      <Outlet />
    </Box>
  );
}
