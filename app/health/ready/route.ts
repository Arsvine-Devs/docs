import { docsAuthConfigured } from '@/lib/oidc';
import { healthHeaders, readyBody } from '@arsvine/service-health';

export function GET() {
  if (!docsAuthConfigured()) {
    return Response.json(
      { status: 'not_ready', service: 'docs', reason: 'missing_configuration:DOCS_OIDC' },
      { status: 503, headers: healthHeaders },
    );
  }
  return Response.json(readyBody('docs'), { headers: healthHeaders });
}
