import WebSocket from 'ws';

class WebSocketClient {
	private static readonly WS_HOST = 'ws://localhost:5003';
	private static websocket: WebSocket | null = null;
	private static reconnectInterval: NodeJS.Timeout | null = null;

	private constructor() { } // Prevent instantiation

	public static Init(): void {
		if (WebSocketClient.websocket) return; // Connection already established

		WebSocketClient.connect();
	}

	private static connect(): void {
		WebSocketClient.websocket = new WebSocket(WebSocketClient.WS_HOST);

		WebSocketClient.websocket.on('open', () => {
			console.log('Connected to 360SocketServer host.');
			WebSocketClient.Send({
				MESSAGE_TYPE: 0,
				MESSAGE_NAME: 3
			})
			// Clear any existing reconnect intervals
			if (WebSocketClient.reconnectInterval) {
				clearInterval(WebSocketClient.reconnectInterval);
				WebSocketClient.reconnectInterval = null;
			}
		});

		WebSocketClient.websocket.on('message', (data: WebSocket.Data) => {
			// Emit an event or perform actions on incoming messages
			console.log('Received message:', data);
		});

		WebSocketClient.websocket.on('close', () => {
			console.log('Connection closed.');

			// Try to reconnect every 10 seconds
			WebSocketClient.reconnectInterval = setInterval(() => {
				console.log('Reconnecting...');
				WebSocketClient.connect();
			}, 10000);
		});
	}

	public static Send(message: any): void {
		if (!WebSocketClient.websocket) {
			console.error('WebSocket connection is not established.');
			return;
		}

		WebSocketClient.websocket.send(JSON.stringify({
			MESSAGE_TYPE: 3,
			MESSAGE_NAME: 3,
			data: message
		}));
	}

}

export default WebSocketClient;
