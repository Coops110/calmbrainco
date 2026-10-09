// Shared JSON-LD builders. Every page includes the Organization + WebSite
// nodes (HANDOFF.md problem #7: structured data was only a thin Product +
// FAQPage). Honesty constraints from the research: no review, aggregateRating,
// priceValidUntil, shipping or return policy nodes anywhere (none of it is real).

export const SITE = 'https://calmbrainco.shop';

export function abs(path: string): string {
  if (path.startsWith('http')) return path;
  return `${SITE}${path.startsWith('/') ? path : `/${path}`}`;
}

export const organizationNode = {
  '@type': 'OnlineStore',
  '@id': `${SITE}/#organization`,
  name: 'Calm Brain Co',
  url: `${SITE}/`,
  description:
    'Calm Brain Co makes undated printable planners for ADHD brains, sold as instant PDF downloads (US Letter and A4 included) through Gumroad and Payhip.',
  logo: {
    '@type': 'ImageObject',
    '@id': `${SITE}/#logo`,
    url: `${SITE}/icon-512.png`,
    contentUrl: `${SITE}/icon-512.png`,
    width: 512,
    height: 512,
    caption: 'Calm Brain Co',
  },
  sameAs: ['https://www.pinterest.com/coops110110/', 'https://cooperhawk64.gumroad.com'],
};

export const websiteNode = {
  '@type': 'WebSite',
  '@id': `${SITE}/#website`,
  url: `${SITE}/`,
  name: 'Calm Brain Co',
  alternateName: ['calmbrainco.shop'],
  inLanguage: 'en',
  publisher: { '@id': `${SITE}/#organization` },
};

export function breadcrumbNode(canonicalUrl: string, items: Array<{ name: string; url?: string }>) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

export function faqNode(canonicalUrl: string, faq: Array<{ q: string; a: string }>) {
  return {
    '@type': 'FAQPage',
    '@id': `${canonicalUrl}#faq`,
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

export function graph(nodes: unknown[]) {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) });
}
