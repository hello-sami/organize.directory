import fetch from 'node-fetch';

// List of all cities with zero initiatives (from the count-initiatives.js output)
const zeroInitiativeCities = [
    "bismarck", "calaveras-county", "central-louisiana", "central-michigan", "central-nj",
    "cheyenne", "chillicothe", "contra-costa-county", "cookeville", "cumberland-valley",
    "decatur", "deep-east-texas", "del-rio-eagle-pass", "dover", "east-idaho",
    "east-oregon", "eastern-co", "eastern-ct", "eastern-montana", "eastern-nc",
    "eastern-panhandle", "eastern-shore", "eau-claire", "el-dorado-county", "elko",
    "erie", "evansville", "fargo-moorhead", "fargo", "farmington", "fayetteville",
    "finger-lakes", "flint", "florida-keys", "fort-smith", "frederick", "fredericksburg",
    "fresno-county", "ft-myers-sw-florida", "gadsden-anniston", "glenn-county",
    "glens-falls", "gold-country", "grand-forks", "guam-micronesia", "gulfport-biloxi",
    "hanford-corcoran", "harrisonburg", "hawaii-island", "heartland-florida", "helena",
    "hickory-lenoir", "high-rockies", "hilton-head", "holland", "houma",
    "huntington-ashland", "imperial-county", "inyo-county", "jackson-tn", "jackson",
    "janesville", "joplin", "juneau", "kalispell", "kauai", "kenai-peninsula",
    "kennewick-pasco-richland", "kenosha-racine", "killeen-temple-ft-hood", "kings-county",
    "klamath-falls", "kodiak", "kokomo", "la-crosse", "lafayette", "lake-charles",
    "lake-county", "lake-of-the-ozarks", "lanai", "las-cruces", "lassen-county",
    "lawton", "lewiston-clarkston", "lewiston", "lima-findlay", "lubbock",
    "macon-warner-robins", "madera-county", "manhattan-ks", "mansfield", "marin-county",
    "mariposa-county", "mason-city", "mattoon-charleston", "mcallen-edinburg",
    "meadville", "merced-county", "merced", "meridian", "mitchell", "modoc-county",
    "mohave-county", "molokai", "mono-county", "monroe", "moses-lake",
    "muncie-anderson", "muskegon", "napa-county", "nashua", "new-haven", "nome",
    "north-jersey", "north-mississippi", "north-platte", "northeast-sd",
    "northern-michigan", "northern-panhandle", "northern-wi", "northwest-ct",
    "northwest-ga", "northwest-ks", "northwest-ok", "odessa-midland", "okaloosa-walton",
    "olympic-peninsula", "oneonta", "oregon-coast", "outer-banks", "owensboro",
    "panama-city", "parkersburg-marietta", "peoria", "phoenix-east-valley",
    "phoenix-north-valley", "phoenix-west-valley", "pierre-central-sd", "pierre",
    "placer-county", "plattsburgh-adirondacks", "plumas-county", "poconos",
    "port-huron", "portsmouth", "potsdam-canton-massena", "prescott", "pueblo",
    "pullman-moscow", "quad-cities", "rapid-city-west-sd", "rapid-city",
    "riverside-county", "roseburg", "roswell-carlsbad", "sacramento-county",
    "saginaw-midland-baycity", "salina", "san-angelo", "san-benito-county",
    "san-joaquin-county", "san-luis-obispo-county", "san-mateo-county", "sandusky",
    "santa-barbara-county", "santa-clara-county", "santa-cruz-county", "santa-maria",
    "sarasota-bradenton", "scottsbluff-panhandle", "scranton-wilkes-barre",
    "sheboygan", "show-low", "sierra", "sioux-city", "sioux-falls", "siskiyou-county",
    "south-al", "south-coast", "southeast-ia", "southeast-ks", "southeast-missouri",
    "southern-illinois", "southern-maryland", "southern-wv", "southwest-ks",
    "southwest-michigan", "southwest-mn", "southwest-ms", "southwest-tx",
    "southwest-va", "st-augustine", "st-cloud", "st-george", "st-joseph",
    "stanislaus-county", "state-college", "statesboro", "stillwater", "stockton",
    "susanville", "sutter-county", "syracuse", "tehama-county", "terre-haute",
    "texoma", "the-thumb", "topeka", "tri-cities", "trinity-county", "tulare-county",
    "tuolumne-county", "tuscarawas-co", "twin-falls", "twin-tiers-ny-pa",
    "tyler-east-tx", "u-s-virgin-islands", "upper-peninsula", "upper-valley",
    "utica-rome-oneida", "valdosta", "vancouver-wa", "victoria", "visalia-tulare",
    "waco", "western-il", "western-ky", "western-maryland", "western-slope",
    "wichita-falls", "yolo-county", "york", "yuba-county", "yuba-sutter",
    "zanesville-cambridge"
];

// Population data for individual cities
const cityData = {
    "bismarck": { city: "Bismarck", state: "ND", population: 73622 },
    "cheyenne": { city: "Cheyenne", state: "WY", population: 65132 },
    "chillicothe": { city: "Chillicothe", state: "OH", population: 21796 },
    "cookeville": { city: "Cookeville", state: "TN", population: 34842 },
    "decatur": { city: "Decatur", state: "IL", population: 70522 },
    "dover": { city: "Dover", state: "DE", population: 39403 },
    "eau-claire": { city: "Eau Claire", state: "WI", population: 69421 },
    "elko": { city: "Elko", state: "NV", population: 20467 },
    "erie": { city: "Erie", state: "PA", population: 94831 },
    "evansville": { city: "Evansville", state: "IN", population: 117298 },
    "fargo": { city: "Fargo", state: "ND", population: 125990 },
    "farmington": { city: "Farmington", state: "NM", population: 46624 },
    "fayetteville": { city: "Fayetteville", state: "AR", population: 93949 },
    "flint": { city: "Flint", state: "MI", population: 81252 },
    "fort-smith": { city: "Fort Smith", state: "AR", population: 89142 },
    "frederick": { city: "Frederick", state: "MD", population: 78171 },
    "fredericksburg": { city: "Fredericksburg", state: "VA", population: 27982 },
    "grand-forks": { city: "Grand Forks", state: "ND", population: 57011 },
    "harrisonburg": { city: "Harrisonburg", state: "VA", population: 51814 },
    "helena": { city: "Helena", state: "MT", population: 32091 },
    "houma": { city: "Houma", state: "LA", population: 32467 },
    "jackson": { city: "Jackson", state: "MS", population: 153701 },
    "janesville": { city: "Janesville", state: "WI", population: 64575 },
    "joplin": { city: "Joplin", state: "MO", population: 51762 },
    "juneau": { city: "Juneau", state: "AK", population: 32255 },
    "kalispell": { city: "Kalispell", state: "MT", population: 24565 },
    "kokomo": { city: "Kokomo", state: "IN", population: 45468 },
    "lafayette": { city: "Lafayette", state: "LA", population: 121374 },
    "las-cruces": { city: "Las Cruces", state: "NM", population: 111385 },
    "lawton": { city: "Lawton", state: "OK", population: 93025 },
    "lewiston": { city: "Lewiston", state: "ME", population: 36592 },
    "lubbock": { city: "Lubbock", state: "TX", population: 257141 },
    "mansfield": { city: "Mansfield", state: "OH", population: 46527 },
    "merced": { city: "Merced", state: "CA", population: 86333 },
    "meridian": { city: "Meridian", state: "ID", population: 117635 },
    "mitchell": { city: "Mitchell", state: "SD", population: 15668 },
    "monroe": { city: "Monroe", state: "LA", population: 47702 },
    "muncie": { city: "Muncie", state: "IN", population: 65194 },
    "muskegon": { city: "Muskegon", state: "MI", population: 38401 },
    "nashua": { city: "Nashua", state: "NH", population: 89355 },
    "new-haven": { city: "New Haven", state: "CT", population: 130250 },
    "nome": { city: "Nome", state: "AK", population: 3699 },
    "oneonta": { city: "Oneonta", state: "NY", population: 13901 },
    "owensboro": { city: "Owensboro", state: "KY", population: 59273 },
    "peoria": { city: "Peoria", state: "IL", population: 113150 },
    "pierre": { city: "Pierre", state: "SD", population: 13961 },
    "port-huron": { city: "Port Huron", state: "MI", population: 28907 },
    "portsmouth": { city: "Portsmouth", state: "VA", population: 97915 },
    "prescott": { city: "Prescott", state: "AZ", population: 45827 },
    "pueblo": { city: "Pueblo", state: "CO", population: 111876 },
    "roseburg": { city: "Roseburg", state: "OR", population: 21181 },
    "salina": { city: "Salina", state: "KS", population: 46889 },
    "san-angelo": { city: "San Angelo", state: "TX", population: 101004 },
    "sandusky": { city: "Sandusky", state: "OH", population: 24564 },
    "santa-maria": { city: "Santa Maria", state: "CA", population: 107263 },
    "sheboygan": { city: "Sheboygan", state: "WI", population: 48327 },
    "show-low": { city: "Show Low", state: "AZ", population: 11732 },
    "sioux-city": { city: "Sioux City", state: "IA", population: 85791 },
    "sioux-falls": { city: "Sioux Falls", state: "SD", population: 192517 },
    "statesboro": { city: "Statesboro", state: "GA", population: 33438 },
    "stillwater": { city: "Stillwater", state: "OK", population: 48394 },
    "stockton": { city: "Stockton", state: "CA", population: 320804 },
    "susanville": { city: "Susanville", state: "CA", population: 13717 },
    "syracuse": { city: "Syracuse", state: "NY", population: 148620 },
    "terre-haute": { city: "Terre Haute", state: "IN", population: 60622 },
    "topeka": { city: "Topeka", state: "KS", population: 126587 },
    "valdosta": { city: "Valdosta", state: "GA", population: 56457 },
    "victoria": { city: "Victoria", state: "TX", population: 67470 },
    "waco": { city: "Waco", state: "TX", population: 138183 },
    "wichita-falls": { city: "Wichita Falls", state: "TX", population: 102316 },
    "york": { city: "York", state: "PA", population: 44118 },
    "zanesville": { city: "Zanesville", state: "OH", population: 24881 }
};

function analyzeData() {
    console.log('Cross-Reference Analysis:');
    console.log('--------------------------------------------------------');
    
    // Find cities under 50k
    const citiesUnder50k = [];
    for (const [city, data] of Object.entries(cityData)) {
        if (data.population < 50000) {
            citiesUnder50k.push(`${data.city}, ${data.state}: ${data.population.toLocaleString()} people`);
        }
    }
    
    // Find entries that are in zeroInitiativeCities but not in cityData (regions, counties, etc.)
    const regionsAndCounties = zeroInitiativeCities.filter(city => !cityData[city]);
    
    // Find entries that are in cityData but not in zeroInitiativeCities (if any)
    const missingCities = Object.keys(cityData).filter(city => !zeroInitiativeCities.includes(city));
    
    console.log('Individual cities with 0 initiatives and population under 50,000:');
    console.log('--------------------------------------------------------');
    citiesUnder50k.sort();
    citiesUnder50k.forEach(city => console.log(city));
    
    console.log('\nStatistics:');
    console.log('--------------------------------------------------------');
    console.log(`Total zero initiative locations: ${zeroInitiativeCities.length}`);
    console.log(`Individual cities with population data: ${Object.keys(cityData).length}`);
    console.log(`Cities under 50,000 population: ${citiesUnder50k.length}`);
    console.log(`Regions, counties, and multi-city areas: ${regionsAndCounties.length}`);
    
    if (missingCities.length > 0) {
        console.log('\nWarning: Cities in population data but not in zero initiatives list:');
        console.log('--------------------------------------------------------');
        missingCities.sort();
        missingCities.forEach(city => console.log(`- ${city}`));
    }
    
    console.log('\nRegions, Counties, and Multi-City Areas (no population data):');
    console.log('--------------------------------------------------------');
    regionsAndCounties.sort();
    regionsAndCounties.forEach(item => console.log(`- ${item}`));
}

// Run the analysis
analyzeData(); 