import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Al-Rawabi Travel & Tours B2B Portal | Dubai & Saudi Arabia Specialist',
  description: 'Enterprise Travel Agency portal for group ticketing, real-time airline seat inventory, group block allotment management, and specialized Dubai & Saudi Arabia visa assistance.',
  openGraph: {
    title: 'Al-Rawabi Travel & Tours B2B Portal | Dubai & Saudi Arabia Specialist',
    description: 'Enterprise Travel Agency portal for group ticketing, real-time airline seat inventory, group block allotment management, and specialized Dubai & Saudi Arabia visa assistance.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Al-Rawabi Travel & Tours B2B Portal',
    description: 'Enterprise Travel Agency portal for group ticketing and Dubai & Saudi Arabia visa assistance.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
