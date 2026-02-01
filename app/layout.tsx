import './globals.css';
import type { Metadata } from 'next';
import Sidebar from './components/Sidebar';

export const metadata: Metadata = {
  title: 'Ledgerly',
  description: 'Local-first finance tracker'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-surface-1 text-text">
          <div className="flex">
            <Sidebar />
            <main className="flex-1 px-8 py-10">
              <div className="mx-auto max-w-6xl space-y-8">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
