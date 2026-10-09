import type { Metadata } from 'next';
import { PromptLibraryView } from '@/components/library/PromptLibraryView';
import { constructMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'Prompt Library | Saved Prompts & Blueprints',
  description:
    'Search, filter, favorite, duplicate, and export your local collection of structured AI prompts.',
  canonicalPath: '/library'
});

export default function LibraryPage() {
  return <PromptLibraryView />;
}
