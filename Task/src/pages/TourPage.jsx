import Navbar from "../components/Navbar";
import TourHero from "./TourHero";
import TourContent from "./TourContent";
import About from "./About";
import Footer from "./footer";

function TourPage() {
  return (
    <>
      <Navbar />

      <main>
        <TourHero />
        <TourContent />
      </main>
      <Footer />
    </>
  );
}

export default TourPage;
