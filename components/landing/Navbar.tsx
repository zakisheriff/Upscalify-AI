'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollDirection, useMediaQuery } from '@/hooks/useUtils';

const NAV_ITEMS = [
  { label: 'features', href: '#features' },
  { label: 'how it works', href: '#how-it-works' },
  { label: 'download', href: '#download' },
];

export default function Navbar() {
  const direction = useScrollDirection();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <motion.header
        className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: direction === 'down' && window.scrollY > 300 ? -100 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="navbar__inner">
          <a href="/" className="navbar__logo">
            Upscalify
          </a>

          {!isMobile && (
            <nav className="navbar__nav">
              {NAV_ITEMS.map((item) => (
                <a key={item.href} href={item.href} className="navbar__link">
                  {item.label}
                </a>
              ))}
            </nav>
          )}

          <div className="navbar__actions">
            <a href="#download" className="navbar__cta">
              get the app
            </a>

            {isMobile && (
              <button
                className="navbar__burger"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="toggle menu"
              >
                <span className={`navbar__burger-line ${mobileOpen ? 'open' : ''}`} />
                <span className={`navbar__burger-line ${mobileOpen ? 'open' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && isMobile && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <nav className="mobile-menu__nav">
              {NAV_ITEMS.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className="mobile-menu__link"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
