const ALLOWED_USER_ROLES = ['service_provider', 'client'];
const ADMIN_ROLE = 'admin';

export function getActorFromHeaders(headers) {
  const role = headers.get('x-user-role');
  const userId = headers.get('x-user-id');
  const userName = headers.get('x-user-name') || 'Unknown User';

  return {
    role,
    userId,
    userName,
    isActorAllowed: ALLOWED_USER_ROLES.includes(role),
    isAdmin: role === ADMIN_ROLE,
  };
}

export function requireActorAccess(actor) {
  if (!actor.userId || !actor.isActorAllowed) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ message: 'Only Service Providers and Clients can perform this action.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  return { ok: true };
}

export function requireAdminAccess(actor) {
  if (!actor.userId || !actor.isAdmin) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ message: 'Only System Administrators can access this resource.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  return { ok: true };
}
