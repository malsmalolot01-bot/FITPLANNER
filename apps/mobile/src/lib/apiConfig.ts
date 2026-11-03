const configuredAuthUrl = import.meta.env.VITE_API_URL;
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = (
  configuredBaseUrl
  || (configuredAuthUrl ? configuredAuthUrl.replace(/\/auth\.php(?:\?.*)?$/i, '') : 'http://localhost/api')
).replace(/\/+$/, '');

export const AUTH_API_URL = configuredAuthUrl || `${API_BASE_URL}/auth.php`;
