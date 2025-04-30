import { Module } from '@nestjs/common';
import { MermaidController } from './controllers/mermaid.controller';
import { MermaidRendererService } from './services/mermaid-renderer.service';

@Module({
  controllers: [MermaidController],
  providers: [MermaidRendererService],
  exports: [MermaidRendererService],
})
export class MermaidModule {}