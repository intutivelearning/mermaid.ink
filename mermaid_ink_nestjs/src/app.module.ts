import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MermaidModule } from './modules/mermaid/mermaid.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'node_modules', 'mermaid', 'dist'),
      serveRoot: '/assets/mermaid',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'node_modules', '@fortawesome', 'fontawesome-free', 'css'),
      serveRoot: '/assets/fontawesome',
    }),
    MermaidModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
