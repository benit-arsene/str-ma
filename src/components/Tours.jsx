import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Clock, Users } from "lucide-react";
import "./Tours.css";

const tours = [
  {
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKnf2s2cwypBVZhtw3Zx8lfJNKvTrRrUV4aBc2Ksn5OA&s=10",
    discount: "15% off",
    location: "GREECE",
    title: "Aegean Dreams: Santorini & Mykonos",
    description:
      "Sun-drenched islands, whitewashed villages, and crystal-clear waters await.",
    duration: "6 days 3 hours",
    group: "15+ People",
    price: "$2500",
  },
  {
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmyrUYgA10vOt3udjR7BrdzcmJIVyw1FHk_BYWmRfZRyatwyLckV25b5Y&s=10",
    discount: "38% off",
    location: "JAISALMER",
    title: "Golden Sands of Rajasthan and Desert Safari",
    description:
      "Explore the Thar Desert's majestic forts and camel safaris under starlit skies.",
    duration: "1 days 8 hours",
    group: "50+ People",
    price: "$750",
  },
  {
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPQWAyDiiNAY0kGKh0NuG8ecd_h2eCBwfTbylS5sXs2UJAr4N0Mg5MgXY&s=10",
    discount: null,
    location: "SWITZERLAND",
    title: "Alpine Majesty: Peaks & Glaciers",
    description:
      "Journey through Switzerland's breathtaking mountains, lakes, and charming villages.",
    duration: "7 days 8 hours",
    group: "50+ People",
    price: "$750",
  },
  {
    image:
      "https://images.goway.com/production/styles/article_featured_image_3xl/s3/featured_images/Gornergrat-tourist-train-with-waterfall%2C-bridge-and-Matterhorn%2C-Zermatt%2C-Switzerland_AdobeStock_357392613.jpeg.webp?VersionId=9mo5ly3faIhUY3lxrPODTVvbzc801sS6&h=0875ea28&itok=M1d-5FQZ",
    discount: null,
    location: "ITALY",
    title: "Italian Splendor: Rome, Florence & Venice",
    description: "Art, history, and cuisine across Italy's most iconic cities.",
    duration: "7 days 8 hours",
    group: "50+ People",
    price: "$1200",
  },
];

function Tours() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 5000 })],
  );

  useEffect(() => {
    if (!emblaApi) return undefined;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());

    emblaApi.on("select", onSelect);
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi]);

  return (
    <section className="tours">
      <div className="tours-container">
        <div className="tours-header">
          <div>
            <h4>Amazing Tours</h4>
            <h2>
              Trending, <strong>Best Selling Tours</strong> And Fun Destinations
            </h2>
          </div>

          <div className="tour-controls">
            <button type="button" onClick={() => emblaApi?.scrollPrev()}>
              Prev
            </button>
            <button type="button" onClick={() => emblaApi?.scrollNext()}>
              Next
            </button>
          </div>
        </div>

        <div className="embla" ref={emblaRef}>
          <div className="embla__container">
            {tours.map((tour) => (
              <div className="embla__slide" key={tour.location}>
                <div className="tour-card">
                  <div className="tour-image">
                    <img src={tour.image} alt={tour.location} />

                    {tour.discount && (
                      <span className="discount">{tour.discount}</span>
                    )}

                    <span className="location">{tour.location}</span>
                  </div>

                  <div className="tour-info">
                    <h3 className="tour-title">{tour.title}</h3>
                    <p className="tour-description">{tour.description}</p>

                    <div className="tour-meta">
                      <div className="meta-item">
                        <span className="meta-icon">
                          <Clock size={18} />
                        </span>
                        <div className="meta-text">
                          <span className="meta-label">Duration</span>
                          <span className="meta-value">{tour.duration}</span>
                        </div>
                      </div>

                      <div className="meta-item">
                        <span className="meta-icon">
                          <Users size={18} />
                        </span>
                        <div className="meta-text">
                          <span className="meta-label">Group Size</span>
                          <span className="meta-value">{tour.group}</span>
                        </div>
                      </div>
                    </div>

                    <div className="tour-footer">
                      <strong>{tour.price}</strong>
                      <button type="button" className="booknowbutton">
                        BOOK NOW
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="tour-pagination">
          {tours.map((tour, index) => (
            <span
              key={tour.location}
              className={index === selectedIndex ? "active" : ""}
              onClick={() => emblaApi?.scrollTo(index)}
            ></span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Tours;