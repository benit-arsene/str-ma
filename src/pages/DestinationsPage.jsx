import Navbar from "../components/Navbar";
import Destinations from "../components/destinations";
import Footer from "./footer";

function DestinationsPage() {
  return (
    <>
      <Navbar />
      <main>
        <Destinations />
      </main>
      <Footer />
    </>
  );
}

export default DestinationsPage;