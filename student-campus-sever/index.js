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
const friend_rqrouter = require('./routes/api/friendrq.routes')
const grouprouter = require('./routes/api/group.routes')
const chatrouter = require('./routes/api/chat.routes')
const notificationrouter = require('./routes/api/notifications.routes') 
const documentrouter = require('./routes/api/document.routes')  

app.use(cors({
    origin: ['https://student-campus.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// Middleware
app.use(bodyParser.json());

app.use('/api/', authrouter,postrouter,userrouter,friend_rqrouter,grouprouter,chatrouter,notificationrouter,documentrouter);


// WebSocket connection
const {onConnection} = require('./controllers/websocket.controller')
wss.on('connection',onConnection);


app.get('/', (req, res) => {
    res.send('helloworld');
});

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
