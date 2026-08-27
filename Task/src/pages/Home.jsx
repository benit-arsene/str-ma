import { useState } from "react";
import reactLogo from "../assets/react.svg";
import viteLogo from "../assets/vite.svg";
import heroImg from "../assets/hero.png";
import "../App.css";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Destinations from "../components/destinations";
import Highlights from "../components/Highlights";
import Tours from "../components/Tours";
import Testimonials from "../components/Testimonials";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Destinations />
      <Highlights />
      <Tours />
      <Testimonials />
    </>
  );
}
export default Home;
