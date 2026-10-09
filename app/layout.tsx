import type { Metadata } from 'next';
import '../styles/globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/Toast';
import {
  constructMetadata,
  generateSoftwareApplicationSchema
} from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'PromptForge | AI Prompt Builder & Meta-Prompting Studio',
  description:
    'Build, customize, structure, and export high-performance prompts for AI software engineers, coding agents (Cursor, Windsurf, Claude Code, Cline), and development workflows.',
  canonicalPath: '/'
});

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generateSoftwareApplicationSchema();

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('promptforge_theme')==='light'){document.documentElement.setAttribute('data-theme','light');}}catch(_){}`
          }}
        />
      </head>
      <body>
        <ToastProvider>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
