const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Import the generateAndBroadcastNumber function
const { generateAndBroadcastNumber } = require('./controllers/generateController');

// Serve HTML file for testing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Import the generate route and use it under the '/api' path
const generateRoutes = require('./routes/generateRoutes');
app.use('/api', generateRoutes(io));

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Initial call to generateAndBroadcastNumber (commented out)
generateAndBroadcastNumber();
