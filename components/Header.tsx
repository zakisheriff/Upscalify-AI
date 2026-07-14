import Link from "next/link";

export function Header() {
  return (
    <header className="siteheader">
      <div className="container container--wide siteheader__inner">
        <Link href="/" className="wordmark" aria-label="Upscalify AI, home">
          <span className="wordmark__name">Upscalify</span>
          <span className="wordmark__by mono">by The Atom</span>
        </Link>
        <nav className="sitenav" aria-label="Primary">
          <a href="/#how">How it works</a>
          <Link href="/about">About</Link>
          <a href="/#tool" className="sitenav__cta">
            Open the tool
          </a>
        </nav>
      </div>
    </header>
  );
}
