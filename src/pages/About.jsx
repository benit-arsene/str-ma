import "./About.css";

function About() {
  return (
    <section className="about">
      <div className="about-images">
        <div className="about-main-image">
          <img
            src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80"
            alt="Travel destination"
          />
        </div>

        <div className="about-small-image">
          <img
            src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=900&q=80"
            alt="Traveler with suitcase"
          />
        </div>
      </div>

      <div className="about-content">
        <h4>| About us</h4>

        <h2>
          Plan Your <strong>Trip</strong> with Us
        </h2>

        <p>
          Far far away, behind the word mountains, far countries Vokalia and
          Consonantia, there live the blind texts. Separated they live in
          Bookmarksgrove right at the coast of the Semantics.
        </p>

        <button>READ MORE</button>
      </div>
    </section>
  );
}

export default About;
