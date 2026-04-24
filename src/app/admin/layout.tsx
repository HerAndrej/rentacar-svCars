import { Montserrat, Inter } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-montserrat',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'SV Cars Admin',
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hr" className={`${montserrat.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-bg-primary text-text-primary font-[family-name:var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}
