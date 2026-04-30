import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import ReelsPreview from "@/components/ReelsPreview";
import Headshots from "@/components/Headshots";
import Stats from "@/components/Stats";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main" tabIndex={-1}>
        <Hero />
        <About />
        <ReelsPreview />
        <Headshots />
        <Stats />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
