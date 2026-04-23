import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import ReelsPreview from "@/components/ReelsPreview";
import Headshots from "@/components/Headshots";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <ReelsPreview />
        <Headshots />
      </main>
    </>
  );
}
