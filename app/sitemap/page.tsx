import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sitemap | Ontriq',
  description: 'Navigate through all pages on Ontriq website. Find services, technology, and company information easily.',
}

export default function SitemapPage() {
  const sections = [
    {
      title: 'Company',
      links: [
        { name: 'Home', href: '/' },
        { name: 'About Us', href: '/about' },
        { name: 'Process', href: '/process' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'FAQ', href: '/faq' },
      ],
    },
    {
      title: 'Services',
      links: [
        { name: 'Services Overview', href: '/services' },
        { name: 'Background Verification', href: '/services/bgv' },
        { name: 'Company Formation', href: '/services/company-formation' },
        { name: 'Director Services', href: '/services/director-services' },
        { name: 'HR Solutions', href: '/services/hr' },
        { name: 'Payroll Management', href: '/services/payroll' },
        { name: 'Recruitment', href: '/services/recruitment' },
        { name: 'Startup Support', href: '/services/startup-support' },
      ],
    },
    {
      title: 'Technology & Standards',
      links: [
        { name: 'Technology Overview', href: '/technology' },
        { name: 'Confidentiality', href: '/technology/confidentiality' },
        { name: 'Business Continuity', href: '/technology/continuity' },
        { name: 'Infrastructure', href: '/technology/infrastructure' },
        { name: 'Security', href: '/technology/security' },
        { name: 'Specifications', href: '/technology/specifications' },
      ],
    },
  ]

  return (
    <main className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Sitemap</h1>
        <p className="text-muted-foreground mb-12">
          Explore the complete structure of our website and find exactly what you are looking for.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
          {sections.map((section) => (
            <div key={section.title} className="space-y-6">
              <h2 className="text-xl font-bold border-b border-border pb-2 text-primary">{section.title}</h2>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
