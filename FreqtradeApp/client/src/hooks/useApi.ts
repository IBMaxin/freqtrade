// A custom hook for interacting with the backend API
import { useState, useEffect } from 'react';
import axios from 'axios';

export function useApi<T>(endpoint: string): { data: T | null; error: string | null; loading: boolean } {
	const [data, setData] = useState<T | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axios.get(endpoint);
				setData(response.data);
			} catch (err) {
				setError(err.message || 'Error fetching data');
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [endpoint]);

	return { data, error, loading };
}
