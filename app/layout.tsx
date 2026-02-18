import type {Metadata} from 'next';
import {Inter, JetBrains_Mono} from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Prompt IDE',
  description: 'Hyper-minimalist Prompt IDE & Context Visualizer',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-zinc-950 text-zinc-50 antialiased h-screen w-screen overflow-hidden selection:bg-indigo-500/30">
        {children}
      </body>
    </html>
  );
}
