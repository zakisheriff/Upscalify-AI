import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "About",
  description:
    "Upscalify AI is an image and video upscaler built by Zaki as part of The Atom's product family. It reconstructs detail in low-resolution files and runs locally in v1.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Upscalify AI",
    description:
      "An image and video upscaler from The Atom that reconstructs real detail in low-resolution files.",
    url: "https://upscalify.theatom.lk/about",
  },
};

export default function About() {
  return (
    <>
      <Header />
      <main id="main">
        <article className="container about">
          <h1 className="about__title">What Upscalify is, and who built it.</h1>
          <div className="about__body">
            <p>
              Upscalify AI takes a low-resolution or low-quality image or video and reconstructs a
              sharper, higher-resolution version. Instead of stretching pixels, it rebuilds edges and
              texture that stay faithful to what the source already contains, so the result reads as
              genuinely more detailed rather than simply larger.
            </p>
            <p>
              Images are reconstructed in a single pass. Video is reconstructed frame by frame, with
              each frame checked against its neighbours so motion stays steady, then reassembled with
              its original audio intact.

            </p>

            <h2 className="about__h2">Who made it</h2>
            <p>
              Upscalify was built by Zaki as part of The Atom, a small studio that ships focused
              software products. It sits alongside The Atom&apos;s other work and shares its plain,
              build-it-properly approach: no accounts to sign up for, no upsell, just a tool that does
              one thing well.
            </p>

            <h2 className="about__h2">How it runs today</h2>
            <p>
              This version runs entirely on your own machine against an on-device engine. Your files
              are never sent to a third-party service. A later phase will move the heavy
              reconstruction to a hosted backend for people without the hardware to run it locally —
              the product is built so that shift changes nothing you can see.
            </p>

            <Link href="/" className="about__back">
              Back to the tool
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
