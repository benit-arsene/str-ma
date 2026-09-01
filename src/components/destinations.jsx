import "./Destinations.css";

function Destinations() {
  const places = [
    {
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpuBhszKEb8YEYa1gqfHLP9r-VxKT5-74FUnOXdZ8SULmYwTuRoKZOk6og&s=10",
      name: "Greece",
    },
    {
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPQWAyDiiNAY0kGKh0NuG8ecd_h2eCBwfTbylS5sXs2UJAr4N0Mg5MgXY&s=10",
      name: "Switzerland",
    },
    {
      image:
        "https://www.agoda.com/wp-content/uploads/2024/04/Agra-cover-1244x700.jpg",
      name: "India",
    },
    {
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQSujSPrAkTmeam-MrAedSwZeDQuWZyX-He0bE7Ye04A&s=10",
      name: "Thailand",
    },
  ];

  return (
    <section className="destinations" data-reveal>
      <h4>Amazing Destination</h4>
      <h2>Choose The Destination Just Right For Your Vacation</h2>
      <div className="destinations-grid">
        {places.map((place, index) => (
          <div
            className={`destination-card card${index + 1}`}
            key={place.name}
            data-reveal
            style={{ "--reveal-delay": `${index * 120}ms` }}
          >
            <img src={place.image} alt={place.name} />
            <button>{place.name}</button>
          </div>
        ))}
      </div>
      <div>
        <button className="view-all">VIEW ALL</button>
      </div>
    </section>
  );
}

export default Destinations;
