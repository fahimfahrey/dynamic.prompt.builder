import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PromptBuilderWorkspace } from '@/components/builder/PromptBuilderWorkspace';
import { constructMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'PromptForge | AI Prompt Builder & Meta-Prompting Studio',
  description:
    'Build, customize, structure, and export high-performance prompts for AI software engineers, coding agents (Cursor, Windsurf, Claude Code, Cline), and development workflows.',
  canonicalPath: '/'
});

interface HomePageProps {
  searchParams: Promise<{ prompt?: string; template?: string; action?: string }>;
}

async function WorkspaceLoader({ searchParams }: { searchParams: Promise<{ prompt?: string; template?: string; action?: string }> }) {
  const params = await searchParams;
  return (
    <PromptBuilderWorkspace
      initialPromptId={params?.prompt}
      initialTemplateId={params?.template}
    />
  );
}

export default function HomePage({ searchParams }: HomePageProps) {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading Prompt Builder Workspace...
        </div>
      }
    >
      <WorkspaceLoader searchParams={searchParams} />
    </Suspense>
  );
}
