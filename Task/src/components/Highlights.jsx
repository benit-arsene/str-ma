import "./Highlights.css";
import { Globe, Headset, BadgeCheck } from "lucide-react";

function Highlights() {
  return (
    <section className="highlights">
      <video autoPlay muted loop playsInline>
        <source src="/videos/The Jungle Book (2016).mp4" type="video/mp4" />
      </video>
      <div className="highlights-overlay"></div>
      <div className="highlights-frame">
        <h2>Traveling Highlights</h2>
        <h4>Your New Traveling Idea</h4>
      </div>

      <div className="highlight-features">
        <div>
          <Globe />

          <h3>700+ DESTINATIONS</h3>
          <p>Far far away, behind the word mountains, far countries Vokalia.</p>
        </div>

        <div>
          <BadgeCheck />
          <h3>BEST PRICE GUARANTEE</h3>
          <p>Far far away, behind the word mountains, far countries Vokalia.</p>
        </div>

        <div>
          <Headset />

          <h3>TOP NOTCH SUPPORT</h3>
          <p>Far far away, behind the word mountains, far countries Vokalia.</p>
        </div>
      </div>
    </section>
  );
}

export default Highlights;
