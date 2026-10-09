import { Metadata } from 'next';

interface PageSeoParams {
  title?: string;
  description?: string;
  canonicalPath?: string;
  keywords?: string[];
  ogImage?: string;
}

const DEFAULT_METADATA = {
  siteName: 'PromptForge',
  defaultTitle: 'PromptForge | AI Prompt Builder & Meta-Prompting Studio',
  defaultDescription:
    'Design, organize, customize, and export high-performance prompts for AI software engineers, coding agents (Cursor, Windsurf, Claude Code, Cline), and development workflows.',
  keywords: [
    'prompt builder',
    'meta prompting',
    'AI coding agents',
    'developer prompts',
    'Cursor rules',
    'Windsurf prompts',
    'Claude 3.7 Sonnet prompts',
    'software development prompts',
    'system architecture prompts'
  ],
  ogImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
};

export function constructMetadata({
  title,
  description,
  canonicalPath = '',
  keywords,
  ogImage
}: PageSeoParams = {}): Metadata {
  const pageTitle = title
    ? `${title} | ${DEFAULT_METADATA.siteName}`
    : DEFAULT_METADATA.defaultTitle;

  const pageDescription = description || DEFAULT_METADATA.defaultDescription;
  const canonicalUrl = `https://promptforge.dev${canonicalPath}`;
  const image = ogImage || DEFAULT_METADATA.ogImageUrl;
  const pageKeywords = keywords || DEFAULT_METADATA.keywords;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords,
    authors: [{ name: 'PromptForge Engineering Team' }],
    creator: 'PromptForge',
    publisher: 'PromptForge',
    metadataBase: new URL('https://promptforge.dev'),
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      siteName: DEFAULT_METADATA.siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: pageTitle
        }
      ],
      locale: 'en_US',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [image],
      creator: '@promptforge'
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    }
  };
}

export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'PromptForge Studio',
    operatingSystem: 'All Modern Browsers',
    applicationCategory: 'DeveloperApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    description:
      'Professional AI Prompt Builder and Meta-Prompting Studio for AI coding agents and software engineers. Build structured, deterministic prompts with local IndexedDB persistence.',
    creator: {
      '@type': 'Organization',
      name: 'PromptForge',
      url: 'https://promptforge.dev'
    }
  };
}

export function generateFaqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}
