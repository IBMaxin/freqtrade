// A custom hook for WebSocket communication
import { useEffect, useState } from 'react';

export function useWebSocket(url: string): { data: any; error: string | null } {
	const [data, setData] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const ws = new WebSocket(url);

		ws.onmessage = (event) => {
			setData(JSON.parse(event.data));
		};

		ws.onerror = (err) => {
			setError('WebSocket error');
			console.error(err);
		};

		ws.onclose = () => {
			console.log('WebSocket connection closed');
		};

		return () => {
			ws.close();
		};
	}, [url]);

	return { data, error };
}
