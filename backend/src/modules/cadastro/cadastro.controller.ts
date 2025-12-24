import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Cadastro')
@Controller('cadastro/properties')
export class PropertiesController {
  @Get()
  @ApiOperation({ summary: 'List properties with pagination' })
  async findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const mockProperties = [
      {
        id: '1',
        code: 'IM-2025-001',
        type: 'RESIDENTIAL',
        status: 'ACTIVE',
        landArea: 450.5,
        builtArea: 180.3,
        ownerName: 'João Silva Santos',
        ownerDocument: '12345678901',
        address: 'Rua das Flores, 123',
        district: 'Centro',
        city: 'Salesópolis',
        state: 'SP',
        zipCode: '08970-000',
        latitude: -23.5305,
        longitude: -45.8474,
        createdAt: '2025-01-15T10:30:00Z',
        updatedAt: '2025-12-20T14:22:00Z',
      },
      {
        id: '2',
        code: 'IM-2025-002',
        type: 'COMMERCIAL',
        status: 'ACTIVE',
        landArea: 850.0,
        builtArea: 420.0,
        ownerName: 'Maria Oliveira Costa',
        ownerDocument: '98765432109',
        address: 'Av. Principal, 456',
        district: 'Centro',
        city: 'Salesópolis',
        state: 'SP',
        zipCode: '08970-000',
        latitude: -23.5315,
        longitude: -45.8484,
        createdAt: '2025-02-10T09:15:00Z',
        updatedAt: '2025-12-18T11:45:00Z',
      },
      {
        id: '3',
        code: 'IM-2025-003',
        type: 'INDUSTRIAL',
        status: 'PENDING',
        landArea: 2500.0,
        builtArea: 1200.0,
        ownerName: 'Empresa XYZ Ltda',
        ownerDocument: '12345678000190',
        address: 'Rodovia SP-088, Km 15',
        district: 'Distrito Industrial',
        city: 'Salesópolis',
        state: 'SP',
        zipCode: '08970-000',
        latitude: -23.5405,
        longitude: -45.8574,
        createdAt: '2025-03-05T15:20:00Z',
        updatedAt: '2025-12-22T16:30:00Z',
      },
    ];

    return {
      data: mockProperties,
      meta: {
        total: mockProperties.length,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(mockProperties.length / Number(pageSize)),
      },
    };
  }
}
