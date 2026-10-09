import type { Metadata } from 'next';
import { TemplatesView } from '@/components/templates/TemplatesView';
import { constructMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'Prompt Blueprints & Templates Catalog',
  description:
    'Pre-built engineering prompts for application building, codebase refurbishment, debugging, design systems, and architecture planning.',
  canonicalPath: '/templates'
});

export default function TemplatesPage() {
  return <TemplatesView />;
}
