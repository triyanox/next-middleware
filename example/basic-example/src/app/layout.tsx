import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '@triyanox/next-middlewares - Basic Example',
  description:
    'This is a basic example using @triyanox/next-middlewares with next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="bg-white" lang="en">
      <body className={inter.className}>
        <div className="h-[50rem] w-full min-h-screen bg-white bg-grid-black/[0.06] relative flex items-center justify-center">
          <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
          {children}
        </div>
      </body>
    </html>
  );
}
