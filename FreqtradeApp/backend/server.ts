import express from 'express';
import http from 'http';
import { setupWebSocket } from './routes';

const app = express();
const server = http.createServer(app);

// Setup WebSocket
setupWebSocket(server);

server.listen(3000, () => {
	console.log('Server is running on port 3000');
});