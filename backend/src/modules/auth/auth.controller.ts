import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

interface LoginDto {
  email: string;
  password: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @Post('login')
  @ApiOperation({ summary: 'Login com email e senha' })
  async login(@Body() loginDto: LoginDto) {
    // Mock login - aceita qualquer credencial
    if (loginDto.email && loginDto.password) {
      return {
        accessToken: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        user: {
          id: '1',
          email: loginDto.email,
          name: 'Usuário Admin',
          role: {
            id: '1',
            name: 'Administrador',
            permissions: [
              { id: '1', code: 'properties:read', name: 'Ver imóveis' },
              { id: '2', code: 'properties:write', name: 'Editar imóveis' },
              { id: '3', code: 'dashboard:read', name: 'Ver dashboard' },
            ],
          },
        },
      };
    }
    
    throw new Error('Credenciais inválidas');
  }

  @Get('me')
  @ApiOperation({ summary: 'Obter usuário atual' })
  async getCurrentUser() {
    return {
      id: '1',
      email: 'admin@salesopolis.sp.gov.br',
      name: 'Usuário Admin',
      role: {
        id: '1',
        name: 'Administrador',
      },
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renovar token' })
  async refresh() {
    return {
      accessToken: 'mock-jwt-token-refreshed-' + Date.now(),
      refreshToken: 'mock-refresh-token-refreshed-' + Date.now(),
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout' })
  async logout() {
    return { message: 'Logout realizado com sucesso' };
  }
}
