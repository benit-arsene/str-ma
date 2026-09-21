import { useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import "./Tours.css";

function Tours() {
  const tours = [
    {
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKnf2s2cwypBVZhtw3Zx8lfJNKvTrRrUV4aBc2Ksn5OA&s=10",
      discount: "15% off",
      location: "GREECE",
      duration: "6 days 3 hours",
      group: "15+ People",
      price: "$2500",
    },
    {
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmyrUYgA10vOt3udjR7BrdzcmJIVyw1FHk_BYWmRfZRyatwyLckV25b5Y&s=10",
      discount: "38% off",
      location: "JAISALMER",
      duration: "1 days 8 hours",
      group: "50+ People",
      price: "$750",
    },
    {
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPQWAyDiiNAY0kGKh0NuG8ecd_h2eCBwfTbylS5sXs2UJAr4N0Mg5MgXY&s=10",
      discount: null,
      location: "SWITZERLAND",
      duration: "7 days 8 hours",
      group: "50+ People",
      price: "$750",
    },
    {
      image:
        "https://images.goway.com/production/styles/article_featured_image_3xl/s3/featured_images/Gornergrat-tourist-train-with-waterfall%2C-bridge-and-Matterhorn%2C-Zermatt%2C-Switzerland_AdobeStock_357392613.jpeg.webp?VersionId=9mo5ly3faIhUY3lxrPODTVvbzc801sS6&h=0875ea28&itok=M1d-5FQZ",
      discount: null,
      location: "ITALY",
      duration: "7 days 8 hours",
      group: "50+ People",
      price: "$1200",
    },
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", skipSnaps: false },
    [Autoplay({ delay: 5000 })]
  );

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );

  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  const scrollTo = useCallback(
    (index) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const selected = emblaApi.selectedScrollSnap();
      const dots = document.querySelectorAll(".tour-pagination span");
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === selected);
      });
    };

    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
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
            <button onClick={scrollPrev}>Prev</button>
            <button onClick={scrollNext}>Next</button>
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
                    <div className="tour-meta">
                      <span>{tour.duration}</span>
                      <span>{tour.group}</span>
                    </div>

                    <div className="tour-footer">
                      <strong>{tour.price}</strong>
                      <button className="booknowbutton">BOOK NOW</button>
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
              className={index === 0 ? "active" : ""}
              onClick={() => scrollTo(index)}
              key={tour.location}
              style={{ cursor: "pointer" }}
            ></span>
          ))}
        </div>
      </div>
    </section>
  );
}export default Tours;