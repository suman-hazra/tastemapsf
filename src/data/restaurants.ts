// Phase 1 country + restaurant seed. Hand-curated from public best-of lists
// (Eater 38, Michelin Bib Gourmand, r/sanfrancisco threads) and general
// knowledge as of the seed date. Quality > breadth: 18 countries.
//
// SPOT-CHECK PASS NEEDED: replace any picks you disagree with. Some countries
// (Argentina, Israel, Yemen) have thin SF representation — I gave a starting
// point but you almost certainly know better picks. Card content is name +
// neighborhood only (no rating/price — staleness liability per the design
// review). The card builds a Google Maps search link on the fly from those
// two fields, so no per-entry URLs to maintain.

import type { Country } from "./types";

export const countries: Country[] = [
  // ───────────────────────────── EUROPE ─────────────────────────────
  {
    id: "italy",
    name: "Italy",
    continent: "Europe",
    flag: "🇮🇹",
    cuisine_summary:
      "Italian food is regional and ingredient-driven — long, slow Sundays of fresh pasta, wood-fired pizzas, and tomato sauces that taste like the tomato.",
    signature_dishes: [
      {
        name: "Cacio e pepe",
        description:
          "Pasta tossed with pecorino and black pepper — three ingredients, all about technique.",
      },
      {
        name: "Pizza margherita",
        description:
          "Tomato, mozzarella, basil on a charred, chewy crust. The standard everything else gets measured against.",
      },
      {
        name: "Tiramisu",
        description:
          "Espresso-soaked ladyfingers layered with sweet mascarpone — Italy's answer to coffee dessert.",
      },
    ],
    restaurants: [
      {
        id: "tonys-pizza-napoletana",
        name: "Tony's Pizza Napoletana",
        neighborhood: "North Beach",
      },
      {
        id: "cotogna",
        name: "Cotogna",
        neighborhood: "Jackson Square",
      },
    ],
  },
  {
    id: "france",
    name: "France",
    continent: "Europe",
    flag: "🇫🇷",
    cuisine_summary:
      "Classic French cooking is patient and buttery — long lunches with crusty bread, sauces that took an afternoon, and dessert you crack with a spoon.",
    signature_dishes: [
      {
        name: "Steak frites",
        description:
          "Grilled steak with crispy fries — the bistro lunch staple. Order it medium-rare.",
      },
      {
        name: "Croque monsieur",
        description:
          "Open-faced ham and gruyère sandwich, finished under the broiler with béchamel.",
      },
      {
        name: "Crème brûlée",
        description:
          "Vanilla custard with a torched sugar crust you crack with the back of a spoon.",
      },
    ],
    restaurants: [
      {
        id: "cafe-claude",
        name: "Café Claude",
        neighborhood: "Union Square",
      },
      {
        id: "petit-crenn",
        name: "Petit Crenn",
        neighborhood: "Hayes Valley",
      },
    ],
  },
  {
    id: "spain",
    name: "Spain",
    continent: "Europe",
    flag: "🇪🇸",
    cuisine_summary:
      "Spanish food is small plates and long evenings — sherry-paired tapas, cured ham sliced paper-thin, and rice cooked in a wide pan over fire.",
    signature_dishes: [
      {
        name: "Patatas bravas",
        description:
          "Fried potatoes with smoky tomato sauce and garlic aioli. Bar food, perfected.",
      },
      {
        name: "Jamón ibérico",
        description:
          "Dry-cured ham from acorn-fed pigs, sliced thin enough to melt on your tongue.",
      },
      {
        name: "Paella valenciana",
        description:
          "Saffron rice cooked over fire with seafood or chicken. The crusty bottom (socarrat) is the prize.",
      },
    ],
    restaurants: [
      {
        id: "bocadillos",
        name: "Bocadillos",
        neighborhood: "Jackson Square",
      },
      {
        id: "coqueta",
        name: "Coqueta",
        neighborhood: "Embarcadero",
      },
    ],
  },

  // ─────────────────────── NORTH AMERICA ───────────────────────
  {
    id: "mexico",
    name: "Mexico",
    continent: "North America",
    flag: "🇲🇽",
    cuisine_summary:
      "Mexican food in SF is more regional than the burrito stereotype — tacos al pastor off a vertical spit, mole that took two days, and salsas with real heat.",
    signature_dishes: [
      {
        name: "Carnitas tacos",
        description:
          "Slow-cooked pork shoulder, crisped and piled into corn tortillas with onion and cilantro.",
      },
      {
        name: "Pozole rojo",
        description:
          "Hominy stew with pork in a chile broth — garnish-your-own with cabbage, radish, lime.",
      },
      {
        name: "Chiles rellenos",
        description:
          "Roasted poblano peppers stuffed with cheese, dipped in egg batter, and fried golden.",
      },
    ],
    restaurants: [
      {
        id: "la-taqueria",
        name: "La Taqueria",
        neighborhood: "Mission",
      },
      {
        id: "nopalito",
        name: "Nopalito",
        neighborhood: "Inner Sunset",
      },
    ],
  },

  // ─────────────────────── SOUTH AMERICA ───────────────────────
  {
    id: "peru",
    name: "Peru",
    continent: "South America",
    flag: "🇵🇪",
    cuisine_summary:
      "Peruvian food fuses indigenous, Spanish, Chinese, and Japanese influences — bright citrus-cured ceviche, stir-fried beef over fries, and creamy chicken stews.",
    signature_dishes: [
      {
        name: "Lomo saltado",
        description:
          "Beef stir-fried with onions, tomato, and soy sauce — served over rice with fries. The Peru-China crossover hit.",
      },
      {
        name: "Ceviche",
        description:
          "Raw white fish cured in lime, chile, and red onion. Cold, bright, addictive.",
      },
      {
        name: "Ají de gallina",
        description:
          "Shredded chicken in a creamy aji amarillo sauce, served over rice and potato.",
      },
    ],
    restaurants: [
      {
        id: "limon-rotisserie",
        name: "Limón Rotisserie",
        neighborhood: "Mission",
      },
      {
        id: "pasion",
        name: "Pasión",
        neighborhood: "Mission",
      },
    ],
  },
  {
    id: "argentina",
    name: "Argentina",
    continent: "South America",
    flag: "🇦🇷",
    cuisine_summary:
      "Argentine cooking is wood smoke and beef — grilled meats with chimichurri, baked savory hand pies, and a wine country sensibility on the side.",
    signature_dishes: [
      {
        name: "Empanadas",
        description:
          "Hand pies stuffed with seasoned beef, chicken, or cheese. Baked, not fried — the everyday Argentine snack.",
      },
      {
        name: "Asado",
        description:
          "Mixed grill of beef cuts, sausages, and offal. The Sunday family ritual.",
      },
      {
        name: "Chimichurri",
        description:
          "Bright herbaceous sauce of parsley, garlic, vinegar, and oil — the steak's required companion.",
      },
    ],
    restaurants: [
      {
        id: "lolinda",
        name: "Lolinda",
        neighborhood: "Mission",
      },
    ],
  },

  // ───────────────────────────── ASIA ─────────────────────────────
  {
    id: "china",
    name: "China",
    continent: "Asia",
    flag: "🇨🇳",
    cuisine_summary:
      "Chinese food in SF spans regions and eras — dim sum carts in Chinatown, soup dumplings folded with 18 pleats, and Sichuan numbing-hot chiles that buzz the lips.",
    signature_dishes: [
      {
        name: "Xiaolongbao",
        description:
          "Shanghai soup dumplings — bite the side, sip the broth, then eat the rest. Don't burn yourself.",
      },
      {
        name: "Mapo tofu",
        description:
          "Silken tofu in a numbing chile-bean sauce with ground pork. Sichuan's calling card.",
      },
      {
        name: "Dan dan noodles",
        description:
          "Thin wheat noodles in spicy sesame-chile sauce with crispy pork. Mix before eating.",
      },
    ],
    restaurants: [
      {
        id: "mister-jius",
        name: "Mister Jiu's",
        neighborhood: "Chinatown",
      },
      {
        id: "yank-sing",
        name: "Yank Sing",
        neighborhood: "SoMa",
      },
    ],
  },
  {
    id: "japan",
    name: "Japan",
    continent: "Asia",
    flag: "🇯🇵",
    cuisine_summary:
      "Japanese food in SF is more than sushi — pork-bone ramen that took 12 hours, izakaya plates and beer with friends, and quietly precise omakase counters.",
    signature_dishes: [
      {
        name: "Sushi & sashimi",
        description:
          "Vinegared rice or pure fish, sliced by someone who's been doing it 20 years. Trust the chef.",
      },
      {
        name: "Tonkotsu ramen",
        description:
          "Pork bone broth simmered until milky, with chashu pork, soft egg, and chewy noodles.",
      },
      {
        name: "Tempura",
        description:
          "Vegetables and seafood in a crisp, lacy batter. Best straight from the fryer.",
      },
    ],
    restaurants: [
      {
        id: "rintaro",
        name: "Rintaro",
        neighborhood: "Mission",
      },
      {
        id: "robin",
        name: "Robin",
        neighborhood: "Hayes Valley",
      },
    ],
  },
  {
    id: "korea",
    name: "Korea",
    continent: "Asia",
    flag: "🇰🇷",
    cuisine_summary:
      "Korean food is fermented depth and tabletop fire — banchan side dishes that arrive before you order, soups that cure colds, and meat you grill yourself.",
    signature_dishes: [
      {
        name: "Korean BBQ",
        description:
          "Grill cuts like galbi (short rib) and samgyeopsal (pork belly) at your table; wrap in lettuce with rice and ssamjang.",
      },
      {
        name: "Bibimbap",
        description:
          "Rice bowl topped with sautéed vegetables, a fried egg, and gochujang — stir hard before eating.",
      },
      {
        name: "Kimchi jjigae",
        description:
          "Stew of aged kimchi with pork or tuna. Sour, spicy, deeply restorative.",
      },
    ],
    restaurants: [
      {
        id: "san-ho-won",
        name: "San Ho Won",
        neighborhood: "Mission",
      },
      {
        id: "toyose",
        name: "Toyose",
        neighborhood: "Outer Sunset",
      },
    ],
  },
  {
    id: "thailand",
    name: "Thailand",
    continent: "Asia",
    flag: "🇹🇭",
    cuisine_summary:
      "Thai food balances four flavors at once — sweet, sour, salty, spicy. Curries built on pounded paste, stir-fried noodles with a smoky wok char, and herb-heavy salads.",
    signature_dishes: [
      {
        name: "Pad see ew",
        description:
          "Wide rice noodles stir-fried with Chinese broccoli, egg, and dark soy. Less sweet than pad thai, more wok smoke.",
      },
      {
        name: "Tom kha gai",
        description:
          "Coconut soup with chicken, galangal, lemongrass, and chile. Comforting and bright at the same time.",
      },
      {
        name: "Green curry",
        description:
          "Coconut milk curry of fresh green chiles, basil, and chicken or eggplant. Eat over jasmine rice.",
      },
    ],
    restaurants: [
      {
        id: "kin-khao",
        name: "Kin Khao",
        neighborhood: "Union Square",
      },
      {
        id: "lers-ros",
        name: "Lers Ros",
        neighborhood: "Hayes Valley",
      },
    ],
  },
  {
    id: "vietnam",
    name: "Vietnam",
    continent: "Asia",
    flag: "🇻🇳",
    cuisine_summary:
      "Vietnamese food is bright, light, and full of herbs — rice noodle soups perfumed with star anise, baguette sandwiches from the French era, and a lot of lime.",
    signature_dishes: [
      {
        name: "Phở",
        description:
          "Beef noodle soup in long-simmered broth with star anise and clove. Add basil, sprouts, lime, chile to taste.",
      },
      {
        name: "Bánh mì",
        description:
          "Crusty baguette with pâté, pickled daikon and carrot, cucumber, cilantro, and meat. The Franco-Vietnamese sandwich.",
      },
      {
        name: "Bún bò Huế",
        description:
          "Spicy lemongrass beef noodle soup from central Vietnam — bolder and more pungent than phở.",
      },
    ],
    restaurants: [
      {
        id: "turtle-tower",
        name: "Turtle Tower",
        neighborhood: "Tenderloin",
      },
      {
        id: "saigon-sandwich",
        name: "Saigon Sandwich",
        neighborhood: "Tenderloin",
      },
    ],
  },
  {
    id: "india",
    name: "India",
    continent: "Asia",
    flag: "🇮🇳",
    cuisine_summary:
      "Indian food is regional spice and technique — North Indian tandoor-charred breads and creamy curries, South Indian dosas crisp as paper, and biryani layered with saffron rice.",
    signature_dishes: [
      {
        name: "Chicken tikka masala",
        description:
          "Yogurt-marinated chicken in a tomato-cream sauce. Brit-Indian classic, weeknight favorite.",
      },
      {
        name: "Masala dosa",
        description:
          "Thin, crispy rice-and-lentil crepe wrapped around spiced potato. Eat with sambar and coconut chutney.",
      },
      {
        name: "Biryani",
        description:
          "Long-grain basmati rice layered with marinated meat, saffron, and fried onion. Special-occasion food.",
      },
    ],
    restaurants: [
      {
        id: "dosa",
        name: "DOSA",
        neighborhood: "Fillmore",
      },
      {
        id: "besharam",
        name: "Besharam",
        neighborhood: "Dogpatch",
      },
    ],
  },
  {
    id: "burma",
    name: "Burma (Myanmar)",
    continent: "Asia",
    flag: "🇲🇲",
    cuisine_summary:
      "Burmese food sits at the crossroads of India, China, and Thailand — tea-leaf salads tossed at the table, coconut chicken noodle soup, and lots of crunchy fried bits.",
    signature_dishes: [
      {
        name: "Tea leaf salad (lahpet thoke)",
        description:
          "Fermented tea leaves tossed tableside with crunchy lentils, peanuts, sesame, cabbage, and lime. The dish to order first.",
      },
      {
        name: "Mohinga",
        description:
          "Catfish-and-rice-noodle soup with lemongrass. The Burmese breakfast, eaten all day.",
      },
      {
        name: "Coconut chicken noodle soup (ohn no khao swè)",
        description:
          "Yellow curry coconut broth with egg noodles and chicken. Garnish with fried onions, chile, lime, hard egg.",
      },
    ],
    restaurants: [
      {
        id: "burma-superstar",
        name: "Burma Superstar",
        neighborhood: "Inner Richmond",
      },
      {
        id: "mandalay",
        name: "Mandalay",
        neighborhood: "Inner Richmond",
      },
    ],
  },
  {
    id: "philippines",
    name: "Philippines",
    continent: "Asia",
    flag: "🇵🇭",
    cuisine_summary:
      "Filipino food is bold and proudly sour — vinegar-braised meats, garlicky rice, and pork that fights with a fork. Plus halo-halo (lit. \"mix-mix\") for dessert.",
    signature_dishes: [
      {
        name: "Adobo",
        description:
          "Chicken or pork braised in vinegar, soy, garlic, and bay. Every family has their version.",
      },
      {
        name: "Sisig",
        description:
          "Sizzling chopped pork (jowl + ear, classically) with onion, chile, and citrus. Eat with rice and a cold beer.",
      },
      {
        name: "Halo-halo",
        description:
          "Shaved ice with sweet beans, jellies, fruit, ube ice cream, and evaporated milk. Stir before eating.",
      },
    ],
    restaurants: [
      {
        id: "abaca",
        name: "Abacá",
        neighborhood: "Marina",
      },
    ],
  },

  // ───────────────────────── MIDDLE EAST ─────────────────────────
  {
    id: "lebanon",
    name: "Lebanon",
    continent: "Middle East",
    flag: "🇱🇧",
    cuisine_summary:
      "Lebanese food is the mezze table — bowls of hummus and labneh, charred eggplant smoked over flame, and warm flatbread arriving in stacks.",
    signature_dishes: [
      {
        name: "Hummus with warm pita",
        description:
          "Smooth chickpea-tahini purée with lemon and good olive oil. Served warm, eaten with bread torn from the pile.",
      },
      {
        name: "Shawarma",
        description:
          "Marinated meat shaved from a vertical spit, wrapped in flatbread with garlic sauce and pickles.",
      },
      {
        name: "Mujadara",
        description:
          "Lentils and rice with deeply caramelized onions on top. Humble, perfect, vegetarian.",
      },
    ],
    restaurants: [
      {
        id: "beit-rima",
        name: "Beit Rima",
        neighborhood: "Castro",
      },
    ],
  },
  {
    id: "yemen",
    name: "Yemen",
    continent: "Middle East",
    flag: "🇾🇪",
    cuisine_summary:
      "Yemeni cooking is slow-roasted lamb and beef, smoky clay-oven breads, and side condiments that range from herbaceous to mouth-burning.",
    signature_dishes: [
      {
        name: "Mandi",
        description:
          "Spiced rice with slow-roasted lamb or chicken cooked in a tandoor-like pit. Served on a communal platter.",
      },
      {
        name: "Saltah",
        description:
          "Brown meat stew topped with fenugreek froth, eaten with flatbread. Yemen's national dish.",
      },
      {
        name: "Bint as-sahn",
        description:
          "Flaky honey bread, layered with butter, drizzled with honey, dusted with black seed. Breakfast or anytime.",
      },
    ],
    restaurants: [
      {
        id: "saba",
        name: "Saba",
        neighborhood: "Tenderloin",
      },
    ],
  },
  {
    id: "israel",
    name: "Israel",
    continent: "Middle East",
    flag: "🇮🇱",
    cuisine_summary:
      "Israeli food draws from across the diaspora and the region — hummus shops with lifelong regulars, eggs poached in spiced tomato, and pita stuffed with falafel and pickles.",
    signature_dishes: [
      {
        name: "Hummus (the meal kind)",
        description:
          "Warm, mounded chickpea purée with olive oil, sometimes meat or whole chickpeas on top. Eaten with pita, not as a dip.",
      },
      {
        name: "Sabich",
        description:
          "Pita stuffed with fried eggplant, hard-boiled egg, hummus, tahini, amba (mango pickle), and herbs.",
      },
      {
        name: "Shakshuka",
        description:
          "Eggs poached in spiced tomato-pepper sauce. Breakfast for two, eaten straight from the pan with bread.",
      },
    ],
    restaurants: [],
  },

  // ─────────────────────────── AFRICA ───────────────────────────
  {
    id: "ethiopia",
    name: "Ethiopia",
    continent: "Africa",
    flag: "🇪🇹",
    cuisine_summary:
      "Ethiopian food is communal — a big round of spongy sourdough flatbread (injera) topped with stews you tear off pieces to scoop up. Spice-heavy, no utensils.",
    signature_dishes: [
      {
        name: "Doro wat with injera",
        description:
          "Chicken stew with berbere spice and hard-boiled egg, scooped with injera. The Sunday dish.",
      },
      {
        name: "Tibs",
        description:
          "Beef or lamb sautéed with onion, peppers, and rosemary. Crispy edges, tender center.",
      },
      {
        name: "Kitfo",
        description:
          "Hand-minced raw beef seasoned with mitmita spice and clarified spiced butter. Eat with injera and ayib (mild cheese).",
      },
    ],
    restaurants: [
      {
        id: "moya-restaurant",
        name: "Moya Restaurant",
        neighborhood: "Mission",
      },
      {
        id: "axum-cafe",
        name: "Axum Cafe",
        neighborhood: "Lower Haight",
      },
    ],
  },
];
