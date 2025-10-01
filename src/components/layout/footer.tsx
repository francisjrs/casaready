'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/language-context';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const { t } = useLanguage();
  const services = [
    'First-Time Buyers',
    'ITIN Support',
    'Bilingual Service',
    'Market Analysis'
  ];

  const serviceAreas = [
    'Austin',
    'Round Rock',
    'Pflugerville',
    'Georgetown',
    'Hutto',
    'Cedar Park'
  ];

  return (
    <footer className={cn(
      'bg-slate-800 text-white',
      className
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1 text-center md:text-left">
            <div className="mb-6 sm:mb-4">
              <Image
                src="/images/Logo_stacked.png"
                alt="Sully Ruiz Real Estate - Keller Williams Austin NW"
                width={200}
                height={96}
                className="h-16 sm:h-20 w-auto filter brightness-0 invert mb-4 mx-auto md:mx-0"
              />
            </div>
            <p className="text-gray-300 text-base sm:text-sm mb-6 sm:mb-4 leading-relaxed max-w-xs mx-auto md:max-w-none md:mx-0">
              Your trusted bilingual REALTOR® specializing in first-time buyers, ITIN clients, and Austin area real estate.
            </p>
            <div className="text-sm sm:text-xs text-yellow-400 font-medium">
              Servicio en Español
            </div>
          </div>

          {/* Services Section */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold text-base sm:text-sm mb-4 sm:mb-3">{t('components.footer.services.title')}</h3>
            <ul className="space-y-3 sm:space-y-2">
              {services.map((service, index) => (
                <li key={index}>
                  <span className="text-gray-300 text-base sm:text-sm hover:text-white transition-colors cursor-pointer block">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold text-base sm:text-sm mb-4 sm:mb-3">{t('components.footer.serviceAreas.title')}</h3>
            <ul className="space-y-3 sm:space-y-2">
              {serviceAreas.map((area, index) => (
                <li key={index}>
                  <span className="text-gray-300 text-base sm:text-sm block">
                    {area}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold text-base sm:text-sm mb-4 sm:mb-3">{t('components.footer.contact.title')}</h3>
            <div className="space-y-4 sm:space-y-3">
              <div className="flex items-center gap-3 sm:gap-2 justify-center md:justify-start">
                <Mail className="h-5 w-5 sm:h-4 sm:w-4 text-yellow-400 flex-shrink-0" />
                <a
                  href="mailto:realtor@sullyruiz.com"
                  className="text-gray-300 text-base sm:text-sm hover:text-white transition-colors"
                >
                  realtor@sullyruiz.com
                </a>
              </div>
              <div className="flex items-center gap-3 sm:gap-2 justify-center md:justify-start">
                <Phone className="h-5 w-5 sm:h-4 sm:w-4 text-yellow-400 flex-shrink-0" />
                <a
                  href="tel:+15124122352"
                  className="text-gray-300 text-base sm:text-sm hover:text-white transition-colors"
                >
                  (512) 412-2352
                </a>
              </div>
              <div className="flex items-center gap-3 sm:gap-2 justify-center md:justify-start">
                <MapPin className="h-5 w-5 sm:h-4 sm:w-4 text-yellow-400 flex-shrink-0" />
                <span className="text-gray-300 text-base sm:text-sm">
                  Licensed in Texas
                </span>
              </div>
              <div className="text-sm sm:text-xs text-gray-400 mt-4 sm:mt-3 space-y-1">
                <div>Keller Williams Austin NW</div>
                <div>WhatsApp Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Footer */}
        <div className="border-t border-gray-700 mt-10 sm:mt-8 pt-8 sm:pt-6">
          {/* Texas Legal Links */}
          <div className="flex flex-col gap-4 sm:gap-2 sm:flex-row justify-center items-center mb-6 sm:mb-4 text-sm sm:text-xs text-gray-400">
            <a
              href="https://drive.google.com/file/d/1xVposC473jv5O_6f2ulLD3NEq-mcPJ0q/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors text-center leading-relaxed"
            >
              Texas Real Estate Commission Consumer Protection Notice
            </a>
            <span className="hidden sm:inline text-gray-600">|</span>
            <a
              href="https://drive.google.com/file/d/1xVposC473jv5O_6f2ulLD3NEq-mcPJ0q/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors text-center leading-relaxed"
            >
              Texas Real Estate Commission Information About Brokerage Services
            </a>
          </div>

          {/* Additional Legal Links */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-2 justify-center items-center mb-6 sm:mb-4 text-sm sm:text-xs text-gray-400">
            <a href="https://legal.kw.com/termsofuse" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Terms of Use</a>
            <span className="hidden sm:inline text-gray-600">|</span>
            <a href="https://legal.kw.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacy Policy</a>
            <span className="hidden sm:inline text-gray-600">|</span>
            <a href="https://legal.kw.com/cookie-policy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Cookie Policy</a>
            <span className="hidden sm:inline text-gray-600">|</span>
            <a href="https://legal.kw.com/dmca" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">DMCA</a>
            <span className="hidden sm:inline text-gray-600">|</span>
            <a href="https://legal.kw.com/fairhousing" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Fair Housing</a>
            <span className="hidden sm:inline text-gray-600">|</span>
            <a href="https://legal.kw.com/accessibility" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Accessibility</a>
          </div>

          {/* Corporate Text */}
          <div className="text-center text-sm sm:text-xs text-gray-400 mb-8 sm:mb-6 max-w-4xl mx-auto leading-relaxed space-y-3 sm:space-y-2">
            <p>
              Keller Williams Realty, Inc., a franchise company, is an Equal Opportunity Employer and supports the Fair Housing Act.
              Each Keller Williams® office is independently owned and operated.
            </p>
            <p>
              Copyright © 1996-2025 Keller Williams Realty, Inc. All rights reserved.
            </p>
          </div>

          {/* Bottom Copyright */}
          <div className="text-center">
            <p className="text-gray-400 text-sm sm:text-xs">
              © 2025 Sully Ruiz, REALTOR®. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}