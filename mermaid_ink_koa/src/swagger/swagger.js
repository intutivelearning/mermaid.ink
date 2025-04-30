const Router = require('koa-router');
const swaggerJSDoc = require('swagger-jsdoc');
const { koaSwagger } = require('koa2-swagger-ui');
const path = require('path');

// Define API documentation
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Mermaid.ink API',
    version: '1.0.0',
    description: 'API for rendering Mermaid diagrams as SVG, PNG or PDF',
  },
  servers: [
    {
      url: '/',
      description: 'Current server',
    },
  ],
  tags: [
    {
      name: 'mermaid',
      description: 'Mermaid diagram rendering operations',
    },
  ],
  paths: {
    '/svg/{encodedCode}': {
      get: {
        tags: ['mermaid'],
        summary: 'Render Mermaid diagram as SVG',
        description: 'Returns an SVG image of the rendered Mermaid diagram',
        parameters: [
          {
            name: 'encodedCode',
            in: 'path',
            required: true,
            description: 'Base64-encoded Mermaid diagram code',
            schema: {
              type: 'string'
            }
          },
          {
            name: 'theme',
            in: 'query',
            required: false,
            description: 'Diagram theme (default, dark, forest, neutral)',
            schema: {
              type: 'string',
              default: 'default',
              enum: ['default', 'dark', 'forest', 'neutral']
            }
          },
          {
            name: 'backgroundColor',
            in: 'query',
            required: false,
            description: 'Background color for the diagram',
            schema: {
              type: 'string',
              default: 'white'
            }
          }
        ],
        responses: {
          '200': {
            description: 'SVG image of the rendered diagram',
            content: {
              'image/svg+xml': {
                schema: {
                  type: 'string'
                }
              }
            }
          },
          '400': {
            description: 'Bad request - invalid parameters or diagram code'
          },
          '500': {
            description: 'Internal server error during rendering'
          }
        }
      }
    },
    '/img/{encodedCode}': {
      get: {
        tags: ['mermaid'],
        summary: 'Render Mermaid diagram as PNG',
        description: 'Returns a PNG image of the rendered Mermaid diagram',
        parameters: [
          {
            name: 'encodedCode',
            in: 'path',
            required: true,
            description: 'Base64-encoded Mermaid diagram code',
            schema: {
              type: 'string'
            }
          },
          {
            name: 'theme',
            in: 'query',
            required: false,
            description: 'Diagram theme (default, dark, forest, neutral)',
            schema: {
              type: 'string',
              default: 'default',
              enum: ['default', 'dark', 'forest', 'neutral']
            }
          },
          {
            name: 'backgroundColor',
            in: 'query',
            required: false,
            description: 'Background color for the diagram',
            schema: {
              type: 'string',
              default: 'white'
            }
          },
          {
            name: 'width',
            in: 'query',
            required: false,
            description: 'Width in pixels',
            schema: {
              type: 'number'
            }
          },
          {
            name: 'height',
            in: 'query',
            required: false,
            description: 'Height in pixels',
            schema: {
              type: 'number'
            }
          }
        ],
        responses: {
          '200': {
            description: 'PNG image of the rendered diagram',
            content: {
              'image/png': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          },
          '400': {
            description: 'Bad request - invalid parameters or diagram code'
          },
          '500': {
            description: 'Internal server error during rendering'
          }
        }
      }
    },
    '/pdf/{encodedCode}': {
      get: {
        tags: ['mermaid'],
        summary: 'Render Mermaid diagram as PDF',
        description: 'Returns a PDF document containing the rendered Mermaid diagram',
        parameters: [
          {
            name: 'encodedCode',
            in: 'path',
            required: true,
            description: 'Base64-encoded Mermaid diagram code',
            schema: {
              type: 'string'
            }
          },
          {
            name: 'theme',
            in: 'query',
            required: false,
            description: 'Diagram theme (default, dark, forest, neutral)',
            schema: {
              type: 'string',
              default: 'default',
              enum: ['default', 'dark', 'forest', 'neutral']
            }
          },
          {
            name: 'backgroundColor',
            in: 'query',
            required: false,
            description: 'Background color for the diagram',
            schema: {
              type: 'string',
              default: 'white'
            }
          },
          {
            name: 'width',
            in: 'query',
            required: false,
            description: 'Width in pixels',
            schema: {
              type: 'number'
            }
          },
          {
            name: 'height',
            in: 'query',
            required: false,
            description: 'Height in pixels',
            schema: {
              type: 'number'
            }
          }
        ],
        responses: {
          '200': {
            description: 'PDF document containing the rendered diagram',
            content: {
              'application/pdf': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          },
          '400': {
            description: 'Bad request - invalid parameters or diagram code'
          },
          '500': {
            description: 'Internal server error during rendering'
          }
        }
      }
    },
    '/services/oembed': {
      get: {
        tags: ['mermaid'],
        summary: 'oEmbed service for Mermaid diagrams',
        description: 'Returns oEmbed metadata for embedding Mermaid diagrams in websites',
        parameters: [
          {
            name: 'url',
            in: 'query',
            required: true,
            description: 'URL to the Mermaid diagram',
            schema: {
              type: 'string'
            }
          },
          {
            name: 'format',
            in: 'query',
            required: false,
            description: 'Response format (only json is supported)',
            schema: {
              type: 'string',
              default: 'json'
            }
          },
          {
            name: 'maxwidth',
            in: 'query',
            required: false,
            description: 'Maximum width of the embedded resource',
            schema: {
              type: 'number'
            }
          },
          {
            name: 'maxheight',
            in: 'query',
            required: false,
            description: 'Maximum height of the embedded resource',
            schema: {
              type: 'number'
            }
          }
        ],
        responses: {
          '200': {
            description: 'oEmbed JSON response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      example: 'photo'
                    },
                    version: {
                      type: 'string',
                      example: '1.0'
                    },
                    width: {
                      type: 'number'
                    },
                    height: {
                      type: 'number'
                    },
                    url: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Bad request - invalid parameters'
          },
          '404': {
            description: 'Not found - URL not supported'
          },
          '501': {
            description: 'Not implemented - requested format not supported'
          }
        }
      }
    },
    '/': {
      get: {
        tags: ['mermaid'],
        summary: 'Home page',
        description: 'Returns the home page with Mermaid diagram editor',
        responses: {
          '200': {
            description: 'HTML page with Mermaid diagram editor'
          }
        }
      }
    }
  }
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc({
  definition: swaggerDefinition,
  apis: [], // No need for external API files as we've defined everything inline
});

const router = new Router();

// Route to serve the Swagger UI
router.get('/docs', koaSwagger({
  routePrefix: false,
  swaggerOptions: {
    spec: swaggerSpec,
  },
  title: 'Mermaid.ink API Documentation',
  oauthOptions: {} // No auth required for this API
}));

// Route to serve the Swagger spec as JSON
router.get('/api/swagger.json', (ctx) => {
  ctx.body = swaggerSpec;
});

module.exports = router;