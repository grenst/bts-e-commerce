export async function fetchCustomerToken(email: string, password: string): Promise<string> {
    const authUrl = import.meta.env.VITE_CTP_AUTH_URL;
    const projectKey = import.meta.env.VITE_CTP_PROJECT_KEY;
    const clientId = import.meta.env.VITE_CTP_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_CTP_CLIENT_SECRET;
    const scopes = import.meta.env.VITE_CTP_SCOPES?.replace('{projectKey}', projectKey);
  
    if (!authUrl || !projectKey || !clientId || !clientSecret || !scopes) {
      throw new Error('Missing required Commercetools environment variables');
    }
  
    const response = await fetch(`${authUrl}/oauth/${projectKey}/customers/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: email,
        password,
        scope: scopes,
      }),
    });
  
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch token: ${error}`);
    }
  
    const data = await response.json();
    return data.access_token;
  }
  