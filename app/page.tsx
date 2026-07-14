import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Studio } from "@/components/Studio";
import { Reveal } from "@/components/Reveal";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />

        {/* The tool and the marketing surface are the same page — you scroll
            from the thesis straight into using it. */}
        <section className="section band" id="tool-band" aria-label="Upscale a file">
          <div className="container">
            <Reveal className="band__intro">
              <h2 className="band__title">Try it on your own file.</h2>
              <p className="lead">
                Choose an image or a video, pick how much reconstruction you want, and compare the
                result against the original before you download it. Nothing leaves your machine.
              </p>
            </Reveal>
            <Studio />
          </div>
        </section>

        {/* How it works — prose, not a list of features. */}
        <section className="section" id="how" aria-label="How it works">
          <div className="container how">
            <Reveal className="how__lead">
              <h2 className="how__title">Detail that was never captured, rebuilt plausibly.</h2>
              <p className="lead">
                A small image doesn&apos;t just need to be stretched — the detail has to be invented
                in a way that&apos;s faithful to what&apos;s already there. Upscalify studies the
                edges, textures, and structure it can see, then reconstructs a higher-resolution
                version around them.
              </p>
            </Reveal>

            <div className="how__grid">
              <Reveal className="how__item">
                <h3 className="how__h3">Images in a single pass</h3>
                <p className="muted">
                  An image is analyzed and reconstructed in one step. You get back the same picture
                  at a higher resolution with sharper edges and cleaner texture, not a blurred
                  enlargement.
                </p>
              </Reveal>
              <Reveal className="how__item">
                <h3 className="how__h3">Video, frame by frame</h3>
                <p className="muted">
                  Each frame is reconstructed and checked against its neighbours so motion stays
                  steady rather than shimmering. The clip is reassembled with its original audio
                  untouched.
                </p>
              </Reveal>
              <Reveal className="how__item">
                <h3 className="how__h3">Runs on your machine</h3>
                <p className="muted">
                  In this version everything happens locally against an on-device engine. Your files
                  aren&apos;t sent to a third-party service, and the result is written straight to
                  your downloads.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Quality explanation — outcome language, no model names. */}
        <section className="section band" id="quality" aria-label="Choosing a quality">
          <div className="container quality-explainer">
            <Reveal>
              <h2 className="qx__title">Two ways to reconstruct.</h2>
              <p className="lead">
                Pick by how much work the source needs, not by which engine runs underneath. The tool
                names the outcome; it handles the rest.
              </p>
            </Reveal>
            <div className="qx__grid">
              <Reveal className="qx__card">
                <h3 className="qx__h3">Fast</h3>
                <p className="muted">
                  Roughly doubles resolution and returns in seconds. The right choice for a photo
                  that&apos;s already decent or a clip you want lifted quickly.
                </p>
              </Reveal>
              <Reveal className="qx__card">
                <h3 className="qx__h3">High quality</h3>
                <p className="muted">
                  Reconstructs more aggressively at a higher scale, taking longer in exchange for a
                  cleaner result. Reach for it when the source is small, soft, or noisy.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* FAQ — real questions, mirrors the FAQPage structured data. */}
        <section className="section" id="faq" aria-label="Questions">
          <div className="container faq">
            <Reveal>
              <h2 className="faq__title">Questions.</h2>
            </Reveal>
            <div className="faq__list">
              {FAQ.map((item) => (
                <Reveal as="div" className="faq__item" key={item.q}>
                  <h3 className="faq__q">{item.q}</h3>
                  <p className="muted">{item.a}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

const FAQ = [
  {
    q: "What kinds of files can I upscale?",
    a: "Common image formats such as JPEG, PNG, and WebP, and common video formats such as MP4, MOV, and WebM. Images are limited to 30 MB and video to 500 MB so processing stays comfortable on a single machine.",
  },
  {
    q: "Does upscaling really add detail, or just enlarge?",
    a: "It reconstructs detail. Rather than stretching pixels, the engine rebuilds edges and texture that are consistent with what the source already contains, which reads as genuinely sharper rather than simply bigger.",
  },
  {
    q: "Will the audio in my video survive?",
    a: "Yes. Only the picture is reconstructed. The original audio track is carried through and reattached when the clip is reassembled.",
  },
  {
    q: "Where do my files go?",
    a: "Nowhere. In this version everything runs locally on your own machine and the result is written to your downloads. There is no account, no upload to a server you don't control, and no queue.",
  },
];
