import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  @Get('kpis')
  @ApiOperation({ summary: 'Get dashboard KPIs' })
  async getKpis() {
    return {
      totalProperties: 1847,
      propertiesPending: 156,
      averageProcessingTime: 3.5,
      completionRate: 91.6,
    };
  }

  @Get('properties-by-type')
  @ApiOperation({ summary: 'Get properties grouped by type' })
  async getPropertiesByType() {
    return {
      RESIDENTIAL: 1245,
      COMMERCIAL: 312,
      INDUSTRIAL: 89,
      RURAL: 156,
      MIXED: 34,
      VACANT: 11,
    };
  }

  @Get('properties-by-district')
  @ApiOperation({ summary: 'Get properties grouped by district' })
  async getPropertiesByDistrict() {
    return {
      'Centro': 523,
      'Jardim Esperança': 312,
      'Vila Nova': 289,
      'Distrito Industrial': 156,
      'Outros': 567,
    };
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get recent activity log' })
  async getRecentActivity() {
    return [
      {
        id: '1',
        type: 'property_created',
        description: 'Novo imóvel IM-2025-234 cadastrado',
        user: 'João Silva',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'property_updated',
        description: 'Imóvel IM-2025-112 atualizado',
        user: 'Maria Santos',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
  }
}
