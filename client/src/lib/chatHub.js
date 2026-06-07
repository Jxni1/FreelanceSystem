import * as signalR from '@microsoft/signalr';

export function createChatConnection(getToken) {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) {
    console.error('[CHAT] Missing VITE_API_URL');
    return null;
  }

  const hubUrl = `${apiUrl.replace(/\/api\/?$/, '')}/hubs/chat`;

  return new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => {
        const token = typeof getToken === 'function' ? getToken() : getToken;
        return token || '';
      },
    })
    .withAutomaticReconnect()
    .build();
}
