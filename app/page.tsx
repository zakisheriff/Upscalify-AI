import { Studio } from "@/components/Studio";

export default function Home() {
  return (
    <main className="page">
      <h1 className="title">
        Upscalify<span className="title__script">ai</span>
      </h1>
      <p className="subtitle">
        Drop an image or video and get a sharper, higher-resolution version. Runs on your machine.
      </p>

      <Studio />

      <p className="footnote">
        An upscaler from <a href="https://theatom.lk" rel="noopener">The Atom</a>. Nothing leaves your
        machine.
      </p>
    </main>
  );
}
