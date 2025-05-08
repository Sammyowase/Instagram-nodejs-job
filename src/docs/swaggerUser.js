const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Chat Application API',
      version: '1.0.0',
      description: `
## User & Chat API Documentation

This API documentation focuses on three core functionalities:

### 1. User Authentication
- Register with email, name, country, and password
- Verify your email before logging in
- Login to get your JWT token for accessing protected endpoints

### 2. Private Messaging
- Send direct messages to other users
- View conversation history with a specific user
- Real-time messaging via WebSockets

### 3. Group Chat
- Create new chat groups
- Join existing groups like "Sam Teach Backend"
- Send messages to all members in a group
- Leave groups you no longer want to participate in

### Quick Start Guide:
1. Create an account: POST /api/auth/signup
2. Verify your email using the link sent to your inbox
3. Login: POST /api/auth/login
4. Click "Authorize" above and enter your token as: Bearer YOUR_TOKEN
5. Start messaging!
      `,
      contact: {
        name: 'API Support',
        email: 'samuelowase02@gmail.com'
      }
    },
    servers: [
      {
        url: '/',
        description: 'API Server'
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
        // Authentication schemas
        SignupRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'country', 'password'],
          properties: {
            firstName: {
              type: 'string',
              example: 'Samuel',
              description: 'Your first name'
            },
            lastName: {
              type: 'string',
              example: 'Owase',
              description: 'Your last name'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
              description: 'Your email address (will need verification)'
            },
            country: {
              type: 'string',
              example: 'Nigeria',
              description: 'Your country'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'Password@123',
              description: 'Strong password with uppercase, lowercase, number, and special character'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
              description: 'Your registered email'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'Password@123',
              description: 'Your password'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Login successful'
            },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: '60d21b4667d0d8992e610c85'
                },
                firstName: {
                  type: 'string',
                  example: 'Samuel'
                },
                lastName: {
                  type: 'string',
                  example: 'Owase'
                },
                email: {
                  type: 'string',
                  example: 'user@example.com'
                }
              }
            }
          }
        },

        // Private messaging schemas
        PrivateMessageRequest: {
          type: 'object',
          required: ['content'],
          properties: {
            content: {
              type: 'string',
              example: 'Hello, how are you doing today?',
              description: 'Message content (max 1000 characters)'
            }
          }
        },
        MessageResponse: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '60d21b4667d0d8992e610c85'
            },
            sender: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                  example: '60d21b4667d0d8992e610c85'
                },
                firstName: {
                  type: 'string',
                  example: 'Samuel'
                },
                lastName: {
                  type: 'string',
                  example: 'Owase'
                }
              }
            },
            content: {
              type: 'string',
              example: 'Hello, how are you doing today?'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-05-07T15:30:45.123Z'
            }
          }
        },

        // Group chat schemas
        GroupRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              example: 'Backend Developers',
              description: 'Group name (must be unique)'
            },
            description: {
              type: 'string',
              example: 'A group for backend developers to share knowledge',
              description: 'Group description (optional)'
            }
          }
        },
        GroupMessageRequest: {
          type: 'object',
          required: ['content'],
          properties: {
            content: {
              type: 'string',
              example: 'Has anyone used the new Express 5 features?',
              description: 'Message content to send to the group'
            }
          }
        },
        GroupResponse: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '60d21b4667d0d8992e610c85'
            },
            name: {
              type: 'string',
              example: 'Sam Teach Backend'
            },
            description: {
              type: 'string',
              example: 'Learn backend development with Sam'
            },
            memberCount: {
              type: 'integer',
              example: 5
            },
            isMember: {
              type: 'boolean',
              example: true
            }
          }
        }
      },
      examples: {
        SignupExample: {
          value: {
            firstName: 'Samuel',
            lastName: 'Owase',
            email: 'user@example.com',
            country: 'Nigeria',
            password: 'Password@123'
          }
        },
        LoginExample: {
          value: {
            email: 'user@example.com',
            password: 'Password@123'
          }
        },
        PrivateMessageExample: {
          value: {
            content: 'Hello, how are you doing today?'
          }
        },
        CreateGroupExample: {
          value: {
            name: 'Backend Developers',
            description: 'A group for backend developers to share knowledge'
          }
        },
        GroupMessageExample: {
          value: {
            content: 'Has anyone used the new Express 5 features?'
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Register, verify email, and login to get access token'
      },
      {
        name: 'Private Chat',
        description: 'One-on-one messaging between users'
      },
      {
        name: 'Group Chat',
        description: 'Create, join, and message in group conversations'
      },
      {
        name: 'WebSocket Chat',
        description: 'Real-time messaging using Socket.IO (not testable via Swagger)'
      }
    ]
  },
  // Path to the API docs
  apis: [
    './src/routes/auth.routes.js',
    './src/routes/user.routes.js',
    './src/routes/group.routes.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
