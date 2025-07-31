// src/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Risk Assessment API',
      version: '1.0.0',
      description: 'A comprehensive API for customer risk assessment and compliance management',
      contact: {
        name: 'API Support',
        email: 'support@riskapi.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['user', 'approver', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        RiskParameter: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            category: { type: 'string' },
            parameter: { type: 'string' },
            riskLevel: { type: 'string', enum: ['Low', 'Medium', 'High', 'AutoHigh', 'NoGo'] },
            scoreValue: { type: 'number' }
          }
        },
        AdminSetting: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            key: { type: 'string' },
            description: { type: 'string' },
            value: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Submission: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            submittedBy: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['individual', 'entity'] },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'escalated'] },
            calculatedScore: { type: 'number', nullable: true },
            systemRating: { type: 'string', enum: ['Low', 'Medium', 'High', 'AutoHigh', 'NoGo'] },
            finalRating: { type: 'string', enum: ['Low', 'Medium', 'High', 'AutoHigh', 'NoGo'] },
            justification: { type: 'string', nullable: true },
            submittedAt: { type: 'string', format: 'date-time' },
            details: {
              type: 'array',
              items: { $ref: '#/components/schemas/SubmissionDetail' }
            },
            user: { $ref: '#/components/schemas/UserInfo' }
          }
        },
        SubmissionDetail: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            submissionId: { type: 'string', format: 'uuid' },
            section: { type: 'string' },
            data: { type: 'object' }
          }
        },
        UserInfo: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['user', 'approver', 'admin'] }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 }
          }
        },
        SignupRequest: {
          type: 'object',
          required: ['email', 'password', 'role'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            role: { type: 'string', enum: ['user', 'approver', 'admin'] }
          }
        },
        CreateSubmissionRequest: {
          type: 'object',
          required: ['type', 'details'],
          properties: {
            type: { type: 'string', enum: ['individual', 'entity'] },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  section: { type: 'string' },
                  data: { type: 'object' }
                }
              }
            }
          }
        },
        RiskParameterRequest: {
          type: 'object',
          required: ['category', 'parameter', 'riskLevel', 'scoreValue'],
          properties: {
            category: { type: 'string' },
            parameter: { type: 'string' },
            riskLevel: { type: 'string', enum: ['Low', 'Medium', 'High', 'AutoHigh', 'NoGo'] },
            scoreValue: { type: 'number' }
          }
        },
        AdminSettingRequest: {
          type: 'object',
          required: ['key', 'description', 'value'],
          properties: {
            key: { type: 'string' },
            description: { type: 'string' },
            value: { type: 'string' }
          }
        },
        OverrideSubmissionRequest: {
          type: 'object',
          properties: {
            finalRating: { type: 'string', enum: ['Low', 'Medium', 'High', 'AutoHigh', 'NoGo'] },
            justification: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'escalated'] }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            error: { type: 'object' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                email: { type: 'string' },
                role: { type: 'string' }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Risk Assessment API Documentation'
  }));
};

export default specs;