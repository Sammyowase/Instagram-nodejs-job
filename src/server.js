require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const logger = require('./config/logger');
const { runSeeders } = require('./utils/seeder');

// Create HTTP server
const server = http.createServer(app);

// Get port from environment and store in Express
const port = process.env.PORT || 3000;
app.set('port', port);

// Socket.io setup
const socketSetup = require('./sockets/chat');
socketSetup(server);

// Connect to MongoDB and run seeders
connectDB().then(async () => {
  // Run database seeders
  await runSeeders();

  // Start server after database connection and seeding
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
}).catch(err => {
  logger.error(`Failed to connect to database: ${err.message}`);
  process.exit(1);
});

// Event listener for HTTP server "error" event
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

// Event listener for HTTP server "listening" event
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  logger.info('Server listening on ' + bind);
}
