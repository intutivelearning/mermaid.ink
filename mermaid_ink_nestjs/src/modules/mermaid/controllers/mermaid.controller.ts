import {
  Controller,
  Get,
  Header,
  HttpException,
  HttpStatus,
  Param,
  Query,
  Res
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { OEmbedResponseDto } from '../dto/oembed-response.dto';
import { MermaidRendererService } from '../services/mermaid-renderer.service';

@ApiTags('mermaid')
@Controller('mermaid')
export class MermaidController {
  constructor(private readonly mermaidService: MermaidRendererService) {}

  @Get('img/:encodedDiagram')
  @ApiOperation({ summary: 'Render Mermaid diagram as PNG using base64-encoded diagram in URL' })
  @ApiParam({ name: 'encodedDiagram', description: 'Base64-encoded Mermaid diagram code' })
  @ApiQuery({ name: 'theme', description: 'Diagram theme', required: false, enum: ['default', 'dark', 'forest', 'neutral'] })
  @ApiQuery({ name: 'backgroundColor', description: 'Background color', required: false })
  @ApiQuery({ name: 'width', description: 'Width in pixels', required: false, type: Number })
  @ApiQuery({ name: 'height', description: 'Height in pixels', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns the rendered PNG image' })
  @ApiResponse({ status: 500, description: 'Server error while rendering PNG' })
  async renderImageFromBase64(
    @Param('encodedDiagram') encodedDiagram: string,
    @Res() res: Response,
    @Query('theme') theme: string = 'default',
    @Query('backgroundColor') backgroundColor: string = 'white',
    @Query('width') width?: number,
    @Query('height') height?: number,
  ): Promise<void> {
    try {
      // Decode the base64-encoded diagram
      const code = Buffer.from(encodedDiagram, 'base64').toString('utf-8');
      
      const buffer = await this.mermaidService.renderPng({
        code,
        theme,
        backgroundColor,
        width: width ? parseInt(width.toString(), 10) : undefined,
        height: height ? parseInt(height.toString(), 10) : undefined,
      });
      
      res.set({
        'Content-Type': 'image/png',
        'Content-Length': buffer.length,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      });
      
      res.send(buffer);
    } catch (error) {
      throw new HttpException(
        `Failed to render PNG from base64: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('svg/:encodedDiagram')
  @Header('Content-Type', 'image/svg+xml')
  @ApiOperation({ summary: 'Render Mermaid diagram as SVG using base64-encoded diagram in URL' })
  @ApiParam({ name: 'encodedDiagram', description: 'Base64-encoded Mermaid diagram code' })
  @ApiQuery({ name: 'theme', description: 'Diagram theme', required: false, enum: ['default', 'dark', 'forest', 'neutral'] })
  @ApiQuery({ name: 'backgroundColor', description: 'Background color', required: false })
  @ApiResponse({ status: 200, description: 'Returns the rendered SVG' })
  @ApiResponse({ status: 500, description: 'Server error while rendering SVG' })
  async renderSvgFromBase64(
    @Param('encodedDiagram') encodedDiagram: string,
    @Res() res: Response,
    @Query('theme') theme: string = 'default',
    @Query('backgroundColor') backgroundColor: string = 'white',
  ): Promise<void> {
    try {
      // Decode the base64-encoded diagram
      const code = Buffer.from(encodedDiagram, 'base64').toString('utf-8');
      
      const svg = await this.mermaidService.renderSvg({
        code,
        theme,
        backgroundColor,
      });
      
      res.set({
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      });
      
      res.send(svg);
    } catch (error) {
      throw new HttpException(
        `Failed to render SVG from base64: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('pdf/:encodedDiagram')
  @Header('Content-Type', 'application/pdf')
  @ApiOperation({ summary: 'Render Mermaid diagram as PDF using base64-encoded diagram in URL' })
  @ApiParam({ name: 'encodedDiagram', description: 'Base64-encoded Mermaid diagram code', required: true })
  @ApiQuery({ name: 'theme', description: 'Diagram theme', required: false, enum: ['default', 'dark', 'forest', 'neutral'] })
  @ApiQuery({ name: 'backgroundColor', description: 'Background color', required: false })
  @ApiQuery({ name: 'width', description: 'Width in pixels', required: false, type: Number })
  @ApiQuery({ name: 'height', description: 'Height in pixels', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns the rendered PDF document' })
  @ApiResponse({ status: 500, description: 'Server error while rendering PDF' })
  async renderPdfFromBase64(
    @Param('encodedDiagram') encodedDiagram: string,
    @Res() res: Response,
    @Query('theme') theme: string = 'default',
    @Query('backgroundColor') backgroundColor: string = 'white',
    @Query('width') width?: number,
    @Query('height') height?: number,
  ): Promise<void> {
    try {
      // Decode the base64-encoded diagram
      const code = Buffer.from(encodedDiagram, 'base64').toString('utf-8');
      
      const buffer = await this.mermaidService.renderPdf({
        code,
        theme,
        backgroundColor,
        width: width ? parseInt(width.toString(), 10) : undefined,
        height: height ? parseInt(height.toString(), 10) : undefined,
      });
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Length': buffer.length,
        'Content-Disposition': 'inline; filename=diagram.pdf',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      });
      
      res.send(buffer);
    } catch (error) {
      throw new HttpException(
        `Failed to render PDF from base64: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('services/oembed')
  @ApiOperation({ summary: 'oEmbed service for Mermaid diagrams' })
  @ApiQuery({ name: 'url', description: 'URL to the Mermaid diagram', required: true })
  @ApiQuery({ name: 'format', description: 'Response format (only json is supported)', required: false, default: 'json' })
  @ApiQuery({ name: 'maxwidth', description: 'Maximum width of the embedded resource', required: false, type: Number })
  @ApiQuery({ name: 'maxheight', description: 'Maximum height of the embedded resource', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'oEmbed JSON response', type: OEmbedResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - invalid parameters' })
  @ApiResponse({ status: 404, description: 'Not found - URL not supported' })
  @ApiResponse({ status: 501, description: 'Not implemented - requested format not supported' })
  async getOEmbed(
    @Query('url') url: string,
    @Res({ passthrough: true }) res: Response,
    @Query('format') format: string = 'json',
    @Query('maxwidth') maxwidth?: number,
    @Query('maxheight') maxheight?: number,
  ): Promise<OEmbedResponseDto> {
    // Check if format is supported
    if (format && format !== 'json') {
      throw new HttpException(
        'The requested format is not supported. Only json is supported.',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    // Parse the URL to extract the encoded diagram
    let encodedDiagram: string;
    let imgUrl: string;
    
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // Handle different URL formats
      // 1. "/img/BASE64" format
      const imgMatch = pathname.match(/\/img\/([A-Za-z0-9+/=]+)/);
      // 2. "/svg/BASE64" format
      const svgMatch = pathname.match(/\/svg\/([A-Za-z0-9+/=]+)/);
      // 3. "/pdf/BASE64" format
      const pdfMatch = pathname.match(/\/pdf\/([A-Za-z0-9+/=]+)/);
      
      if (imgMatch && imgMatch[1]) {
        encodedDiagram = imgMatch[1];
        imgUrl = `${urlObj.protocol}//${urlObj.host}/mermaid/img/${encodedDiagram}`;
      } else if (svgMatch && svgMatch[1]) {
        encodedDiagram = svgMatch[1];
        imgUrl = `${urlObj.protocol}//${urlObj.host}/mermaid/img/${encodedDiagram}`;
      } else if (pdfMatch && pdfMatch[1]) {
        encodedDiagram = pdfMatch[1];
        imgUrl = `${urlObj.protocol}//${urlObj.host}/mermaid/img/${encodedDiagram}`;
      } else {
        throw new Error('Invalid URL format');
      }
      
      // Extract query parameters if present
      const theme = urlObj.searchParams.get('theme') || 'default';
      const backgroundColor = urlObj.searchParams.get('backgroundColor') || 'white';
      
      if (theme) imgUrl += `?theme=${theme}`;
      if (backgroundColor) imgUrl += (theme ? '&' : '?') + `backgroundColor=${backgroundColor}`;
      
    } catch (error) {
      throw new HttpException(
        `Invalid URL: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Default width and height if not specified
    const width = maxwidth || 800;
    const height = maxheight || 600;

    // Return oEmbed response
    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    });

    return {
      type: 'photo',
      version: '1.0',
      width,
      height,
      url: imgUrl,
    };
  }
}