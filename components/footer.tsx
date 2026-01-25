import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 pt-20 pb-10" role="contentinfo">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <Link
              href="/"
              className="inline-flex items-center px-2 pb-1 overflow-hidden rounded-2xl border border-gray-200 bg-white/80 shadow-sm backdrop-blur-md w-fit"
              aria-label="Ontriq - Go to homepage"
            >
              <Image
                src="/ontriq-logo.png"
                alt="Ontriq Logo"
                width={150}
                height={64}
                className="h-16 w-auto object-contain -mt-1"
                loading="lazy"
              />
            </Link>
            <p className="text-zinc-400 leading-relaxed max-w-sm">
              Your trusted partner for comprehensive workforce solutions and business growth. We build the future together.
            </p>
            <nav aria-label="Social media links">
              <ul className="flex gap-4">
                <li><SocialLink href="https://www.facebook.com/profile.php?id=61577141807829" icon={Facebook} label="Follow us on Facebook" /></li>
                <li><SocialLink href="https://www.instagram.com/ontriq._/" icon={Instagram} label="Follow us on Instagram" /></li>
                <li><SocialLink href="https://linkedin.com/company/ontriq" icon={Linkedin} label="Connect on LinkedIn" /></li>
              </ul>
            </nav>
          </div>

          {/* Menu Columns */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Links */}
            <nav aria-label="Company links">
              <h3 className="text-white font-semibold mb-6 text-lg">Company</h3>
              <ul className="space-y-4">
                <FooterLink href="/">Home</FooterLink>
                <FooterLink href="/about">About</FooterLink>
                <FooterLink href="/process">Process</FooterLink>
                <FooterLink href="/industries">Industries</FooterLink>
                <FooterLink href="/faq">FAQ</FooterLink>
                <FooterLink href="/contact">Contact</FooterLink>
              </ul>
            </nav>

            {/* Services */}
            <nav aria-label="Services links">
              <h3 className="text-white font-semibold mb-6 text-lg">Services</h3>
              <ul className="space-y-4">
                <FooterLink href="/services/bgv">BGV Services</FooterLink>
                <FooterLink href="/services/hr">HR Services</FooterLink>
                <FooterLink href="/services/recruitment">Recruitment</FooterLink>
                <FooterLink href="/services/payroll">Payroll</FooterLink>
                <FooterLink href="/services/company-formation">Company Formation</FooterLink>
                <FooterLink href="/services/startup-support">Startup Support</FooterLink>
                <FooterLink href="/services/director-services">Director Services</FooterLink>
              </ul>
            </nav>

            {/* Technology */}
            <nav aria-label="Technology links">
              <h3 className="text-white font-semibold mb-6 text-lg">Technology</h3>
              <ul className="space-y-4">
                <FooterLink href="/technology/infrastructure">Infrastructure</FooterLink>
                <FooterLink href="/technology/specifications">Specifications</FooterLink>
                <FooterLink href="/technology/security">Info Security</FooterLink>
                <FooterLink href="/technology/continuity">Continuity Plan</FooterLink>
                <FooterLink href="/technology/confidentiality">Confidentiality</FooterLink>
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-zinc-500">
          <p>
            © {new Date().getFullYear()} Ontriq. All rights reserved.
          </p>

          <div className="flex items-center gap-2">
            <span>Made by</span>
            <Link href="https://www.arcai.agency" target="_blank" rel="noopener noreferrer">
              <Image
                src="/arcai-logo.png"
                alt="ARC AI"
                width={44}
                height={44}
                className="h-11 w-auto"
                loading="lazy"
              />
            </Link>
          </div>

          <p>
            Powered by Next.js
          </p>

          {/* Admin link hidden */}
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <Link
      href={href}
      className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-[#F75834] hover:text-white transition-all duration-300"
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
    </Link>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-zinc-400 hover:text-[#F75834] transition-colors inline-flex items-center gap-2 group"
      >
        <span className="w-0 group-hover:w-2 h-[1px] bg-[#F75834] transition-all duration-300"></span>
        {children}
      </Link>
    </li>
  );
}
