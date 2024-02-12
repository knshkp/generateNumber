const express = require('express');
const https = require('https');
const socketIO = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const cors=require('cors');
const app = express();
const privateKeyPath = '/etc/letsencrypt/live/sattajodileak.com/privkey.pem';
const certificatePath = '/etc/letsencrypt/live/sattajodileak.com/fullchain.pem';
const caPath = '/etc/letsencrypt/live/sattajodileak.com/chain.pem';

const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const certificate = fs.readFileSync(certificatePath, 'utf8');
const ca = fs.readFileSync(caPath, 'utf8');

const credentials = { key: privateKey, cert: certificate, ca: ca };
const expressServer = https.createServer(credentials,app);
const io = socketIO(expressServer);
const walletRoute=require('./routes/walletRoutes')

// Import the generateAndBroadcastNumber and sendMoney functions
const { generateAndBroadcastNumber, sendMoney } = require('./controllers/generateController');
app.use(cors());
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

const MONGODB_URI = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@cluster0.zwwed4z.mongodb.net/${MONGODB_DBNAME}?retryWrites=true&w=majority`;

mongoose.connect(MONGODB_URI,{useUnifiedTopology: true, useNewUrlParser: true })
.then(console.log("mongodb connected successfully...."))
.catch(err =>console.log(err));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
});

// Import the generate route and use it under the '/api' path
const generateRoutes = require('./routes/generateRoutes');
app.use('/api', generateRoutes(io));

const userRoutes = require('./routes/userRoute');
app.use('/user', userRoutes);
app.use('/wallet',walletRoute)
// Start the Express server on port 3000
const EXPRESS_PORT = 3000;
expressServer.listen(EXPRESS_PORT, () => {
});

// Start Socket.IO on port 4000
const SOCKET_IO_PORT = 4000;
io.listen(SOCKET_IO_PORT);

// Initial call to generateAndBroadcastNumber (commented out)
// generateAndBroadcastNumber();

// Example: Send Money functionality
app.post('/api/sendMoney', express.json(), async (req, res) => {
  const { senderId, receiverId, amount } = req.body;

  try {
    await sendMoney(io, senderId, receiverId, amount);
    res.status(200).json({ message: 'Money sent successfully' });
  } catch (error) {
    console.error('Error sending money:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
