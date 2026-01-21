'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import StaggeredMenu, { StaggeredMenuHandle } from './staggered-menu';

const menuItems = [
  { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
  {
    label: 'About',
    ariaLabel: 'Learn about us',
    link: '/about'
  },
  {
    label: 'Services',
    ariaLabel: 'View our services',
    link: '#',
    children: [
      { label: 'BGV Services', ariaLabel: 'BGV Services', link: '/services/bgv' },
      { label: 'HR Services', ariaLabel: 'HR Services', link: '/services/hr' },
      { label: 'Recruitment', ariaLabel: 'Recruitment', link: '/services/recruitment' },
      { label: 'Payroll', ariaLabel: 'Payroll', link: '/services/payroll' },
      { label: 'Company Formation', ariaLabel: 'Company Formation', link: '/services/company-formation' },
      { label: 'Startup Support', ariaLabel: 'Startup Support', link: '/services/startup-support' },
      { label: 'Director Services', ariaLabel: 'Director Services', link: '/services/director-services' },
    ]
  },
  {
    label: 'Technology',
    ariaLabel: 'Technology',
    link: '/technology'
  },
  { label: 'BGV Process', ariaLabel: 'View our process', link: '/process' },
  { label: 'FAQ', ariaLabel: 'View FAQ', link: '/faq' },
  { label: 'Contact', ariaLabel: 'Get in touch', link: '/contact' }
];

const socialItems = [
  { label: 'Facebook', link: 'https://www.facebook.com/profile.php?id=61577141807829' },
  { label: 'LinkedIn', link: 'https://linkedin.com/company/ontriq' },
  { label: 'Instagram', link: 'https://www.instagram.com/ontriq._/' }
];

export default function Navbar() {
  const menuRef = useRef<StaggeredMenuHandle>(null);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const isContactPage = pathname === '/contact';
  const [isScrolled, setIsScrolled] = useState(false);
  const isHomePage = pathname === '/';
  const useWhiteLinks = isHomePage && !isScrolled;

  const servicesDropdownItems = [
    { label: 'BGV Services', href: '/services/bgv' },
    { label: 'HR Services', href: '/services/hr' },
    { label: 'Recruitment', href: '/services/recruitment' },
    { label: 'Payroll', href: '/services/payroll' },
    { label: 'Company Formation', href: '/services/company-formation' },
  ];

  const isNavActive = useCallback(
    (href: string) => {
      if (!pathname) return false;
      if (href === '/') return pathname === '/';
      return pathname === href || pathname.startsWith(href + '/');
    },
    [pathname]
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    // Only trigger if clicking on the container itself, not the menu button
    if ((e.target as HTMLElement).closest('.sm-toggle')) return;
    menuRef.current?.open();
  }, []);

  return (
    <div className={`fixed left-0 right-0 z-50 flex w-full items-center transition-all duration-300 ${isScrolled
        ? 'top-4 px-4 md:px-12 lg:px-16'
        : 'top-6 px-4 md:px-12 lg:px-16'
      }`}>
      <div className={`flex w-full items-center justify-between transition-all duration-300 ${isScrolled
          ? 'rounded-2xl border border-gray-200 bg-white/95 shadow-lg backdrop-blur-md px-4 md:px-6 py-3'
          : 'px-0 py-0'
        }`}>
        <div className="flex items-center">
          <Link
            href="/"
            className={`flex items-center px-2 pb-1 overflow-hidden transition-all duration-300 ${isContactPage
                ? ''
                : isScrolled
                  ? ''
                  : 'rounded-2xl border border-gray-200 bg-white/80 shadow-sm backdrop-blur-md'
              }`}
            aria-label="Ontriq - Go to homepage"
          >
            <Image
              src="/ontriq-logo.png"
              alt="Ontriq Logo"
              width={150}
              height={64}
              className="h-12 md:h-16 w-auto object-contain -mt-1"
              priority
            />
          </Link>
        </div>

        <div
          className={`hidden lg:flex items-center gap-20 xl:gap-24 px-5 py-2 transition-all duration-300 ${useWhiteLinks
              ? ''
              : isContactPage
                ? ''
                : isScrolled
                  ? ''
                  : 'rounded-xl border border-gray-200 bg-white/80 shadow-sm backdrop-blur-md'
            }`}
          aria-label="Primary links"
        >
          <Link
            href="/about"
            className={`text-xl font-semibold uppercase tracking-tighter leading-none transition-colors ${useWhiteLinks
                ? isNavActive('/about')
                  ? 'text-white underline underline-offset-4'
                  : 'text-white/90 hover:text-white'
                : isNavActive('/about')
                  ? 'text-black underline underline-offset-4'
                  : 'text-gray-900/90 hover:text-black'
              }`}
          >
            About
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`text-xl font-semibold uppercase tracking-tighter leading-none transition-colors ${useWhiteLinks
                    ? isNavActive('/services')
                      ? 'text-white underline underline-offset-4'
                      : 'text-white/90 hover:text-white'
                    : isNavActive('/services')
                      ? 'text-black underline underline-offset-4'
                      : 'text-gray-900/90 hover:text-black'
                  }`}
                aria-label="Services"
              >
                Services
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={10}
              className="min-w-[220px]"
            >
              {servicesDropdownItems.map((item) => (
                <div key={item.href}>
                  <DropdownMenuItem asChild>
                    <Link href={item.href} className="w-full cursor-pointer">
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link
            href="/contact"
            className={`text-xl font-semibold uppercase tracking-tighter leading-none transition-colors ${useWhiteLinks
                ? isNavActive('/contact')
                  ? 'text-white underline underline-offset-4'
                  : 'text-white/90 hover:text-white'
                : isNavActive('/contact')
                  ? 'text-black underline underline-offset-4'
                  : 'text-gray-900/90 hover:text-black'
              }`}
          >
            Contact
          </Link>
        </div>



        <nav
          ref={navRef}
          className={`inline-flex items-center px-4 py-2 cursor-pointer ${isContactPage
              ? ''
              : isScrolled
                ? ''
                : 'rounded-xl border border-gray-200 bg-white/80 shadow-sm backdrop-blur-md'
            }`}
          onClick={handleContainerClick}
          aria-label="Main navigation"
        >
          <StaggeredMenu
            ref={menuRef}
            navContainerRef={navRef}
            items={menuItems}
            socialItems={socialItems}
            colors={['#FF8918', '#0098F3']}
            accentColor="#FF8918"
            menuButtonColor="#000"
            openMenuButtonColor="#000"
            className="z-[10000] w-full"
          />
        </nav>
      </div>
    </div>
  );
}
