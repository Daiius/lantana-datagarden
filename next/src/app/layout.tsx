import clsx from 'clsx';
import './global.css';

import TrpcProvider from '@/providers/TrpcProvider';

export const metadata = {
  title: 'Lantana Datagarden',
  description: 'Scientific data input form by Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={clsx(
        )}
      >
        <TrpcProvider>{children}</TrpcProvider>
      </body>
    </html>
  )
}

