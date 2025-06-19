const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const client = require('./DTB/mongooseconnection')

const authrouter = require('./routes/api/auth.routes')
const postrouter = require('./routes/api/post.routes')
const userrouter = require('./routes/api/user.routes')

app.use(cors({
  origin: 'http://localhost:3000',  // hoặc '*' để cho tất cả
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));


// Middleware
app.use(bodyParser.json());

app.use('/api/', authrouter,postrouter,userrouter);


// WebSocket connection
const {onConnection} = require('./controllers/websocket.controller')
wss.on('connection',onConnection);


// Start server
const PORT = 3001;
server.listen(PORT, () => {
    if(client){
        console.log('Connect to database');
    }else{
        console.log('Not Connect to database');
    }
    console.log(`Server listening on http://localhost:${PORT}`);
});