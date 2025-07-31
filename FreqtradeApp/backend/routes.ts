import { Server } from 'ws';

// ...existing code...

export function setupWebSocket(server: any) {
	const wss = new Server({ server });

	wss.on('connection', (ws) => {
		console.log('WebSocket connection established');

		// Example: Send real-time updates
		const interval = setInterval(() => {
			ws.send(JSON.stringify({ message: 'Real-time update', timestamp: new Date() }));
		}, 5000);

		ws.on('close', () => {
			console.log('WebSocket connection closed');
			clearInterval(interval);
		});
	});
}