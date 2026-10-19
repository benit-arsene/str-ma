import { pool } from "../db.js";

const destinations = [
  {
    name: "Greece",
    slug: "greece",
    country: "Greece",
    description: "Sun-drenched islands, whitewashed villages, and crystal-clear waters await.",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpuBhszKEb8YEYa1gqfHLP9r-VxKT5-74FUnOXdZ8SULmYwTuRoKZOk6og&s=10",
  },
  {
    name: "Switzerland",
    slug: "switzerland",
    country: "Switzerland",
    description: "Journey through Switzerland's breathtaking mountains, lakes, and charming villages.",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPQWAyDiiNAY0kGKh0NuG8ecd_h2eCBwfTbylS5sXs2UJAr4N0Mg5MgXY&s=10",
  },
  {
    name: "India",
    slug: "india",
    country: "India",
    description: "Explore the Thar Desert's majestic forts and camel safaris under starlit skies.",
    imageUrl: "https://www.agoda.com/wp-content/uploads/2024/04/Agra-cover-1244x700.jpg",
  },
  {
    name: "Thailand",
    slug: "thailand",
    country: "Thailand",
    description: "Discover Thailand's vibrant culture, stunning beaches, and ancient temples.",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQSujSPrAkTmeam-MrAedSwZeDQuWZyX-He0bE7Ye04A&s=10",
  },
  {
    name: "Italy",
    slug: "italy",
    country: "Italy",
    description: "Art, history, and cuisine across Italy's most iconic cities.",
    imageUrl: "https://images.goway.com/production/styles/article_featured_image_3xl/s3/featured_images/Gornergrat-tourist-train-with-waterfall%2C-bridge-and-Matterhorn%2C-Zermatt%2C-Switzerland_AdobeStock_357392613.jpeg.webp?VersionId=9mo5ly3faIhUY3lxrPODTVvbzc801sS6&h=0875ea28&itok=M1d-5FQZ",
  },
  {
    name: "Rwanda",
    slug: "rwanda",
    country: "Rwanda",
    description: "The Land of a Thousand Hills, home to mountain gorillas, volcanoes, and vibrant culture.",
    imageUrl: "https://images.unsplash.com/photo-1595682788376-288b5374cb14?w=800",
  },
];

const categories = [
  { name: "Cultural", slug: "cultural", description: "Immerse yourself in local traditions, arts, and heritage." },
  { name: "Adventure", slug: "adventure", description: "Thrilling experiences for the bold and curious traveler." },
  { name: "Historical", slug: "historical", description: "Journey through time to explore ancient sites and landmarks." },
  { name: "Seaside", slug: "seaside", description: "Relax on beautiful coastlines and enjoy ocean views." },
  { name: "Discovery", slug: "discovery", description: "Uncover hidden gems and off-the-beaten-path destinations." },
];

const tours = [
  {
    slug: "aegean-dreams-santorini-mykonos",
    destinationSlug: "greece",
    name: "Aegean Dreams: Santorini & Mykonos",
    shortDescription: "Sun-drenched islands, whitewashed villages, and crystal-clear waters await.",
    fullDescription: "Experience the magic of the Aegean Sea with visits to Santorini's iconic caldera and Mykonos' vibrant nightlife. Discover whitewashed villages perched on cliffs, sample fresh seafood, and watch unforgettable sunsets over the Mediterranean.",
    durationDays: 7, // "6 days 3 hours" rounded up to next whole day
    basePrice: 2500.00,
    currency: "USD",
    groupSize: 15,
    groupSizeIsMinimum: true,
    isFeatured: true,
  },
  {
    slug: "golden-sands-rajasthan-desert-safari",
    destinationSlug: "india",
    name: "Golden Sands of Rajasthan and Desert Safari",
    shortDescription: "Explore the Thar Desert's majestic forts and camel safaris under starlit skies.",
    fullDescription: "Journey into the heart of Rajasthan's Thar Desert. Visit the golden city of Jaisalmer with its magnificent fort, ride camels across rolling sand dunes, and spend nights under starlit skies at desert camps. Experience Rajasthani culture, music, and cuisine.",
    durationDays: 2, // "1 day 8 hours" rounded up to next whole day
    basePrice: 750.00,
    currency: "USD",
    groupSize: 50,
    groupSizeIsMinimum: true,
    isFeatured: false,
  },
  {
    slug: "alpine-majesty-peaks-glaciers",
    destinationSlug: "switzerland",
    name: "Alpine Majesty: Peaks & Glaciers",
    shortDescription: "Journey through Switzerland's breathtaking mountains, lakes, and charming villages.",
    fullDescription: "Discover Switzerland's alpine wonders from towering peaks to pristine glacial lakes. Ride scenic mountain railways, visit car-free villages like Zermatt, and marvel at the Matterhorn. Experience Swiss hospitality in charming mountain chalets.",
    durationDays: 8, // "7 days 8 hours" rounded up to next whole day
    basePrice: 750.00,
    currency: "USD",
    groupSize: 50,
    groupSizeIsMinimum: true,
    isFeatured: false,
  },
  {
    slug: "italian-splendor-rome-florence-venice",
    destinationSlug: "italy",
    name: "Italian Splendor: Rome, Florence & Venice",
    shortDescription: "Art, history, and cuisine across Italy's most iconic cities.",
    fullDescription: "Explore the cultural treasures of Italy's three most iconic cities. In Rome, walk through ancient ruins and Vatican museums. In Florence, admire Renaissance masterpieces. In Venice, glide through canals and visit St. Mark's Square. Savor authentic Italian cuisine throughout.",
    durationDays: 8, // "7 days 8 hours" rounded up to next whole day
    basePrice: 1200.00,
    currency: "USD",
    groupSize: 50,
    groupSizeIsMinimum: true,
    isFeatured: false,
  },
  {
    slug: "thailand-paradise-beaches-culture",
    destinationSlug: "thailand",
    name: "Thailand Paradise: Beaches & Culture",
    shortDescription: "Discover Thailand's vibrant culture, stunning beaches, and ancient temples.",
    fullDescription: "Immerse yourself in Thailand's timeless charm. Begin in Bangkok with its golden temples and bustling markets, then fly to the island of Phuket for pristine beaches and turquoise waters. Explore ancient Ayutthaya's temple ruins and unwind on Koh Phi Phi's dramatic limestone cliffs. A perfect blend of spiritual heritage and tropical relaxation.",
    durationDays: 7,
    basePrice: 1450.00,
    currency: "USD",
    groupSize: 20,
    groupSizeIsMinimum: true,
    isFeatured: true,
  },
  {
    slug: "athens-delphi-olympic-heritage",
    destinationSlug: "greece",
    name: "Athens, Delphi & Olympic Heritage",
    shortDescription: "Walk among ancient ruins, sacred sanctuaries, and the birthplace of the Olympic Games.",
    fullDescription: "Journey through the cradle of Western civilization. Explore Athens' Acropolis, Parthenon, and the National Archaeological Museum. Travel to Delphi, where the Oracle once spoke, nestled on Mount Pausanias. Continue to ancient Olympia, birthplace of the Olympic Games, and the nearby hill of Kronos. Conclude with a visit to the Corinth Canal and the Temple of Poseidon at Cape Sounion.",
    durationDays: 6,
    basePrice: 1850.00,
    currency: "USD",
    groupSize: 18,
    groupSizeIsMinimum: true,
    isFeatured: false,
  },
  {
    slug: "zermatt-matterhorn-glacier-paradise",
    destinationSlug: "switzerland",
    name: "Zermatt & the Matterhorn Glacier Paradise",
    shortDescription: "Car-free alpine village, iconic peak views, and Europe's highest glacier station.",
    fullDescription: "Stay in the car-free village of Zermatt for unobstructed views of the iconic Matterhorn. Ride the Gornergrat Railway for sweeping alpine panoramas, then ascend to Klein Matterhorn and the Matterhorn Glacier Paradise cable car, Europe's highest station at 3,883 meters. Explore the ice palace, enjoy glacier views across the Alps, and return to Zermatt's cozy chalets for authentic Swiss dining.",
    durationDays: 5,
    basePrice: 2100.00,
    currency: "USD",
    groupSize: 12,
    groupSizeIsMinimum: true,
    isFeatured: true,
  },
  {
    slug: "varanasi-ganges-spiritual-journey",
    destinationSlug: "india",
    name: "Varanasi & the Sacred Ganges",
    shortDescription: "Witness sunrise prayers on India's holiest river and the timeless ghats of Varanasi.",
    fullDescription: "Step into one of the world's oldest living cities. Explore Varanasi's labyrinthine alleys leading to the ghats along the Ganges, where daily Aarti ceremonies draw crowds at dawn and dusk. Take a sunrise boat ride to witness the spiritual heartbeat of Hinduism. Visit Kashi Vishwanath Temple, Sarnath where Buddha first taught, and the Banaras Hindu University. Evening prayers on the river create an unforgettable, moving spectacle.",
    durationDays: 4,
    basePrice: 950.00,
    currency: "USD",
    groupSize: 25,
    groupSizeIsMinimum: true,
    isFeatured: false,
  },
  {
    slug: "bangkok-chiang-mai-temple-tour",
    destinationSlug: "thailand",
    name: "Bangkok to Chiang Mai: Temples & Mountains",
    shortDescription: "From glittering city temples to misty northern highlands and elephant sanctuaries.",
    fullDescription: "Begin in Bangkok, exploring the Grand Palace, Wat Pho, and the golden Wat Arun. Take an overnight train north to Chiang Mai, a city surrounded by ancient moats and hundreds of ornate temples. Spend days visiting Doi Suthep, taking a cooking class in the countryside, and volunteering at an ethical elephant sanctuary. End with a visit to a hill-tribe village to learn traditional weaving and meet the region's diverse communities.",
    durationDays: 7,
    basePrice: 1350.00,
    currency: "USD",
    groupSize: 16,
    groupSizeIsMinimum: true,
    isFeatured: false,
  },
  {
    slug: "rome-vatican-colosseum-ancient-rome",
    destinationSlug: "italy",
    name: "Rome: Vatican & Ancient Rome",
    shortDescription: "Step inside the Vatican, the Colosseum, and the Roman Forum in one immersive day.",
    fullDescription: "Dive deep into the heart of ancient and religious Rome. Start early at the Vatican Museums and the Sistine Chapel before the crowds arrive, then walk through St. Peter's Basilica. After lunch, explore the Colosseum, Palatine Hill, and Roman Forum, where the Roman Empire was governed. End the day with a stroll through Trastevere's lantern-lit streets and a plate of traditional Roman pasta.",
    durationDays: 3,
    basePrice: 1100.00,
    currency: "USD",
    groupSize: 15,
    groupSizeIsMinimum: true,
    isFeatured: false,
  },
  {
    slug: "florence-renaissance-art-tuscany",
    destinationSlug: "italy",
    name: "Florence & the Renaissance Art Trail",
    shortDescription: "Discover Michelangelo's masterpieces and the rolling hills of Tuscany.",
    fullDescription: "Spend your days in Florence, the birthplace of the Renaissance. Stand beneath Michelangelo's David in the Accademia, visit the Duomo's magnificent dome, and cross the Ponte Vecchio. Take day trips into the Tuscan countryside to the medieval town of Siena and the walled city of Lucca. Sip Chianti in a family-run vineyard and taste authentic Florentine steak before returning to your boutique hotel.",
    durationDays: 5,
    basePrice: 1650.00,
    currency: "USD",
    groupSize: 14,
    groupSizeIsMinimum: true,
    isFeatured: true,
  },
  {
    slug: "amalfi-coast-positano-sorrento",
    destinationSlug: "italy",
    name: "Amalfi Coast: Positano & Sorrento",
    shortDescription: "Cliffside villages, lemon groves, and Mediterranean views along Italy's most dramatic coast.",
    fullDescription: "Travel the winding roads of the Amalfi Coast, stopping at the pastel-colored village of Positano cascading down the cliffs. Wander the lemon-scented streets of Sorrento and take a boat to the emerald grottoes of Capri. Hike the Path of the Gods for breathtaking sea views, sample limoncello made from local Sorrento lemons, and dine on fresh seafood at family-run trattorias perched above the water.",
    durationDays: 5,
    basePrice: 1750.00,
    currency: "USD",
    groupSize: 12,
    groupSizeIsMinimum: true,
    isFeatured: false,
  },
  {
    slug: "jaipur-amber-fort-taj-mahal",
    destinationSlug: "india",
    name: "Jaipur, Amber Fort & the Taj Mahal",
    shortDescription: "Pink palaces, marble marvels, and the timeless romance of the Taj Mahal.",
    fullDescription: "Explore India's Golden Triangle in style. Begin in Jaipur, the Pink City, visiting the City Palace, Hawa Mahal, and Jantar Mantar observatory. Climb to the hilltop Amber Fort on elephant-back or by jeep through the Maota Lake. Travel to Agra to witness the Taj Mahal at sunrise, its white marble shifting with the light. Tour the imposing Agra Fort and return to Jaipur for a traditional Rajasthani dinner with folk music.",
    durationDays: 5,
    basePrice: 1300.00,
    currency: "USD",
    groupSize: 20,
    groupSizeIsMinimum: true,
    isFeatured: false,
  },
  {
    slug: "goa-beaches-watersports-india",
    destinationSlug: "india",
    name: "Goa: Beaches, Watersports & Sunsets",
    shortDescription: "Golden sands, palm-fringed shores, and lively beach shacks on India's coast.",
    fullDescription: "Unwind on Goa's sun-kissed beaches, from the quiet sands of Palolem to the bustling shacks of Baga. Spend your mornings kayaking through the mangroves of the Mandovi River or scuba diving off Grand Island to explore coral reefs and tropical fish. Take a sunset dolphin-watching cruise, sample fresh Goan seafood curry at a beachfront shack, and visit the historic churches and forts of Old Goa. End each day with a vibrant sunset and a cold Kingfisher beer.",
    durationDays: 5,
    basePrice: 900.00,
    currency: "USD",
    groupSize: 24,
    groupSizeIsMinimum: true,
    isFeatured: false,
  },
  {
    slug: "rwanda-gorilla-trekking-volcanoes-adventure",
    destinationSlug: "rwanda",
    name: "Rwanda Gorilla Trekking & Volcanoes Adventure",
    shortDescription: "Trek through Volcanoes National Park to encounter mountain gorillas in their natural habitat.",
    fullDescription: "Journey to the Virunga Mountains for an unforgettable mountain gorilla trekking experience in Volcanoes National Park. Hike through bamboo forests and alpine meadows with expert guides, spend an hour observing a habituated gorilla family, and learn about conservation efforts protecting these endangered primates. Based in Musanze, this adventure combines wildlife encounters with the dramatic scenery of Rwanda's northern volcanoes.",
    durationDays: 3,
    basePrice: 1850.00,
    currency: "USD",
    groupSize: 8,
    groupSizeIsMinimum: false,
    isFeatured: true,
  },
  {
    slug: "rwanda-akagera-wildlife-safari-escape",
    destinationSlug: "rwanda",
    name: "Akagera Wildlife Safari Escape",
    shortDescription: "Safari through Akagera National Park to spot lions, elephants, giraffes, and zebras.",
    fullDescription: "Explore Akagera National Park's savannah, wetlands, and lakes on a classic Big Five safari. Game drives offer chances to see lions, elephants, buffalo, leopards, and rhinos, along with giraffes, zebras, hippos, and prolific birdlife. Stay in comfortable lodge accommodation and experience the remarkable wildlife restoration story of Rwanda's only savannah park.",
    durationDays: 2,
    basePrice: 950.00,
    currency: "USD",
    groupSize: 6,
    groupSizeIsMinimum: false,
    isFeatured: false,
  },
  {
    slug: "rwanda-nyungwe-rainforest-canopy-walk",
    destinationSlug: "rwanda",
    name: "Nyungwe Rainforest & Canopy Walk",
    shortDescription: "Explore Nyungwe's ancient rainforest and walk above the treetops on the canopy walkway.",
    fullDescription: "Discover one of Africa's oldest rainforests in Nyungwe National Park. Walk the suspended canopy walkway high above the forest floor, track chimpanzees through the jungle, and spot colobus monkeys and hundreds of bird species. This three-day retreat blends adventure hiking with peaceful eco-lodge stays in Rwanda's southwest.",
    durationDays: 3,
    basePrice: 750.00,
    currency: "USD",
    groupSize: 10,
    groupSizeIsMinimum: true,
    isFeatured: false,
  },
  {
    slug: "rwanda-lake-kivu-islands-lakeside-retreat",
    destinationSlug: "rwanda",
    name: "Lake Kivu Islands & Lakeside Retreat",
    shortDescription: "Relax on the shores of Lake Kivu and explore its islands with a lakeside retreat.",
    fullDescription: "Unwind along the shores of Lake Kivu, one of Africa's Great Lakes, with its sparkling waters, islands, and lakeside towns. Take a boat trip to explore the islands, kayak along the shoreline, and enjoy sunset views from Rubavu. A relaxing three-day escape combining water activities with lakeside relaxation.",
    durationDays: 3,
    basePrice: 1100.00,
    currency: "USD",
    groupSize: 12,
    groupSizeIsMinimum: true,
    isFeatured: false,
  },
  {
    slug: "rwanda-kigali-culture-heritage-city-discovery",
    destinationSlug: "rwanda",
    name: "Kigali Culture, Heritage & City Discovery",
    shortDescription: "Discover Kigali's culture, history, and heritage on a guided city tour.",
    fullDescription: "Explore Rwanda's vibrant capital on a two-day cultural discovery tour. Visit the Kigali Genocide Memorial, local markets, artisan cooperatives, and heritage sites that tell the story of Rwanda's history and renewal. Experience the city's food scene, contemporary art galleries, and the warm hospitality that makes Kigali one of Africa's cleanest and safest capitals.",
    durationDays: 2,
    basePrice: 650.00,
    currency: "USD",
    groupSize: 15,
    groupSizeIsMinimum: true,
    isFeatured: false,
  },
];

const tourCategories = {
  "aegean-dreams-santorini-mykonos": ["seaside", "discovery", "cultural"],
  "golden-sands-rajasthan-desert-safari": ["adventure", "cultural", "discovery"],
  "alpine-majesty-peaks-glaciers": ["adventure", "discovery"],
  "italian-splendor-rome-florence-venice": ["cultural", "historical", "discovery"],
  "thailand-paradise-beaches-culture": ["seaside", "cultural", "historical", "discovery"],
  "athens-delphi-olympic-heritage": ["historical", "cultural", "discovery"],
  "zermatt-matterhorn-glacier-paradise": ["adventure", "discovery"],
  "varanasi-ganges-spiritual-journey": ["cultural", "historical", "discovery"],
  "bangkok-chiang-mai-temple-tour": ["cultural", "adventure", "discovery"],
  "rome-vatican-colosseum-ancient-rome": ["historical", "cultural", "discovery"],
  "florence-renaissance-art-tuscany": ["cultural", "historical", "discovery"],
  "amalfi-coast-positano-sorrento": ["seaside", "discovery", "cultural"],
  "jaipur-amber-fort-taj-mahal": ["historical", "cultural", "adventure"],
  "goa-beaches-watersports-india": ["seaside", "adventure", "discovery"],
  "rwanda-gorilla-trekking-volcanoes-adventure": ["adventure", "discovery", "cultural"],
  "rwanda-akagera-wildlife-safari-escape": ["adventure", "cultural", "discovery"],
  "rwanda-nyungwe-rainforest-canopy-walk": ["adventure", "discovery"],
  "rwanda-lake-kivu-islands-lakeside-retreat": ["seaside", "discovery", "cultural"],
  "rwanda-kigali-culture-heritage-city-discovery": ["cultural", "historical", "discovery"],
};

const tourImages = {
  "aegean-dreams-santorini-mykonos": [
    {
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKnf2s2cwypBVZhtw3Zx8lfJNKvTrRrUV4aBc2Ksn5OA&s=10",
      altText: "Aegean Dreams: Santorini & Mykonos tour",
      displayOrder: 0,
      isPrimary: true,
    },
  ],
  "golden-sands-rajasthan-desert-safari": [
    {
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmyrUYgA10vOt3udjR7BrdzcmJIVyw1FHk_BYWmRfZRyatwyLckV25b5Y&s=10",
      altText: "Golden Sands of Rajasthan and Desert Safari tour",
      displayOrder: 0,
      isPrimary: true,
    },
  ],
  "alpine-majesty-peaks-glaciers": [
    {
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPQWAyDiiNAY0kGKh0NuG8ecd_h2eCBwfTbylS5sXs2UJAr4N0Mg5MgXY&s=10",
      altText: "Alpine Majesty: Peaks & Glaciers tour",
      displayOrder: 0,
      isPrimary: true,
    },
  ],
  "italian-splendor-rome-florence-venice": [
    {
      imageUrl: "https://images.goway.com/production/styles/article_featured_image_3xl/s3/featured_images/Gornergrat-tourist-train-with-waterfall%2C-bridge-and-Matterhorn%2C-Zermatt%2C-Switzerland_AdobeStock_357392613.jpeg.webp?VersionId=9mo5ly3faIhUY3lxrPODTVvbzc801sS6&h=0875ea28&itok=M1d-5FQZ",
      altText: "Italian Splendor: Rome, Florence & Venice tour",
      displayOrder: 0,
      isPrimary: true,
    },
  ],
  "thailand-paradise-beaches-culture": [
    {
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
      altText: "Thailand Paradise: Beaches & Culture tour",
      displayOrder: 0,
      isPrimary: true,
    },
  ],
  "athens-delphi-olympic-heritage": [
    {
      imageUrl: "https://images.unsplash.com/photo-1534177616072-8e8b0e4d0d4e?w=800",
      altText: "Athens, Delphi & Olympic Heritage tour",
      displayOrder: 0,
      isPrimary: true,
    },
  ],
  "zermatt-matterhorn-glacier-paradise": [
    {
      imageUrl: "https://images.unsplash.com/photo-1531366936330-7bf9be0c092b?w=800",
      altText: "Zermatt & the Matterhorn Glacier Paradise tour",
      displayOrder: 0,
      isPrimary: true,
    },
  ],
  "varanasi-ganges-spiritual-journey": [
    {
      imageUrl: "https://images.unsplash.com/photo-1571819342408-a32b2a4ad8d6?w=800",
      altText: "Varanasi & the Sacred Ganges tour",
      displayOrder: 0,
      isPrimary: true,
    },
  ],
  "bangkok-chiang-mai-temple-tour": [
    {
      imageUrl: "https://images.unsplash.com/photo-1508004466971-d5334db9d8e3?w=800",
      altText: "Bangkok to Chiang Mai: Temples & Mountains tour",
      displayOrder: 0,
      isPrimary: true,
    },
  ],
  "rome-vatican-colosseum-ancient-rome": [
    {
      imageUrl: "https://images.unsplash.com/photo-1552833479-84e28648bba1?w=800",
      altText: "Rome: Vatican & Ancient Rome tour",
      displayOrder: 0,
      isPrimary: true,
    },
  ],
  "florence-renaissance-art-tuscany": [
    {
      imageUrl: "https://images.unsplash.com/photo-1549339909-699d5b2c797f?w=800",
      altText: "Florence & the Renaissance Art Trail tour",
      displayOrder: 0,
      isPrimary: true,
    },
  ],
  "amalfi-coast-positano-sorrento": [
    {
      imageUrl: "https://images.unsplash.com/photo-1539068716602-7ef67d639090?w=800",
      altText: "Amalfi Coast: Positano & Sorrento tour",
      displayOrder: 0,
      isPrimary: true,
    },
  ],
  "jaipur-amber-fort-taj-mahal": [
    {
      imageUrl: "https://images.unsplash.com/photo-1599661082133-103776e5b1ff?w=800",
      altText: "Jaipur, Amber Fort & the Taj Mahal tour",
      displayOrder: 0,
      isPrimary: true,
    },
  ],
  "goa-beaches-watersports-india": [
    {
      imageUrl: "https://images.unsplash.com/photo-1519046904884-53103b34b1ae?w=800",
      altText: "Goa: Beaches, Watersports & Sunsets tour",
      displayOrder: 0,
      isPrimary: true,
    },
  ],
  "rwanda-gorilla-trekking-volcanoes-adventure": [
    {
      imageUrl: "https://images.unsplash.com/photo-1537926604183-4407e7488e26?w=800",
      altText: "Rwanda Gorilla Trekking & Volcanoes Adventure tour",
      displayOrder: 0,
      isPrimary: true,
    },
  ],
  "rwanda-akagera-wildlife-safari-escape": [
    {
      imageUrl: "https://images.unsplash.com/photo-1542204166-48670b99362b?w=800",
      altText: "Akagera Wildlife Safari Escape tour",
      displayOrder: 0,
      isPrimary: true,
    },
  ],
  "rwanda-nyungwe-rainforest-canopy-walk": [
    {
      imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
      altText: "Nyungwe Rainforest & Canopy Walk tour",
      displayOrder: 0,
      isPrimary: true,
    },
  ],
  "rwanda-lake-kivu-islands-lakeside-retreat": [
    {
      imageUrl: "https://images.unsplash.com/photo-1542291226-7ee4a47d4589?w=800",
      altText: "Lake Kivu Islands & Lakeside Retreat tour",
      displayOrder: 0,
      isPrimary: true,
    },
  ],
  "rwanda-kigali-culture-heritage-city-discovery": [
    {
      imageUrl: "https://images.unsplash.com/photo-1519046904884-53103b34b1ae?w=800",
      altText: "Kigali Culture, Heritage & City Discovery tour",
      displayOrder: 0,
      isPrimary: true,
    },
  ],
};

const tourItinerary = {
  "thailand-paradise-beaches-culture": [
    { dayNumber: 1, dayLabel: "Day 1", title: "Arrival in Bangkok", description: "Arrive at Suvarnabhumi Airport, transfer to your hotel in the city centre, and enjoy an evening stroll along the Chao Phraya River." },
    { dayNumber: 2, dayLabel: "Day 2", title: "Bangkok Temples & Grand Palace", description: "Explore the Grand Palace, Wat Pho, and Wat Arun. Return to the hotel in the afternoon and explore the city's markets at your own pace." },
    { dayNumber: 3, dayLabel: "Day 3", title: "Fly to Phuket", description: "Morning flight to Phuket. Check into your beachfront resort and spend the afternoon relaxing on Patong Beach or exploring the island's old town." },
    { dayNumber: 4, dayLabel: "Day 4", title: "Phi Phi Islands Day Trip", description: "Take a speedboat to Koh Phi Phi. Snorkel in vibrant coral reefs, visit Maya Bay, and enjoy a beach barbecue lunch on the island." },
    { dayNumber: 5, dayLabel: "Day 5", title: "Ayutthaya Historical Park", description: "Travel by train to Ayutthaya, a UNESCO World Heritage Site. Visit the ancient temple ruins and return to Bangkok in the evening." },
    { dayNumber: 6, dayLabel: "Day 6", title: "Bangkok Markets & Street Food", description: "Explore the Chatuchak Weekend Market and take a boat ride through the city's khlongs. Enjoy a street food tour in the Chinatown district in the evening." },
    { dayNumber: 7, dayLabel: "Day 7", title: "Departure", description: "Final breakfast at your hotel, last-minute shopping at a local market, and transfer to the airport for your departure flight." },
  ],
  "athens-delphi-olympic-heritage": [
    { dayNumber: 1, dayLabel: "Day 1", title: "Arrival in Athens", description: "Arrive in Athens, check into your hotel in Plaka, and take an evening walk around the historic neighbourhood. Enjoy dinner with a view of the Acropolis." },
    { dayNumber: 2, dayLabel: "Day 2", title: "Acropolis & Acropolis Museum", description: "Visit the Acropolis at sunrise, exploring the Parthenon, Erechtheion, and Propylaea. Spend the afternoon at the state-of-the-art Acropolis Museum." },
    { dayNumber: 3, dayLabel: "Day 3", title: "Delphi Day Trip", description: "Drive through the mountains to Delphi. Visit the Temple of Apollo, the Athenian Treasury, and the Delphi Archaeological Museum with its famous Charioteer statue." },
    { dayNumber: 4, dayLabel: "Day 4", title: "Ancient Olympia", description: "Travel to Olympia, birthplace of the Olympic Games. Tour the ancient stadium, the Temple of Zeus, and the archaeological museum." },
    { dayNumber: 5, dayLabel: "Day 5", title: "Corinth Canal & Cape Sounion", description: "Stop at the dramatic Corinth Canal en route back to Athens. Continue to Cape Sounion to watch the sunset over the Temple of Poseidon." },
    { dayNumber: 6, dayLabel: "Day 6", title: "National Archaeological Museum & Departure", description: "Visit Athens' National Archaeological Museum, one of the world's greatest collections of ancient art, before transferring to the airport." },
  ],
  "zermatt-matterhorn-glacier-paradise": [
    { dayNumber: 1, dayLabel: "Day 1", title: "Arrival in Zermatt", description: "Arrive in Zermatt by train or cable car. Check into your mountain chalet and take an evening stroll through the car-free village with views of the Matterhorn." },
    { dayNumber: 2, dayLabel: "Day 2", title: "Gornergrat Railway", description: "Ride the open-air Gornergrat Railway for a 360-degree panorama of 29 peaks over 4,000 meters. Hike or take the cog railway back down to Zermatt in the afternoon." },
    { dayNumber: 3, dayLabel: "Day 3", title: "Matterhorn Glacier Paradise", description: "Ascend by cable car to Klein Matterhorn at 3,883 meters, Europe's highest station. Visit the ice palace and enjoy views of the Alps from the panoramic terrace." },
    { dayNumber: 4, dayLabel: "Day 4", title: "Five Lakes Walk (5 Seenweg)", description: "Take a scenic hike along the Five Lakes trail, offering the best unobstructed views of the Matterhorn. Return to Zermatt for a traditional Swiss dinner." },
    { dayNumber: 5, dayLabel: "Day 5", title: "Departure", description: "Final breakfast with a view of the Matterhorn, then take the train back to the airport for your departure." },
  ],
  "varanasi-ganges-spiritual-journey": [
    { dayNumber: 1, dayLabel: "Day 1", title: "Arrival in Varanasi", description: "Arrive in Varanasi and check into your hotel in the old city. Walk through the labyrinthine alleys to reach the ghats for the evening Ganga Aarti ceremony." },
    { dayNumber: 2, dayLabel: "Day 2", title: "Sunrise Boat Ride & Ghats", description: "Take a sunrise boat ride on the Ganges to witness the morning rituals along the ghats. Explore the Kashi Vishwanath Temple and the Manikarnika Ghat in the afternoon." },
    { dayNumber: 3, dayLabel: "Day 3", title: "Sarnath & Banaras Hindu University", description: "Visit Sarnath, where Gautama Buddha first taught the Dharma. Tour the archaeological site and museum, then explore the BHU campus and its museum in the late afternoon." },
    { dayNumber: 4, dayLabel: "Day 4", title: "Departure", description: "Final walk along the ghats at dawn before transferring to the airport for your departure." },
  ],
  "bangkok-chiang-mai-temple-tour": [
    { dayNumber: 1, dayLabel: "Day 1", title: "Arrival in Bangkok", description: "Arrive in Bangkok and check into your hotel. Explore the city's vibrant night markets and take a boat ride on the Chao Phraya River in the evening." },
    { dayNumber: 2, dayLabel: "Day 2", title: "Grand Palace & Temples", description: "Visit the Grand Palace, Wat Pho, and Wat Arun. In the afternoon, explore the bustling Khao San Road area for street food and local culture." },
    { dayNumber: 3, dayLabel: "Day 3", title: "Overnight Train to Chiang Mai", description: "Board an overnight sleeper train from Bangkok to Chiang Mai. Enjoy the changing scenery as the train climbs into the northern highlands." },
    { dayNumber: 4, dayLabel: "Day 4", title: "Chiang Mai Old City Temples", description: "Arrive in Chiang Mai and explore the old walled city. Visit Wat Chedi Luang, Wat Phra Singh, and the historic temples within the moats." },
    { dayNumber: 5, dayLabel: "Day 5", title: "Doi Suthep Temple & Elephant Sanctuary", description: "Climb to Wat Doi Suthep for panoramic views of the city. Spend the afternoon at an ethical elephant sanctuary, learning about conservation and caring for these gentle giants." },
    { dayNumber: 6, dayLabel: "Day 6", title: "Hill Tribe Village Visit", description: "Travel to a nearby hill tribe village to learn about traditional weaving, meet the local communities, and experience the region's cultural diversity." },
    { dayNumber: 7, dayLabel: "Day 7", title: "Departure", description: "Final breakfast in Chiang Mai, last-minute exploration of the local markets, and transfer to the airport for your departure." },
  ],
  "rome-vatican-colosseum-ancient-rome": [
    { dayNumber: 1, dayLabel: "Day 1", title: "Arrival in Rome", description: "Arrive in Rome and check into your hotel. Take an evening stroll through the historic centre, visiting the Pantheon and Piazza Navona." },
    { dayNumber: 2, dayLabel: "Day 2", title: "Vatican Museums & St. Peter's", description: "Explore the Vatican Museums, Sistine Chapel, and St. Peter's Basilica. Book your tickets in advance to avoid the crowds and enjoy an early morning visit." },
    { dayNumber: 3, dayLabel: "Day 3", title: "Colosseum & Roman Forum", description: "Tour the Colosseum, Palatine Hill, and Roman Forum with a guided archaeologist. Walk along the Via Sacra and imagine the ancient city at its peak." },
  ],
  "florence-renaissance-art-tuscany": [
    { dayNumber: 1, dayLabel: "Day 1", title: "Arrival in Florence", description: "Arrive in Florence and check into your hotel. Take an evening walk along the Arno River and enjoy a traditional Florentine dinner in the historic centre." },
    { dayNumber: 2, dayLabel: "Day 2", title: "Accademia & Duomo", description: "Visit the Accademia Gallery to see Michelangelo's David, then explore the Duomo, Baptistery, and Giotto's Campanile. Climb the dome for panoramic views of the city." },
    { dayNumber: 3, dayLabel: "Day 3", title: "Uffizi Gallery & Ponte Vecchio", description: "Explore the Uffizi Gallery's Renaissance masterpieces by Botticelli, Leonardo, and Raphael. Stroll across the Ponte Vecchio and explore the Oltrarno artisan quarter in the afternoon." },
    { dayNumber: 4, dayLabel: "Day 4", title: "Siena Day Trip", description: "Take a day trip to the medieval hill town of Siena. Visit the Piazza del Campo, the Duomo, and the Palazzo Pubblico, then enjoy a Chianti wine lunch in the Tuscan countryside." },
    { dayNumber: 5, dayLabel: "Day 5", title: "Departure", description: "Final breakfast in Florence, last-minute exploration of the local markets, and transfer to the airport for your departure." },
  ],
  "amalfi-coast-positano-sorrento": [
    { dayNumber: 1, dayLabel: "Day 1", title: "Arrival in Sorrento", description: "Arrive in Sorrento and check into your hotel. Take an evening stroll through the town's narrow streets and enjoy fresh seafood at a cliffside restaurant." },
    { dayNumber: 2, dayLabel: "Day 2", title: "Positano & Amalfi", description: "Take a scenic bus ride along the Amalfi Drive to the pastel-colored village of Positano. Continue to Amalfi, visit the cathedral, and relax on the pebble beaches." },
    { dayNumber: 3, dayLabel: "Day 3", title: "Path of the Gods Hike", description: "Hike the famous Sentiero degli Dei (Path of the Gods) from Bomerano to Nocella, with breathtaking views of the coastline and dramatic cliffs." },
    { dayNumber: 4, dayLabel: "Day 4", title: "Capri Island Day Trip", description: "Take a ferry to Capri. Visit the Blue Grotto, explore the island's gardens, and enjoy a leisurely lunch with views of the Mediterranean." },
    { dayNumber: 5, dayLabel: "Day 5", title: "Departure", description: "Final breakfast in Sorrento, explore the local lemon groves for limoncello tasting, and transfer to the airport for your departure." },
  ],
  "jaipur-amber-fort-taj-mahal": [
    { dayNumber: 1, dayLabel: "Day 1", title: "Arrival in Jaipur", description: "Arrive in Jaipur, the Pink City, and check into your hotel. Explore the City Palace and Jantar Mantar observatory in the afternoon, then enjoy a traditional Rajasthani dinner with folk music." },
    { dayNumber: 2, dayLabel: "Day 2", title: "Amber Fort", description: "Visit the magnificent Amber Fort, riding an elephant or jeep up the hillside. Explore the fort's palaces, gardens, and the Sheesh Mahal (Mirror Palace) before returning to the city." },
    { dayNumber: 3, dayLabel: "Day 3", title: "Travel to Agra", description: "Travel by car or train to Agra. Visit the imposing Agra Fort, a UNESCO World Heritage Site, and explore the historic gardens and pavilions of the Mughal era." },
    { dayNumber: 4, dayLabel: "Day 4", title: "Taj Mahal at Sunrise", description: "Visit the Taj Mahal at sunrise to witness its marble glow in the soft morning light. Explore the surrounding gardens and the nearby tomb of Itmad-ud-Daulah, then return to Jaipur in the afternoon." },
    { dayNumber: 5, dayLabel: "Day 5", title: "Departure", description: "Final breakfast in Jaipur, last-minute shopping for handicrafts and textiles, and transfer to the airport for your departure." },
  ],
  "goa-beaches-watersports-india": [
    { dayNumber: 1, dayLabel: "Day 1", title: "Arrival in Goa", description: "Arrive at Dabolim Airport and transfer to your beachfront hotel in North Goa. Spend the afternoon relaxing on Calangute Beach and enjoy a sunset dinner at a beach shack." },
    { dayNumber: 2, dayLabel: "Day 2", title: "Watersports & Baga Beach", description: "Enjoy a morning of watersports including parasailing, jet skiing, and banana boat rides off Baga Beach. Explore the lively beach shacks and shops in the afternoon." },
    { dayNumber: 3, dayLabel: "Day 3", title: "Old Goa & Fort Aguada", description: "Visit the historic churches of Old Goa, a UNESCO World Heritage Site, including the Basilica of Bom Jesus. Tour Fort Aguada and its lighthouse for panoramic views of the Arabian Sea." },
    { dayNumber: 4, dayLabel: "Day 4", title: "Mangrove Kayaking & Dolphin Cruise", description: "Kayak through the peaceful mangroves of the Mandovi River in the morning. Take a sunset dolphin-watching cruise and enjoy fresh Goan seafood at a beachfront restaurant." },
    { dayNumber: 5, dayLabel: "Day 5", title: "Departure", description: "Final breakfast by the sea, last-minute swimming or shopping for Goan handicrafts, and transfer to the airport for your departure." },
  ],
  "rwanda-gorilla-trekking-volcanoes-adventure": [
    { dayNumber: 1, dayLabel: "Day 1", title: "Arrival in Musanze", description: "Arrive in Musanze, check into your lodge, and take an evening walk through the town with views of the Virunga volcanoes." },
    { dayNumber: 2, dayLabel: "Day 2", title: "Gorilla Trekking", description: "Hike into Volcanoes National Park with expert guides to track and observe a habituated mountain gorilla family for one hour. Return to the lodge in the afternoon." },
    { dayNumber: 3, dayLabel: "Day 3", title: "Departure", description: "Final breakfast with mountain views, then transfer to Kigali for your departure flight." },
  ],
  "rwanda-akagera-wildlife-safari-escape": [
    { dayNumber: 1, dayLabel: "Day 1", title: "Arrival & Game Drive", description: "Transfer to Akagera National Park, check into your lodge, and head out on an afternoon game drive to spot elephants, buffalo, and antelope." },
    { dayNumber: 2, dayLabel: "Day 2", title: "Morning Safari & Departure", description: "Take an early morning safari to see lions, giraffes, and zebras, then return to Kigali for your departure." },
  ],
  "rwanda-nyungwe-rainforest-canopy-walk": [
    { dayNumber: 1, dayLabel: "Day 1", title: "Arrival in Nyungwe", description: "Transfer to Nyungwe National Park, check into your eco-lodge, and take an evening nature walk at the forest edge." },
    { dayNumber: 2, dayLabel: "Day 2", title: "Canopy Walk & Primate Tracking", description: "Walk the suspended canopy walkway above the rainforest, then track chimpanzees or colobus monkeys with a guide." },
    { dayNumber: 3, dayLabel: "Day 3", title: "Departure", description: "Morning birdwatching walk, then transfer back to Kigali for your departure." },
  ],
  "rwanda-lake-kivu-islands-lakeside-retreat": [
    { dayNumber: 1, dayLabel: "Day 1", title: "Arrival at Lake Kivu", description: "Transfer to Rubavu on the shores of Lake Kivu, check into your lakeside hotel, and enjoy an evening sunset stroll." },
    { dayNumber: 2, dayLabel: "Day 2", title: "Island Boat Trip", description: "Take a boat tour to explore Lake Kivu's islands, swim in the clear waters, and enjoy a lakeside lunch." },
    { dayNumber: 3, dayLabel: "Day 3", title: "Departure", description: "Kayak along the shoreline in the morning, then transfer to Kigali for your departure." },
  ],
  "rwanda-kigali-culture-heritage-city-discovery": [
    { dayNumber: 1, dayLabel: "Day 1", title: "Arrival in Kigali", description: "Arrive in Kigali, check into your hotel, and visit the Kigali Genocide Memorial to learn about Rwanda's history." },
    { dayNumber: 2, dayLabel: "Day 2", title: "City Heritage Tour", description: "Explore local markets, artisan cooperatives, and heritage sites. Experience Kigali's food scene and contemporary art before transferring to the airport for departure." },
  ],
};

async function seedDestinations(client) {
  for (const dest of destinations) {
    await client.query(
      `INSERT INTO destinations (name, slug, country, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         country = EXCLUDED.country,
         description = EXCLUDED.description,
         updated_at = now()`,
      [dest.name, dest.slug, dest.country, dest.description]
    );
  }
}

async function seedCategories(client) {
  for (const cat of categories) {
    await client.query(
      `INSERT INTO categories (name, slug, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         updated_at = now()`,
      [cat.name, cat.slug, cat.description]
    );
  }
}

async function seedTours(client) {
  for (const tour of tours) {
    const destResult = await client.query(
      `SELECT id FROM destinations WHERE slug = $1`,
      [tour.destinationSlug]
    );
    if (destResult.rows.length === 0) {
      throw new Error(`Destination not found for slug: ${tour.destinationSlug}`);
    }
    const destinationId = destResult.rows[0].id;

    await client.query(
      `INSERT INTO tours (destination_id, name, slug, short_description, full_description, duration_days, base_price, currency, group_size, group_size_is_minimum, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (slug) DO UPDATE SET
         destination_id = EXCLUDED.destination_id,
         name = EXCLUDED.name,
         short_description = EXCLUDED.short_description,
         full_description = EXCLUDED.full_description,
         duration_days = EXCLUDED.duration_days,
         base_price = EXCLUDED.base_price,
         currency = EXCLUDED.currency,
         group_size = EXCLUDED.group_size,
         group_size_is_minimum = EXCLUDED.group_size_is_minimum,
         is_featured = EXCLUDED.is_featured,
         updated_at = now()`,
      [
        destinationId,
        tour.name,
        tour.slug,
        tour.shortDescription,
        tour.fullDescription,
        tour.durationDays,
        tour.basePrice,
        tour.currency,
        tour.groupSize,
        tour.groupSizeIsMinimum,
        tour.isFeatured,
      ]
    );
  }
}

async function seedTourCategories(client) {
  for (const [tourSlug, categorySlugs] of Object.entries(tourCategories)) {
    const tourResult = await client.query(
      `SELECT id FROM tours WHERE slug = $1`,
      [tourSlug]
    );
    if (tourResult.rows.length === 0) {
      throw new Error(`Tour not found for slug: ${tourSlug}`);
    }
    const tourId = tourResult.rows[0].id;

    for (const categorySlug of categorySlugs) {
      const catResult = await client.query(
        `SELECT id FROM categories WHERE slug = $1`,
        [categorySlug]
      );
      if (catResult.rows.length === 0) {
        throw new Error(`Category not found for slug: ${categorySlug}`);
      }
      const categoryId = catResult.rows[0].id;

      await client.query(
        `INSERT INTO tour_categories (tour_id, category_id)
         VALUES ($1, $2)
         ON CONFLICT (tour_id, category_id) DO NOTHING`,
        [tourId, categoryId]
      );
    }
  }
}

async function seedTourImages(client) {
  for (const [tourSlug, images] of Object.entries(tourImages)) {
    const tourResult = await client.query(
      `SELECT id FROM tours WHERE slug = $1`,
      [tourSlug]
    );
    if (tourResult.rows.length === 0) {
      throw new Error(`Tour not found for slug: ${tourSlug}`);
    }
    const tourId = tourResult.rows[0].id;

    // Delete existing images for this tour to ensure idempotency
    await client.query(
      `DELETE FROM tour_images WHERE tour_id = $1`,
      [tourId]
    );

    for (const img of images) {
      await client.query(
        `INSERT INTO tour_images (tour_id, image_url, alt_text, display_order, is_primary)
         VALUES ($1, $2, $3, $4, $5)`,
        [tourId, img.imageUrl, img.altText, img.displayOrder, img.isPrimary]
      );
    }
  }
}

async function seedTourItinerary(client) {
  for (const [tourSlug, days] of Object.entries(tourItinerary)) {
    const tourResult = await client.query(
      `SELECT id FROM tours WHERE slug = $1`,
      [tourSlug]
    );
    if (tourResult.rows.length === 0) {
      throw new Error(`Tour not found for slug: ${tourSlug}`);
    }
    const tourId = tourResult.rows[0].id;

    // Delete existing itinerary rows for this tour to ensure idempotency
    await client.query(
      `DELETE FROM tour_itinerary WHERE tour_id = $1`,
      [tourId]
    );

    for (const day of days) {
      await client.query(
        `INSERT INTO tour_itinerary (tour_id, day_number, day_label, title, description, display_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [tourId, day.dayNumber, day.dayLabel, day.title, day.description, day.dayNumber]
      );
    }
  }
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await seedDestinations(client);
    await seedCategories(client);
    await seedTours(client);
    await seedTourCategories(client);
    await seedTourImages(client);
    await seedTourItinerary(client);
    await client.query("COMMIT");
    console.log("Destinations, categories, tours, tour-category associations, tour images, and tour itineraries seeded successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(() => process.exit(1));