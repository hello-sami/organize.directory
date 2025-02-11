export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle root path
  if (path === '/') {
    const response = await fetch(new URL('/index.html', url.origin));
    if (!response.ok) return next();
    return new Response(response.body, response);
  }

  // Handle static pages
  const staticPages = ['about', 'location', 'issues', 'resources', 'contact'];
  if (staticPages.includes(path.slice(1))) {
    const response = await fetch(new URL(`${path}.html`, url.origin));
    if (!response.ok) return next();
    return new Response(response.body, response);
  }

  // Handle posts with clean URLs
  if (path.startsWith('/posts/')) {
    const response = await fetch(new URL(`${path}.html`, url.origin));
    if (!response.ok) return next();
    return new Response(response.body, response);
  }

  // List of cities (auto-generated)
  const cityNames = [
  "aberdeen",
  "abilene",
  "akron",
  "alameda-county",
  "albany",
  "albuquerque",
  "alpine-county",
  "altoona-johnstown",
  "amador-county",
  "amarillo",
  "ames",
  "anchorage",
  "ann-arbor",
  "annapolis",
  "fox-cities",
  "arcata",
  "arlington-ma",
  "asbury-park",
  "asheville",
  "ashtabula",
  "athens",
  "athens-ga",
  "atlanta",
  "auburn",
  "augusta",
  "aurora",
  "aurora-il",
  "austin",
  "bakersfield",
  "baltimore",
  "baton-rouge",
  "battle-creek",
  "beaumont-port-arthur",
  "bellingham",
  "bemidji",
  "bend",
  "berkeley",
  "biddeford-saco",
  "billings",
  "binghamton",
  "birmingham",
  "bismarck",
  "bloomington",
  "boise",
  "boone",
  "boston",
  "boulder",
  "bowling-green",
  "bozeman",
  "brainerd",
  "brookings",
  "broward-county",
  "brownsville",
  "brunswick",
  "buffalo",
  "burlington",
  "butte",
  "butte-county",
  "calaveras-county",
  "calvert-county",
  "cambridge",
  "cape-cod-islands",
  "casper",
  "catskills",
  "cedar-rapids",
  "central-al",
  "central-ar",
  "central-coast",
  "central-louisiana",
  "central-michigan",
  "central-nj",
  "central-valley",
  "champaign-urbana",
  "charleston",
  "charlotte",
  "charlottesville",
  "chattanooga",
  "chautauqua",
  "cheyenne",
  "chicago",
  "chico",
  "chillicothe",
  "cincinnati",
  "clarksville",
  "cleveland",
  "clovis-portales",
  "college-station",
  "colorado-springs",
  "columbia",
  "columbia-jeff-city",
  "columbus",
  "columbus-ga",
  "colusa-county",
  "concord",
  "contra-costa-county",
  "cookeville",
  "corpus-christi",
  "corvallis",
  "cumberland-valley",
  "dallas-fort-worth",
  "danville",
  "davis",
  "dayton",
  "dayton-springfield",
  "daytona-beach",
  "decatur",
  "deep-east-texas",
  "del-norte-county",
  "del-rio-eagle-pass",
  "denver",
  "des-moines",
  "detroit",
  "dmv",
  "dothan",
  "dover",
  "dubuque",
  "duluth-superior",
  "durango",
  "durham",
  "east-bay",
  "east-idaho",
  "east-oregon",
  "eastern-co",
  "eastern-ct",
  "eastern-kentucky",
  "eastern-montana",
  "eastern-nc",
  "eastern-panhandle",
  "eastern-shore",
  "eau-claire",
  "el-dorado-county",
  "el-paso",
  "elko",
  "elmira-corning",
  "erie",
  "eugene",
  "evansville",
  "fairbanks",
  "far-north-alaska",
  "fargo",
  "fargo-moorhead",
  "farmington",
  "fayetteville",
  "finger-lakes",
  "flagstaff-sedona",
  "flint",
  "florence-muscle-shoals",
  "florida-keys",
  "fort-collins-north-co",
  "fort-dodge",
  "fort-lauderdale",
  "fort-smith",
  "fort-wayne",
  "frederick",
  "fredericksburg",
  "fresno-county",
  "fresno-madera",
  "ft-myers-sw-florida",
  "gadsden-anniston",
  "gainesville",
  "galveston",
  "gary",
  "glenn-county",
  "glens-falls",
  "gold-country",
  "grand-forks",
  "grand-island",
  "grand-rapids",
  "great-falls",
  "green-bay",
  "greensboro",
  "greenville",
  "guam-micronesia",
  "gulfport-biloxi",
  "hampton-roads",
  "hanford-corcoran",
  "harrisburg",
  "harrisonburg",
  "hartford",
  "hattiesburg",
  "hawaii-island",
  "heartland-florida",
  "helena",
  "hickory-lenoir",
  "high-rockies",
  "hillsborough",
  "hilton-head",
  "holland",
  "holyoke",
  "homer-city",
  "hot-springs",
  "houma",
  "houston",
  "hudson",
  "hudson-valley",
  "humboldt-county",
  "huntington-ashland",
  "huntsville",
  "imperial-county",
  "indianapolis",
  "inland-empire",
  "interior-alaska",
  "inyo-county",
  "iowa-city",
  "isla-vista",
  "ithaca",
  "jackson",
  "jackson-ms",
  "jackson-tn",
  "jacksonville",
  "janesville",
  "jersey-city",
  "jersey-shore",
  "joplin",
  "juneau",
  "kalamazoo",
  "kalispell",
  "kansas-city",
  "kauai",
  "kenai-peninsula",
  "kennewick-pasco-richland",
  "kenosha-racine",
  "kern-county",
  "killeen-temple-ft-hood",
  "kings-county",
  "kingston",
  "kirksville",
  "klamath-falls",
  "knoxville",
  "kodiak",
  "kokomo",
  "la-crosse",
  "la-salle-co",
  "lafayette",
  "lafayette-west-lafayette",
  "lake-charles",
  "lake-county",
  "lake-of-the-ozarks",
  "lakeland",
  "lanai",
  "lancaster",
  "lansing",
  "laramie",
  "laredo",
  "las-cruces",
  "las-vegas",
  "lassen-county",
  "lawrence",
  "lawton",
  "lehigh-valley",
  "lewiston",
  "lewiston-clarkston",
  "lexington",
  "lima-findlay",
  "lincoln",
  "little-rock",
  "logan",
  "long-beach",
  "long-island",
  "los-angeles",
  "louisville",
  "lowell",
  "lubbock",
  "lynchburg",
  "macon-warner-robins",
  "madera-county",
  "madison",
  "manchester",
  "manhattan-ks",
  "mankato",
  "mansfield",
  "marin",
  "marin-county",
  "mariposa-county",
  "mason-city",
  "mattoon-charleston",
  "maui",
  "mcallen-edinburg",
  "meadville",
  "medford-ashland",
  "melbourne",
  "memphis",
  "mendocino",
  "mendocino-county",
  "merced",
  "merced-county",
  "meridian",
  "miami-dade",
  "milwaukee",
  "minneapolis-st-paul",
  "missoula",
  "mitchell",
  "mobile",
  "modesto",
  "modoc-county",
  "mohave-county",
  "molokai",
  "mono-county",
  "monroe",
  "montclair",
  "monterey",
  "monterey-bay",
  "monterey-county",
  "montgomery",
  "montpelier",
  "morgantown",
  "moses-lake",
  "muncie-anderson",
  "muskegon",
  "myrtle-beach",
  "napa-county",
  "nashua",
  "nashville",
  "ne-ar",
  "nevada-county",
  "new-haven",
  "new-london",
  "new-orleans",
  "new-paltz",
  "new-river-valley",
  "newark",
  "nome",
  "norcal",
  "norfolk",
  "norman",
  "north-al",
  "north-bay",
  "north-central-fl",
  "north-jersey",
  "north-mississippi",
  "north-platte",
  "northeast-sd",
  "northern-michigan",
  "northern-panhandle",
  "northern-wi",
  "northwest-ct",
  "northwest-ga",
  "northwest-ks",
  "northwest-ok",
  "nw-ar",
  "nyc",
  "oahu",
  "oakland",
  "ocala",
  "odessa-midland",
  "ogden-clearfield",
  "okaloosa-walton",
  "oklahoma-city",
  "olympia",
  "olympic-peninsula",
  "omaha-council-bluffs",
  "oneonta",
  "orange-county",
  "oregon-coast",
  "orlando",
  "outer-banks",
  "owensboro",
  "palm-beach-county",
  "palm-springs",
  "panama-city",
  "parkersburg-marietta",
  "pensacola",
  "peoria",
  "philadelphia",
  "phoenix",
  "phoenix-east-valley",
  "phoenix-north-valley",
  "phoenix-west-valley",
  "pierre",
  "pierre-central-sd",
  "pittsburgh",
  "placer-county",
  "plano",
  "plattsburgh-adirondacks",
  "plumas-county",
  "poconos",
  "pomona",
  "port-huron",
  "portland",
  "portland-me",
  "portsmouth",
  "potsdam-canton-massena",
  "prescott",
  "providence",
  "provo-orem",
  "pueblo",
  "puerto-rico",
  "pullman-moscow",
  "quad-cities",
  "racine",
  "raleigh",
  "raleigh-durham-ch",
  "rapid-city",
  "rapid-city-west-sd",
  "reading",
  "redding",
  "redlands",
  "redmond",
  "reno-tahoe",
  "richmond",
  "richmond-in",
  "rio-grande-valley",
  "riverside",
  "riverside-county",
  "roanoke",
  "rochester",
  "rockford",
  "rockville",
  "rogue-valley",
  "roseburg",
  "roswell-carlsbad",
  "sacramento",
  "sacramento-county",
  "saginaw-midland-baycity",
  "salem",
  "salina",
  "salt-lake-city",
  "san-angelo",
  "san-antonio",
  "san-benito-county",
  "san-bernardino-county",
  "san-diego",
  "san-diego-county",
  "san-francisco",
  "san-joaquin-county",
  "san-joaquin-valley",
  "san-jose",
  "san-luis-obispo",
  "san-luis-obispo-county",
  "san-marcos",
  "san-mateo",
  "san-mateo-county",
  "sandusky",
  "santa-ana",
  "santa-barbara",
  "santa-barbara-county",
  "santa-clara-county",
  "santa-cruz",
  "santa-cruz-county",
  "santa-fe-taos",
  "santa-maria",
  "santa-rosa",
  "sarasota-bradenton",
  "savannah-hinesville",
  "scottsbluff-panhandle",
  "scranton-wilkes-barre",
  "seacoast",
  "seattle-tacoma",
  "sf-bay-area",
  "shasta",
  "sheboygan",
  "sheridan",
  "show-low",
  "shreveport",
  "sierra",
  "sierra-vista",
  "sioux-city",
  "sioux-falls",
  "sioux-falls-se-sd",
  "siskiyou-county",
  "skagit",
  "socal",
  "solano-county",
  "somerville",
  "sonoma-county",
  "south-al",
  "south-bay",
  "south-bend-michiana",
  "south-central-alaska",
  "south-coast",
  "south-florida",
  "south-jersey",
  "southeast-alaska",
  "southeast-ia",
  "southeast-ks",
  "southeast-missouri",
  "southern-illinois",
  "southern-maryland",
  "southern-wv",
  "southern-oregon",
  "southwest-alaska",
  "southwest-ks",
  "southwest-michigan",
  "southwest-mn",
  "southwest-ms",
  "southwest-tx",
  "southwest-va",
  "space-coast",
  "spartanburg",
  "spokane",
  "springfield",
  "springfield-il",
  "springfield-ma",
  "springfield-mo",
  "st-augustine",
  "st-cloud",
  "st-george",
  "st-joseph",
  "st-louis",
  "stanislaus-county",
  "state-college",
  "statesboro",
  "stillwater",
  "stockton",
  "susanville",
  "sutter-county",
  "syracuse",
  "tallahassee",
  "tampa",
  "tehama-county",
  "tempe",
  "terre-haute",
  "texoma",
  "the-thumb",
  "toledo",
  "topeka",
  "treasure-coast",
  "trenton",
  "tri-cities",
  "trinity-county",
  "tucson",
  "tulare-county",
  "tulsa",
  "tuolumne-county",
  "tupelo",
  "tuscaloosa",
  "tuscarawas-co",
  "twin-falls",
  "twin-tiers-ny-pa",
  "tyler-east-tx",
  "u-s-virgin-islands",
  "upper-peninsula",
  "upper-valley",
  "utica-rome-oneida",
  "valdosta",
  "vancouver-wa",
  "ventura-county",
  "victoria",
  "virginia-beach",
  "visalia-tulare",
  "waco",
  "waltham",
  "washington",
  "washington-dc",
  "waterloo-cedar-falls",
  "watertown",
  "watsonville",
  "wausau",
  "wenatchee",
  "westchester",
  "western-il",
  "western-ky",
  "western-maryland",
  "western-massachusetts",
  "western-slope",
  "wichita",
  "wichita-falls",
  "willamette-valley",
  "williamsport",
  "wilmington-de",
  "wilmington-nc",
  "winchester",
  "winona",
  "winston-salem",
  "worcester-central-ma",
  "yakima",
  "yolo-county",
  "york",
  "youngstown",
  "ypsilanti",
  "yuba-county",
  "yuba-sutter",
  "yuma",
  "zanesville-cambridge"
];

  // Handle city pages with clean URLs
  const cityPath = path.slice(1); // Remove leading slash
  if (cityNames.includes(cityPath)) {
    const response = await fetch(new URL(`/cities/${cityPath}.html`, url.origin));
    if (!response.ok) return next();
    return new Response(response.body, response);
  }

  // Handle state pages with clean URLs
  const stateNames = [
    'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado',
    'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho',
    'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana',
    'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota',
    'mississippi', 'missouri', 'montana', 'nebraska', 'nevada',
    'new-hampshire', 'new-jersey', 'new-mexico', 'new-york',
    'north-carolina', 'north-dakota', 'ohio', 'oklahoma', 'oregon',
    'pennsylvania', 'rhode-island', 'south-carolina', 'south-dakota',
    'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington',
    'west-virginia', 'wisconsin', 'wyoming'
  ];

  const statePath = path.slice(1);
  if (stateNames.includes(statePath)) {
    const response = await fetch(new URL(`/states/${statePath}.html`, url.origin));
    if (!response.ok) return next();
    return new Response(response.body, response);
  }

  // If no matches, continue to next middleware/static file handling
  return next();
}