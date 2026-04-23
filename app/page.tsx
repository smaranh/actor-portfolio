import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import ReelsPreview from "@/components/ReelsPreview";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <ReelsPreview />
      </main>
    </>
  );
}
