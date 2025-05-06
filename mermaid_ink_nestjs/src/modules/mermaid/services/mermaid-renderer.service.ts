import { Injectable, Logger } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import * as puppeteer from 'puppeteer';
import { MermaidDiagramDto } from '../dto/mermaid-diagram.dto';

// Add type declaration for window.renderMermaid
declare global {
  interface Window {
    renderMermaid: () => Promise<string | boolean>;
    App: {
      render: (definition: string, config: any, bgColor: string, size: any) => Promise<void>;
    };
  }
}

@Injectable()
export class MermaidRendererService {
  private readonly logger = new Logger(MermaidRendererService.name);
  private browser: puppeteer.Browser;

  async onModuleInit() {
    try {
      this.browser = await puppeteer.launch({
        headless: true, // Changed from 'new' to true
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      this.logger.log('Browser initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize browser: ${error.message}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
      this.logger.log('Browser closed successfully');
    }
  }

  async renderSvg(diagramDto: MermaidDiagramDto): Promise<string> {
    const { code, theme = 'default', backgroundColor = 'white' } = diagramDto;
    try {
      const page = await this.browser.newPage();
      // Load the static mermaid.html file served from public
      await page.goto('http://localhost:3000/mermaid.html');
      // Call the render function defined in mermaid.mjs
      const svg = await page.evaluate(
        async (definition, theme, backgroundColor) => {
          if (!window.App || !window.App.render) {
            throw new Error('window.App.render is not defined');
          }
          // Call the render function and return the SVG
          await window.App.render(definition, { theme }, backgroundColor, {});
          const container = document.getElementById('container');
          if (!container) throw new Error('Container element not found');
          const svgElement = container.querySelector('svg');
          if (!svgElement) throw new Error('SVG element not found');
          return svgElement.outerHTML;
        },
        code,
        theme,
        backgroundColor
      );
      await page.close();
      return svg;
    } catch (error) {
      this.logger.error(`Failed to render SVG: ${error.message}`);
      throw error;
    }
  }

  async renderPng(diagramDto: MermaidDiagramDto): Promise<Buffer> {
    const { code, theme = 'default', backgroundColor = 'white', width, height } = diagramDto;
    try {
      const page = await this.browser.newPage();
      // Load the static mermaid.html file served from public
      await page.goto('http://localhost:3000/mermaid.html');
      // Call the render function defined in mermaid.mjs
      await page.evaluate(
        async (definition, theme, backgroundColor, width, height) => {
          if (!window.App || !window.App.render) {
            throw new Error('window.App.render is not defined');
          }
          const size: { width?: number; height?: number } = {};
          if (width) size.width = width;
          if (height) size.height = height;
          await window.App.render(definition, { theme }, backgroundColor, size);
        },
        code,
        theme,
        backgroundColor,
        width,
        height
      );
      // Set viewport if width/height provided
      if (width && height) {
        await page.setViewport({ width, height });
      }
      // Wait for the SVG to be inserted into the DOM
      await page.waitForSelector('#container svg');
      // Get the diagram element with null check
      const element = await page.$('#container svg');
      if (!element) {
        throw new Error('SVG element not found');
      }
      // Take a screenshot
      const screenshot = await element.screenshot({
        omitBackground: backgroundColor === 'transparent',
        type: 'png',
      });
      await page.close();
      // Convert Uint8Array to Buffer
      return Buffer.from(screenshot);
    } catch (error) {
      this.logger.error(`Failed to render PNG: ${error.message}`);
      throw error;
    }
  }

  async renderPdf(diagramDto: MermaidDiagramDto): Promise<Buffer> {
    try {
      // First render the diagram as PNG
      const pngBuffer = await this.renderPng(diagramDto);
      
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Calculate dimensions based on image or default to A4
      let width = diagramDto.width || 595; // Default A4 width in points
      let height = diagramDto.height || 842; // Default A4 height in points
      
      // Embed the PNG image in the PDF
      const pngImage = await pdfDoc.embedPng(pngBuffer);
      const imageDims = pngImage.scale(1);
      
      // Use image dimensions if width and height not specified
      if (!diagramDto.width && !diagramDto.height) {
        width = imageDims.width;
        height = imageDims.height;
      }
      
      // Add a page with the dimensions
      const page = pdfDoc.addPage([width, height]);
      
      // Draw the image onto the page (centered)
      page.drawImage(pngImage, {
        x: (width - imageDims.width) / 2,
        y: (height - imageDims.height) / 2,
        width: imageDims.width,
        height: imageDims.height,
      });
      
      // Serialize the PDF to bytes
      const pdfBytes = await pdfDoc.save();
      
      return Buffer.from(pdfBytes);
    } catch (error) {
      this.logger.error(`Failed to render PDF: ${error.message}`);
      throw error;
    }
  }
}