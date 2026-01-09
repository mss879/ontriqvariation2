import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import SiteChrome from '@/components/site-chrome';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const stackSans = localFont({
  src: '../public/StackSansNotch-VariableFont_wght.ttf',
  variable: '--font-stack-sans',
  display: 'swap',
  preload: true,
});

const siteUrl = 'https://www.ontriq.com';
const siteName = 'Ontriq';
const siteDescription = 'Sri Lanka\'s leading Background Verification, HR Solutions, Recruitment, Payroll Management, and Business Formation services. Complete workforce and business partner delivering results in 7 working days.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Ontriq | Sri Lanka\'s Premier Background Verification & HR Solutions',
    template: '%s | Ontriq'
  },
  description: siteDescription,
  keywords: [
    'background verification',
    'BGV services',
    'HR solutions',
    'human resource management',
    'talent recruitment',
    'payroll management',
    'company formation',
    'business setup Sri Lanka',
    'employee verification',
    'workforce solutions',
    'BPO services',
    'Konnect BPO',
    'Sri Lanka HR'
  ],
  authors: [{ name: 'Ontriq', url: siteUrl }],
  creator: 'Ontriq',
  publisher: 'Ontriq (PVT) LTD',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/ontriq-favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/ontriq-favicon.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/ontriq-favicon.png',
    shortcut: '/ontriq-favicon.png',
  },
  manifest: '/manifest.json',
  verification: {
    google: 'RCUaE3IZIwi-RJrI4jNO6VhLIEXWxd_denItvb4J9r8',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: siteName,
    title: 'Ontriq | Your Complete Workforce and Business Partner',
    description: siteDescription,
    images: [
      {
        url: '/share-img.png',
        width: 1200,
        height: 630,
        alt: 'Ontriq',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ontriq | Sri Lanka\'s Premier Background Verification & HR Solutions',
    description: siteDescription,
    images: ['/share-img.png'],
    creator: '@ontriq',
  },
  alternates: {
    canonical: siteUrl,
  },
  category: 'business',
};

// JSON-LD structured data for organization
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Ontriq',
  alternateName: 'Ontriq (PVT) LTD',
  url: siteUrl,
  logo: `${siteUrl}/share-img.png`,
  description: siteDescription,
  foundingDate: '2025',
  parentOrganization: {
    '@type': 'Organization',
    name: 'Konnect BPO Technologies (PVT) LTD',
  },
  sameAs: [
    'https://twitter.com/ontriq',
    'https://linkedin.com/company/ontriq',
    'https://instagram.com/ontriq',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['English'],
  },
  areaServed: {
    '@type': 'Country',
    name: 'Sri Lanka',
  },
  serviceType: [
    'Background Verification',
    'Human Resource Solutions',
    'Talent Recruitment',
    'Payroll Management',
    'Business Formation',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://framerusercontent.com" />
        <link rel="dns-prefetch" href="https://framerusercontent.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} ${stackSans.variable}`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded">
          Skip to main content
        </a>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
