# Instagram Node.js Job Application



A robust Node.js/Express REST API with MongoDB, Socket.IO, and comprehensive documentation for a real-time chat application.

## 📋 Features

- **Authentication System**
  - User registration with email verification
  - JWT-based authentication
  - Role-based access control (user/admin)
  - Password reset functionality

- **Chat Functionality**
  - Private messaging between users
  - Group chat with multiple participants
  - Real-time communication using Socket.IO

- **Admin Dashboard**
  - User management (view, create, update, delete)
  - System statistics
  - Admin-only endpoints with proper authorization

- **API Documentation**
  - Separate Swagger documentation for users and admins
  - Interactive API testing
  - WebSocket documentation

- **Security Features**
  - Rate limiting to prevent abuse
  - Content Security Policy with Helmet
  - Input validation and sanitization
  - Secure password hashing

- **Logging and Monitoring**
  - Comprehensive request logging
  - Error tracking and reporting

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sirpaul-backend.git
   cd sirpaul-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Server
   PORT=8000
   NODE_ENV=development

   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/sirpaul

   # JWT
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d

   # Email
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   EMAIL_FROM=your_email@gmail.com

   # Default Admin
   DEFAULT_ADMIN_EMAIL=samuelowase02@gmail.com
   DEFAULT_ADMIN_PASSWORD=Admin@123
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Running in Production

For production deployment:

```bash
npm run start
```

## 📚 API Documentation

The API documentation is available at the following endpoints:

- **User API Documentation**: `/api/docs/user`
- **Admin API Documentation**: `/api/docs/admin`
- **WebSocket Documentation**: `/api/docs/websocket`

### Default Admin Account

- Email: `samuelowase02@gmail.com`
- Password: `Admin@123`

## 🏗️ Project Structure

```
src/
├── config/           # Configuration files
│   ├── db.js         # Database connection
│   └── logger.js     # Logging configuration
├── controllers/      # Request handlers
│   ├── admin.controller.js
│   ├── auth.controller.js
│   ├── group.controller.js
│   └── user.controller.js
├── docs/             # API documentation
│   ├── swaggerAdmin.js
│   ├── swaggerUser.js
│   └── websocket.md
├── middlewares/      # Express middlewares
│   ├── auth.middleware.js
│   ├── rateLimiter.middleware.js
│   ├── role.middleware.js
│   └── validation.middleware.js
├── models/           # MongoDB models
│   ├── Group.js
│   ├── Message.js
│   └── User.js
├── routes/           # API routes
│   ├── admin.routes.js
│   ├── adminAuth.routes.js
│   ├── auth.routes.js
│   ├── group.routes.js
│   └── user.routes.js
├── scripts/          # Utility scripts
│   └── createAdmin.js
├── services/         # Business logic
│   └── socket.service.js
├── utils/            # Utility functions
│   ├── email.js
│   ├── generateToken.js
│   └── seeder.js
├── app.js            # Express app setup
└── server.js         # Server entry point
```

## 🔒 Authentication

### User Authentication Flow

1. User registers with email, name, country, and password
2. Verification email is sent to the user
3. User verifies email by clicking the link
4. User can now log in to get a JWT token
5. Token is used for authenticated requests

### Admin Authentication Flow

1. Default admin is created during initial setup
2. Admin logs in using the admin login endpoint
3. Admin can create new admin accounts
4. New admins receive an invitation email with credentials
5. Admin accounts are automatically verified

## 💬 WebSocket API

The WebSocket API enables real-time messaging. Connect to the WebSocket server at:

```
ws://localhost:8000
```

### Events

- `connection`: Establishes a connection
- `authenticate`: Authenticates the socket with a JWT token
- `private-message`: Sends a private message to another user
- `group-message`: Sends a message to a group
- `typing`: Indicates a user is typing
- `disconnect`: Closes the connection

## 🛠️ Development

### Available Scripts

- `npm run dev`: Starts the development server with hot-reload
- `npm run start`: Starts the production server
- `npm run test`: Runs the test suite
- `npm run lint`: Lints the codebase

### Adding New Features

1. Create necessary models in the `models/` directory
2. Implement controllers in the `controllers/` directory
3. Define routes in the `routes/` directory
4. Update Swagger documentation in the `docs/` directory

## 📝 API Endpoints

### Authentication

- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/verify`: Verify email address
- `POST /api/auth/login`: Login and get token
- `POST /api/auth/forgot-password`: Request password reset
- `POST /api/auth/reset-password`: Reset password

### User

- `GET /api/users/profile`: Get current user profile
- `PUT /api/users/profile`: Update user profile
- `GET /api/users/:id`: Get user by ID
- `GET /api/users/:id/messages`: Get conversation with user

### Group

- `GET /api/groups`: Get all groups
- `POST /api/groups`: Create a new group
- `GET /api/groups/:id`: Get group by ID
- `PUT /api/groups/:id`: Update group
- `DELETE /api/groups/:id`: Delete group
- `POST /api/groups/:id/join`: Join a group
- `POST /api/groups/:id/leave`: Leave a group
- `GET /api/groups/:id/messages`: Get group messages
- `POST /api/groups/:id/messages`: Send message to group

### Admin

- `POST /api/admin-auth/login`: Admin login
- `GET /api/admin/users`: Get all users
- `POST /api/admin/register`: Create a new admin
- `GET /api/admin/users/:id`: Get user by ID
- `PUT /api/admin/users/:id`: Update user
- `DELETE /api/admin/users/:id`: Delete user
- `GET /api/admin/stats`: Get system statistics

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Samuel Owase - [samuelowase02@gmail.com](mailto:samuelowase02@gmail.com)
