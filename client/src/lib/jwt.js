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

  const roleClaim =
    payload.role ??
    payload.roles ??
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

  const roles = Array.isArray(roleClaim)
    ? roleClaim
    : roleClaim
      ? [roleClaim]
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

const normalize = (value) => String(value ?? '').trim().toLowerCase();

export const hasRole = (user, role) =>
  user?.roles?.some((r) => normalize(r) === normalize(role)) ?? false;

export const hasAnyRole = (user, roles) =>
  roles.some((r) => hasRole(user, r)) ?? false;

export const hasAllRoles = (user, roles) =>
  roles.every((r) => hasRole(user, r)) ?? false;
