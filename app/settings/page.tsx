import type { Metadata } from 'next';
import { SettingsView } from '@/components/settings/SettingsView';
import { constructMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'Workspace Settings & Data Management',
  description:
    'Configure prompt formatting defaults, theme appearance, and export/import local IndexedDB backups.',
  canonicalPath: '/settings'
});

export default function SettingsPage() {
  return <SettingsView />;
}
