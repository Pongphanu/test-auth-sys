// app/layout.js
import { Inter } from 'next/font/google';
import { Providers } from '@/redux/providers';
import './globals.css';

// Use Inter as the default font (since Noto Sans Thai would need to be imported)
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Authentication System',
  description: 'Full-stack authentication system for interview project',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}