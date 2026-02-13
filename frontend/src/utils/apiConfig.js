let apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
if (apiUrl && !apiUrl.startsWith('http')) {
    apiUrl = `https://${apiUrl}`;
}
export const API_BASE_URL = apiUrl.replace(/\/$/, '');
