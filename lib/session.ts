import { cookies } from 'next/headers';
import { SESSION_COOKIE, canReadInternal, readSession } from './oidc';

export async function currentInternalSession() {
  const jar = await cookies();
  const session = readSession(jar.get(SESSION_COOKIE)?.value);
  return canReadInternal(session) ? session : null;
}
