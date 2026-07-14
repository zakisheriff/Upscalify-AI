'use client';

import { motion } from 'framer-motion';
import SectionReveal from './SectionReveal';

const FOOTER_LINKS = [
  {
    title: 'product',
    links: [
      { label: 'features', href: '#features' },
      { label: 'how it works', href: '#how-it-works' },
      { label: 'download', href: '#download' },
    ],
  },
  {
    title: 'resources',
    links: [
      { label: 'documentation', href: '#' },
      { label: 'github', href: '#' },
      { label: 'changelog', href: '#' },
    ],
  },
  {
    title: 'company',
    links: [
      { label: 'the atom', href: 'https://theatom.lk' },
      { label: 'privacy', href: '#' },
      { label: 'terms', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <SectionReveal>
          <div className="footer__top">
            <div className="footer__brand">
              <a href="/" className="footer__logo">Upscalify</a>
              <p className="footer__tagline">
                local-first image and video upscaling. built by The Atom.
              </p>
            </div>

            <div className="footer__links">
              {FOOTER_LINKS.map((section) => (
                <div key={section.title} className="footer__section">
                  <h4 className="footer__section-title">{section.title}</h4>
                  <ul className="footer__list">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <a href={link.href} className="footer__link">
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </SectionReveal>

        <div className="footer__bottom">
          <p className="footer__copyright">
            &copy; {new Date().getFullYear()} The Atom. all rights reserved.
          </p>
          <p className="footer__credit">
            built with next.js, real-esrgan, and seedvr2.
          </p>
        </div>
      </div>
    </footer>
  );
}
