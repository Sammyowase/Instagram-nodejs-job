const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const fs = require('fs');
const logger = require('./config/logger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const adminAuthRoutes = require('./routes/adminAuth.routes');
const groupRoutes = require('./routes/group.routes');

// Import Swagger specs
const swaggerUserSpec = require('./docs/swaggerUser');
const swaggerAdminSpec = require('./docs/swaggerAdmin');

const app = express();

// Middleware
// Configure Helmet with custom CSP for Swagger UI
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "unpkg.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  },
}));
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-auth', adminAuthRoutes);
app.use('/api/groups', groupRoutes);

// Swagger documentation
// Serve the Swagger UI HTML files
app.get('/api/docs/user', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'userSwaggerUI.html'));
});

app.get('/api/docs/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'adminSwaggerUI.html'));
});

// Serve the Swagger specifications as JSON
app.get('/api/docs/user-spec', (req, res) => {
  res.json(swaggerUserSpec);
});

app.get('/api/docs/admin-spec', (req, res) => {
  res.json(swaggerAdminSpec);
});

// WebSocket documentation
app.get('/api/docs/websocket', (req, res) => {
  const websocketDocPath = path.join(__dirname, 'docs', 'websocket.md');
  const content = fs.readFileSync(websocketDocPath, 'utf8');

  // Convert markdown to HTML (simple conversion)
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>WebSocket API Documentation</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }
        pre {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          overflow-x: auto;
        }
        code {
          font-family: Consolas, Monaco, 'Andale Mono', monospace;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px 12px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        h1, h2, h3 {
          margin-top: 30px;
        }
        a {
          color: #0366d6;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div id="content">
        ${content.replace(/^# (.*)/gm, '<h1>$1</h1>')
                .replace(/^## (.*)/gm, '<h2>$1</h2>')
                .replace(/^### (.*)/gm, '<h3>$1</h3>')
                .replace(/\`\`\`javascript([\s\S]*?)\`\`\`/gm, '<pre><code>$1</code></pre>')
                .replace(/\`\`\`([\s\S]*?)\`\`\`/gm, '<pre><code>$1</code></pre>')
                .replace(/\`([^\`]+)\`/gm, '<code>$1</code>')
                .replace(/\| (.*) \|/gm, '<tr><td>$1</td></tr>')
                .replace(/<tr><td>(.*) \| (.*) \| (.*)<\/td><\/tr>/gm, '<tr><td>$1</td><td>$2</td><td>$3</td></tr>')
                .replace(/<tr><td>(.*) \| (.*) \| (.*) \| (.*)<\/td><\/tr>/gm, '<tr><td>$1</td><td>$2</td><td>$3</td><td>$4</td></tr>')
                .replace(/\n\n/gm, '<br><br>')}
      </div>
      <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
        <p>
          <a href="/api/docs/user">User API Documentation</a> |
          <a href="/api/docs/admin">Admin API Documentation</a>
        </p>
      </div>
    </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API Documentation index page
app.get('/api/docs', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>SirPaul API Documentation</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
        }
        .container {
          margin-top: 50px;
        }
        .card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          text-align: left;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
          color: #333;
        }
        h2 {
          color: #0366d6;
          margin-top: 0;
        }
        a.button {
          display: inline-block;
          background-color: #0366d6;
          color: white;
          padding: 10px 20px;
          border-radius: 4px;
          text-decoration: none;
          margin-top: 10px;
          transition: background-color 0.3s;
        }
        a.button:hover {
          background-color: #0056b3;
        }
        p {
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <h1>SirPaul API Documentation</h1>
      <p>Welcome to the SirPaul API documentation. Choose one of the following documentation sections:</p>

      <div class="container">
        <div class="card">
          <h2>User API Documentation</h2>
          <p>Documentation for user-facing endpoints including authentication, user profile management, messaging, and groups.</p>
          <a href="/api/docs/user" class="button">View User API Docs</a>
        </div>

        <div class="card">
          <h2>Admin API Documentation</h2>
          <p>Documentation for admin-only endpoints including user management, system statistics, and administrative functions.</p>
          <a href="/api/docs/admin" class="button">View Admin API Docs</a>
        </div>

        <div class="card">
          <h2>WebSocket API Documentation</h2>
          <p>Documentation for real-time messaging using WebSockets, including private messaging and group chat functionality.</p>
          <a href="/api/docs/websocket" class="button">View WebSocket Docs</a>
        </div>
      </div>
    </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
