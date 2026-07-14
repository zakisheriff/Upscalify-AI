import Link from "next/link";

export function Footer() {
  return (
    <footer className="sitefooter">
      <div className="container container--wide sitefooter__inner">
        <div>
          <p className="sitefooter__mark">Upscalify</p>
          <p className="muted sitefooter__line">
            An image and video upscaler from The Atom. Runs on your own machine in v1.
          </p>
        </div>
        <nav className="sitefooter__nav" aria-label="Footer">
          <a href="/#tool">Open the tool</a>
          <a href="/#how">How it works</a>
          <Link href="/about">About</Link>
          <a href="https://theatom.lk" rel="noopener">The Atom</a>
        </nav>
        <p className="mono muted sitefooter__meta">© {new Date().getFullYear()} The Atom · upscalify.theatom.lk</p>
      </div>
    </footer>
  );
}
