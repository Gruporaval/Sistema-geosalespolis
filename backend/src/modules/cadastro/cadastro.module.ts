import { Module } from '@nestjs/common';
import { PropertiesController } from './cadastro.controller';

@Module({
  controllers: [PropertiesController],
})
export class CadastroModule {}
