import { decodeJwt } from 'jose';

export function decodeAccessToken(token) {
  try {
    return decodeJwt(token);
  } catch {
    return null;
  }
}

export function buildAuthUser(token) {
  const payload = decodeAccessToken(token);
  if (!payload) return null;

  const roles = Array.isArray(payload.role)
    ? payload.role
    : payload.role
    ? [payload.role]
    : [];

  return {
    id: payload.sub,
    email: payload.email,
    username: payload.username ?? null,
    roles,
    profileType: payload.profile_type ?? '',
    tokenExpiry: new Date(payload.exp * 1000),
  };
}

export function isTokenExpiringSoon(expiry, thresholdSeconds = 90) {
  return expiry.getTime() - Date.now() < thresholdSeconds * 1000;
}

export const hasRole = (user, role) => user?.roles.includes(role) ?? false;

export const hasAnyRole = (user, roles) =>
  roles.some(r => user?.roles.includes(r)) ?? false;

export const hasAllRoles = (user, roles) =>
  roles.every(r => user?.roles.includes(r)) ?? false;
