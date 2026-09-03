import "../App.css";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Destinations from "../components/destinations";
import Highlights from "../components/Highlights";
import Tours from "../components/Tours";
import Testimonials from "../components/Testimonials";
import AboutUs from "../components/AboutUs";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <AboutUs />
      <Destinations />
      <Highlights />
      <Tours />
      <Testimonials />
    </>
  );
}
export default Home;
