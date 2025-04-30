import { Injectable, Logger } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import * as puppeteer from 'puppeteer';
import { MermaidDiagramDto } from '../dto/mermaid-diagram.dto';

// Add type declaration for window.renderMermaid
declare global {
  interface Window {
    renderMermaid: () => Promise<string | boolean>;
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
      
      // Set HTML content with the Mermaid script
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <head>
            <script type="module">
              import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
              
              mermaid.initialize({
                startOnLoad: true,
                theme: '${theme}',
                backgroundColor: '${backgroundColor}'
              });
              
              window.renderMermaid = async function() {
                try {
                  const { svg } = await mermaid.render('mermaid-container', \`${code.replace(/`/g, '\\`')}\`);
                  return svg;
                } catch (error) {
                  console.error('Mermaid rendering error:', error);
                  return 'Error: ' + error.message;
                }
              };
            </script>
          </head>
          <body style="margin:0; padding:0; background: ${backgroundColor};">
            <div id="mermaid-container"></div>
          </body>
        </html>
      `);
      
      // Execute the renderMermaid function and get the SVG
      const svg = await page.evaluate(() => {
        return window.renderMermaid();
      }) as string; // Cast to string
      
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
      
      if (width && height) {
        await page.setViewport({ width, height });
      }
      
      // Set HTML content with the Mermaid script
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <head>
            <script type="module">
              import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
              
              mermaid.initialize({
                startOnLoad: true,
                theme: '${theme}',
                backgroundColor: '${backgroundColor}'
              });
              
              window.renderMermaid = async function() {
                try {
                  const { svg } = await mermaid.render('mermaid-container', \`${code.replace(/`/g, '\\`')}\`);
                  document.getElementById('mermaid-output').innerHTML = svg;
                  return true;
                } catch (error) {
                  console.error('Mermaid rendering error:', error);
                  return false;
                }
              };
            </script>
          </head>
          <body style="margin:0; padding:0; background: ${backgroundColor};">
            <div id="mermaid-container" style="display:none;"></div>
            <div id="mermaid-output"></div>
          </body>
        </html>
      `);
      
      // Execute the renderMermaid function
      const success = await page.evaluate(() => {
        return window.renderMermaid();
      }) as boolean; // Cast to boolean
      
      if (!success) {
        throw new Error('Failed to render Mermaid diagram');
      }
      
      // Wait for the SVG to be inserted into the DOM
      await page.waitForSelector('#mermaid-output svg');
      
      // Get the diagram element with null check
      const element = await page.$('#mermaid-output svg');
      if (!element) {
        throw new Error('SVG element not found');
      }
      
      // Take a screenshot
      const screenshot = await element.screenshot({
        omitBackground: backgroundColor === 'transparent',
        type: 'png'
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