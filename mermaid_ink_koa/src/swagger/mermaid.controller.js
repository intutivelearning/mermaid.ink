const { 
  SwaggerRouter, 
  request, 
  summary, 
  description,
  path, 
  query, 
  tag, 
  responses 
} = require('koa-swagger-decorator');

const views = require('../views');

// Define tag for API categorization
const apiTag = tag('mermaid');

class MermaidController {
  @request('get', '/svg/{encodedCode}')
  @summary('Render Mermaid diagram as SVG')
  @description('Returns an SVG image of the rendered Mermaid diagram')
  @apiTag
  @path({
    encodedCode: { type: 'string', required: true, description: 'Base64-encoded Mermaid diagram code' }
  })
  @query({
    theme: { type: 'string', required: false, default: 'default', description: 'Diagram theme (default, dark, forest, neutral)' },
    backgroundColor: { type: 'string', required: false, default: 'white', description: 'Background color for the diagram' }
  })
  @responses({
    200: { description: 'SVG image of the rendered diagram' },
    400: { description: 'Bad request - invalid parameters or diagram code' },
    500: { description: 'Internal server error during rendering' }
  })
  static async svgRoute(ctx) {
    await views.svg(ctx);
  }

  @request('get', '/img/{encodedCode}')
  @summary('Render Mermaid diagram as PNG')
  @description('Returns a PNG image of the rendered Mermaid diagram')
  @apiTag
  @path({
    encodedCode: { type: 'string', required: true, description: 'Base64-encoded Mermaid diagram code' }
  })
  @query({
    theme: { type: 'string', required: false, default: 'default', description: 'Diagram theme (default, dark, forest, neutral)' },
    backgroundColor: { type: 'string', required: false, default: 'white', description: 'Background color for the diagram' },
    width: { type: 'number', required: false, description: 'Width in pixels' },
    height: { type: 'number', required: false, description: 'Height in pixels' }
  })
  @responses({
    200: { description: 'PNG image of the rendered diagram' },
    400: { description: 'Bad request - invalid parameters or diagram code' },
    500: { description: 'Internal server error during rendering' }
  })
  static async imgRoute(ctx) {
    await views.img(ctx);
  }

  @request('get', '/pdf/{encodedCode}')
  @summary('Render Mermaid diagram as PDF')
  @description('Returns a PDF document containing the rendered Mermaid diagram')
  @apiTag
  @path({
    encodedCode: { type: 'string', required: true, description: 'Base64-encoded Mermaid diagram code' }
  })
  @query({
    theme: { type: 'string', required: false, default: 'default', description: 'Diagram theme (default, dark, forest, neutral)' },
    backgroundColor: { type: 'string', required: false, default: 'white', description: 'Background color for the diagram' },
    width: { type: 'number', required: false, description: 'Width in pixels' },
    height: { type: 'number', required: false, description: 'Height in pixels' }
  })
  @responses({
    200: { description: 'PDF document containing the rendered diagram' },
    400: { description: 'Bad request - invalid parameters or diagram code' },
    500: { description: 'Internal server error during rendering' }
  })
  static async pdfRoute(ctx) {
    await views.pdf(ctx);
  }

  @request('get', '/services/oembed')
  @summary('oEmbed service for Mermaid diagrams')
  @description('Returns oEmbed metadata for embedding Mermaid diagrams in websites')
  @apiTag
  @query({
    url: { type: 'string', required: true, description: 'URL to the Mermaid diagram' },
    format: { type: 'string', required: false, default: 'json', description: 'Response format (only json is supported)' },
    maxwidth: { type: 'number', required: false, description: 'Maximum width of the embedded resource' },
    maxheight: { type: 'number', required: false, description: 'Maximum height of the embedded resource' }
  })
  @responses({
    200: { description: 'oEmbed JSON response' },
    400: { description: 'Bad request - invalid parameters' },
    404: { description: 'Not found - URL not supported' },
    501: { description: 'Not implemented - requested format not supported' }
  })
  static async oembedRoute(ctx) {
    await views.servicesOembed(ctx);
  }

  @request('get', '/')
  @summary('Home page')
  @description('Returns the home page with Mermaid diagram editor')
  @apiTag
  @responses({
    200: { description: 'HTML page with Mermaid diagram editor' }
  })
  static async homeRoute(ctx) {
    await views.home(ctx);
  }
}

module.exports = MermaidController;