# WebSocket API Documentation

This document provides information about the WebSocket API for real-time messaging.

## Connection

Connect to the WebSocket server using Socket.IO:

```javascript
const socket = io('http://localhost:8000', {
  auth: {
    token: 'YOUR_JWT_TOKEN' // JWT token from login
  }
});
```

## Authentication

Authentication is required to use the WebSocket API. Provide your JWT token in the connection auth object.

## Events

### Connection Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `connect` | Server → Client | Fired when connection is established |
| `disconnect` | Server → Client | Fired when connection is closed |
| `error` | Server → Client | Fired when an error occurs |
| `onlineUsers` | Server → Client | List of online user IDs |
| `userOnline` | Server → Client | Fired when a user comes online |
| `userOffline` | Server → Client | Fired when a user goes offline |

### Private Messaging

| Event | Direction | Description | Payload |
|-------|-----------|-------------|---------|
| `privateMessage` | Client → Server | Send a private message | `{ recipientId: String, content: String }` |
| `privateMessage` | Server → Client | Receive a private message | Message object |
| `messageSent` | Server → Client | Confirmation that message was sent | Message object |

### Group Messaging

| Event | Direction | Description | Payload |
|-------|-----------|-------------|---------|
| `joinGroup` | Client → Server | Join a group | `{ groupId: String }` |
| `leaveGroup` | Client → Server | Leave a group | `{ groupId: String }` |
| `groupMessage` | Client → Server | Send a message to a group | `{ groupId: String, content: String }` |
| `groupMessage` | Server → Client | Receive a group message | Message object |
| `userJoinedGroup` | Server → Client | Notification when a user joins a group | `{ groupId: String, user: Object }` |
| `userLeftGroup` | Server → Client | Notification when a user leaves a group | `{ groupId: String, userId: String }` |
| `joinedGroup` | Server → Client | Confirmation that you joined a group | `{ groupId: String, name: String }` |
| `leftGroup` | Server → Client | Confirmation that you left a group | `{ groupId: String, name: String }` |

## Example Usage

### Connecting to the WebSocket Server

```javascript
const socket = io('http://localhost:8000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('error', (error) => {
  console.error('WebSocket error:', error);
});
```

### Private Messaging

```javascript
// Send a private message
socket.emit('privateMessage', {
  recipientId: 'USER_ID',
  content: 'Hello, this is a private message!'
});

// Listen for private messages
socket.on('privateMessage', (message) => {
  console.log('Received private message:', message);
});

// Listen for message sent confirmation
socket.on('messageSent', (message) => {
  console.log('Message sent successfully:', message);
});
```

### Group Messaging

```javascript
// Join a group
socket.emit('joinGroup', {
  groupId: 'GROUP_ID'
});

// Send a message to a group
socket.emit('groupMessage', {
  groupId: 'GROUP_ID',
  content: 'Hello everyone in the group!'
});

// Listen for group messages
socket.on('groupMessage', (message) => {
  console.log('Received group message:', message);
});

// Leave a group
socket.emit('leaveGroup', {
  groupId: 'GROUP_ID'
});
```

### User Presence

```javascript
// Listen for online users
socket.on('onlineUsers', (users) => {
  console.log('Users currently online:', users);
});

// Listen for user online event
socket.on('userOnline', (userId) => {
  console.log('User came online:', userId);
});

// Listen for user offline event
socket.on('userOffline', (userId) => {
  console.log('User went offline:', userId);
});
```
