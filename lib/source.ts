import { loader } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';

const publicDocs = defineDocs({ dir: 'content/public' });
const referenceDocs = defineDocs({ dir: 'content/reference' });

export const publicSource = loader({
  baseUrl: '/guide',
  source: publicDocs.toFumadocsSource(),
});

export const referenceSource = loader({
  baseUrl: '/reference',
  source: referenceDocs.toFumadocsSource(),
});
