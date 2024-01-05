const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const expressServer = http.createServer(app);
const io = socketIO(expressServer);

// Import the generateAndBroadcastNumber function
const { generateAndBroadcastNumber } = require('./controllers/generateController');

// Serve HTML file for testing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

const MONGODB_USERNAME = encodeURIComponent(process.env.MONGODB_USERNAME);
const MONGODB_PASSWORD = encodeURIComponent(process.env.MONGODB_PASSWORD);
const MONGODB_DBNAME = process.env.MONGODB_DBNAME;

// Check if the MongoDB URI is defined
if (!MONGODB_USERNAME || !MONGODB_PASSWORD || !MONGODB_DBNAME) {
  console.error('MongoDB connection details are incomplete. Please check your environment variables.');
  process.exit(1); // Exit the application if MongoDB URI is not defined
}

const MONGODB_URI = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@cluster0.kuo0csq.mongodb.net/${MONGODB_DBNAME}?retryWrites=true&w=majority`;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Import the generate route and use it under the '/api' path
const generateRoutes = require('./routes/generateRoutes');
app.use('/api', generateRoutes(io));

const userRoutes = require('./routes/userRoute');
app.use('/user', userRoutes);

// Start the Express server on port 3000
const EXPRESS_PORT = 3000;
expressServer.listen(EXPRESS_PORT, () => {
  console.log(`Express server is running on port ${EXPRESS_PORT}`);
});

// Start Socket.IO on port 4000
const SOCKET_IO_PORT = 4000;
io.listen(SOCKET_IO_PORT);
console.log(`Socket.IO is running on port ${SOCKET_IO_PORT}`);

// Initial call to generateAndBroadcastNumber (commented out)
// generateAndBroadcastNumber();
