import type { Metadata } from 'next';
import { OptimizerView } from '@/components/optimizer/OptimizerView';
import { constructMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'Prompt Quality & Heuristic Optimizer | Audit & Enhance Prompts',
  description:
    'Evaluate your software prompts against 6 engineering dimensions: role specification, XML isolation, negative guardrails, and chain-of-thought directives.',
  canonicalPath: '/optimizer'
});

export default function OptimizerPage() {
  return (
    <div style={{ padding: '2rem 1rem 5rem' }}>
      <OptimizerView />
    </div>
  );
}
