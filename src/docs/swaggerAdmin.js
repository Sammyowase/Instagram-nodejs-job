const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Admin Control Panel API',
      version: '1.0.0',
      description: `
## Admin API Documentation

This API provides administrative capabilities for managing the chat application:

### 1. Admin Authentication
- Login with the default admin account (samuelowase02@gmail.com)
- Only admins can access these endpoints
- Regular users CANNOT sign up to become admins

### 2. Admin Creation Process
- Only existing admins can create new admin accounts
- New admins are created with their name, email, country, and a temporary password
- The new admin receives an invitation email with their login credentials
- New admin accounts are automatically verified and can log in immediately
- No email verification is required for admin accounts

### 3. User Management
- View all users with pagination
- Get detailed information about specific users
- Update user information (name, country, role)
- Delete users when necessary

### 4. System Statistics
- View overall system metrics
- Monitor user growth and activity
- Track message and group statistics

### Default Admin Access:
- Email: samuelowase02@gmail.com
- Password: Admin@123

### Quick Start Guide:
1. Login: POST /api/admin-auth/login with the default admin credentials
2. Click "Authorize" above and enter your token as: Bearer YOUR_TOKEN
3. Create new admins: POST /api/admin/register with admin details
4. New admins will receive an email with login instructions
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
        AdminLoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'samuelowase02@gmail.com',
              description: 'Admin email address'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'Admin@123',
              description: 'Admin password'
            }
          }
        },
        LoginResponse: {
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
                  example: 'samuelowase02@gmail.com'
                },
                role: {
                  type: 'string',
                  example: 'admin'
                }
              }
            }
          }
        },

        // User management schemas
        CreateAdminRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'country', 'password'],
          properties: {
            firstName: {
              type: 'string',
              example: 'New',
              description: 'Admin first name'
            },
            lastName: {
              type: 'string',
              example: 'Admin',
              description: 'Admin last name'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'newadmin@example.com',
              description: 'Admin email address (must be unique)'
            },
            country: {
              type: 'string',
              example: 'Nigeria',
              description: 'Admin country'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'Admin@123',
              description: 'Temporary password for the new admin (will be sent in the invitation email)'
            }
          }
        },
        UserUpdateRequest: {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
              example: 'Updated',
              description: 'Updated first name'
            },
            lastName: {
              type: 'string',
              example: 'User',
              description: 'Updated last name'
            },
            country: {
              type: 'string',
              example: 'Nigeria',
              description: 'Updated country'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              example: 'admin',
              description: 'User role (promote to admin or demote to regular user)'
            }
          }
        },
        UserListResponse: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: {
                    type: 'string',
                    example: '60d21b4667d0d8992e610c85'
                  },
                  firstName: {
                    type: 'string',
                    example: 'John'
                  },
                  lastName: {
                    type: 'string',
                    example: 'Doe'
                  },
                  email: {
                    type: 'string',
                    example: 'john.doe@example.com'
                  },
                  country: {
                    type: 'string',
                    example: 'Nigeria'
                  },
                  role: {
                    type: 'string',
                    example: 'user'
                  },
                  isVerified: {
                    type: 'boolean',
                    example: true
                  },
                  createdAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2023-05-07T15:30:45.123Z'
                  }
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                total: {
                  type: 'integer',
                  example: 25
                },
                page: {
                  type: 'integer',
                  example: 1
                },
                pages: {
                  type: 'integer',
                  example: 3
                }
              }
            }
          }
        },

        // System statistics schemas
        SystemStatsResponse: {
          type: 'object',
          properties: {
            stats: {
              type: 'object',
              properties: {
                users: {
                  type: 'integer',
                  example: 25,
                  description: 'Total number of users'
                },
                admins: {
                  type: 'integer',
                  example: 2,
                  description: 'Total number of admin users'
                },
                verifiedUsers: {
                  type: 'integer',
                  example: 20,
                  description: 'Total number of verified users'
                },
                groups: {
                  type: 'integer',
                  example: 8,
                  description: 'Total number of groups'
                },
                messages: {
                  type: 'integer',
                  example: 156,
                  description: 'Total number of messages'
                }
              }
            },
            recentUsers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  firstName: {
                    type: 'string',
                    example: 'Recent'
                  },
                  lastName: {
                    type: 'string',
                    example: 'User'
                  },
                  email: {
                    type: 'string',
                    example: 'recent.user@example.com'
                  },
                  createdAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2023-05-07T15:30:45.123Z'
                  }
                }
              },
              description: 'List of recently registered users'
            }
          }
        }
      },
      examples: {
        AdminLoginExample: {
          value: {
            email: 'samuelowase02@gmail.com',
            password: 'Admin@123'
          }
        },
        CreateAdminExample: {
          value: {
            firstName: 'New',
            lastName: 'Admin',
            email: 'newadmin@example.com',
            country: 'Nigeria',
            password: 'TempPass@123' // Temporary password that will be sent in the invitation email
          }
        },
        UpdateUserExample: {
          value: {
            firstName: 'Updated',
            lastName: 'User',
            country: 'Nigeria',
            role: 'admin'
          }
        }
      }
    },
    tags: [
      {
        name: 'Admin Authentication',
        description: 'Login as an administrator'
      },
      {
        name: 'Admin Management',
        description: 'Create and manage admin accounts'
      },
      {
        name: 'User Management',
        description: 'View, update, and delete users'
      },
      {
        name: 'System Statistics',
        description: 'View system metrics and activity data'
      }
    ]
  },
  // Path to the API docs
  apis: [
    './src/routes/auth.routes.js',
    './src/routes/admin.routes.js',
    './src/routes/adminAuth.routes.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
