import { getFeeAmount, scoreUniversity } from "./scorer.js";

export const MY_PROFILE = {
  name: "Dev Doshi",
  cgpa: 7.38,
  backlogs: 1,
  degreeType: "Bachelor of Engineering",
  field: "Computer Engineering",
  workExperienceYears: 1.5,
  skills: [
    "React Native",
    "React.js",
    "JavaScript",
    "Redux Toolkit",
    "Node.js",
    "Express.js",
    "MongoDB",
    "Tailwind CSS",
    "Bootstrap",
  ],
  targetDomains: [
    "Cloud Computing",
    "Distributed Systems",
    "Software Engineering",
    "Enterprise Systems",
  ],
  preferPublic: true,
  languagePrep: ["English (IELTS planned)", "German A2/B1 planned"],
  targetCountry: "Germany",
  preferHochschule: true,
};

export const CITY_COORDS = {
  Munich: { lat: 48.1351, lng: 11.582 },
  Berlin: { lat: 52.52, lng: 13.405 },
  Hamburg: { lat: 53.5511, lng: 9.9937 },
  Frankfurt: { lat: 50.1109, lng: 8.6821 },
  Stuttgart: { lat: 48.7758, lng: 9.1829 },
  Cologne: { lat: 50.9333, lng: 6.95 },
  Dortmund: { lat: 51.5136, lng: 7.4653 },
  Heilbronn: { lat: 49.1427, lng: 9.2109 },
  Hof: { lat: 50.3167, lng: 11.9167 },
  Deggendorf: { lat: 48.8306, lng: 12.9617 },
  Mittweida: { lat: 50.9856, lng: 12.9778 },
  Emden: { lat: 53.3675, lng: 7.2061 },
  "Kamp-Lintfort": { lat: 51.5033, lng: 6.5395 },
  Gummersbach: { lat: 51.0258, lng: 7.5647 },
  Heidelberg: { lat: 49.3988, lng: 8.6724 },
  Mannheim: { lat: 49.4875, lng: 8.466 },
  Nuremberg: { lat: 49.4521, lng: 11.0767 },
  Augsburg: { lat: 48.3717, lng: 10.8983 },
  Regensburg: { lat: 49.0134, lng: 12.1016 },
  Ingolstadt: { lat: 48.763, lng: 11.425 },
  Kaiserslautern: { lat: 49.444, lng: 7.7689 },
  Darmstadt: { lat: 49.8728, lng: 8.6512 },
  Karlsruhe: { lat: 49.0069, lng: 8.4037 },
  Freiburg: { lat: 47.999, lng: 7.8421 },
  Ulm: { lat: 48.3984, lng: 9.9908 },
  Aachen: { lat: 50.7753, lng: 6.0839 },
  Münster: { lat: 51.9607, lng: 7.6261 },
  Leipzig: { lat: 51.3397, lng: 12.3731 },
  Dresden: { lat: 51.0504, lng: 13.7373 },
  Hannover: { lat: 52.3759, lng: 9.732 },
  Bremen: { lat: 53.0793, lng: 8.8017 },
  Düsseldorf: { lat: 51.2217, lng: 6.7762 },
  Bochum: { lat: 51.4818, lng: 7.2162 },
  Rosenheim: { lat: 47.8561, lng: 12.1289 },
  Landshut: { lat: 48.5363, lng: 12.1524 },
  Würzburg: { lat: 49.7913, lng: 9.9534 },
  Bamberg: { lat: 49.8988, lng: 10.9028 },
  Ansbach: { lat: 49.3012, lng: 10.5713 },
  Kiel: { lat: 54.3233, lng: 10.1228 },
  Lübeck: { lat: 53.8655, lng: 10.6866 },
  Rostock: { lat: 54.0887, lng: 12.1404 },
  Erfurt: { lat: 50.9848, lng: 11.0299 },
  Jena: { lat: 50.9272, lng: 11.586 },
  Chemnitz: { lat: 50.8278, lng: 12.9214 },
  Albstadt: { lat: 48.2114, lng: 9.0234 },
  Bielefeld: { lat: 52.0302, lng: 8.5325 },
  Brandenburg: { lat: 52.4125, lng: 12.5316 },
  Cham: { lat: 49.2256, lng: 12.655 },
  Frechen: { lat: 50.9149, lng: 6.8118 },
  Freising: { lat: 48.4029, lng: 11.7413 },
  Friedberg: { lat: 50.3374, lng: 8.7557 },
  Fulda: { lat: 50.5558, lng: 9.6808 },
  Fürth: { lat: 49.4771, lng: 10.9887 },
  Furtwangen: { lat: 48.0511, lng: 8.2078 },
  Gießen: { lat: 50.5841, lng: 8.6784 },
  Gütersloh: { lat: 51.9032, lng: 8.3858 },
  Hagen: { lat: 51.3671, lng: 7.4633 },
  "Frankfurt am Main": { lat: 50.1109, lng: 8.6821 },
  München: { lat: 48.1351, lng: 11.582 },
  Köln: { lat: 50.9333, lng: 6.95 },
  Nürnberg: { lat: 49.4521, lng: 11.0767 },
  "Neu-Ulm": { lat: 48.3928, lng: 10.0111 },
  Nordhausen: { lat: 51.5018, lng: 10.7957 },
  Offenburg: { lat: 48.4735, lng: 7.9449 },
  Potsdam: { lat: 52.3906, lng: 13.0645 },
  "Sankt Augustin": { lat: 50.7754, lng: 7.1889 },
  Schmalkalden: { lat: 50.7214, lng: 10.4439 },
  Schweinfurt: { lat: 50.0492, lng: 10.2218 },
  "Waldshut-Tiengen": { lat: 47.6232, lng: 8.2172 },
  Zweibrücken: { lat: 49.25, lng: 7.3667 },
  Zwickau: { lat: 50.7189, lng: 12.4939 },
};

export const DOMAIN_MAP = [
  {
    domain: "Cloud Computing / DevOps",
    score: 100,
    keywords: ["cloud computing", "devops", "cloud"],
  },
  {
    domain: "Software Engineering / Development",
    score: 95,
    keywords: [
      "software engineering",
      "software development",
      "software systems",
      "software technology",
      "global software development",
      "software for industry",
      "software and systems",
      "software architecture",
      "software systems engineering",
      "software engineering for embedded",
      "software engineering for industrial",
    ],
  },
  {
    domain: "Distributed Systems / Computer Science",
    score: 90,
    keywords: [
      "computer science",
      "informatics",
      "informatik",
      "applied computer science",
      "computer and information science",
      "international software systems science",
      "computer science international",
      "computer science at the hasso plattner",
      "computer science for industry",
      "computer science – degree",
      "computer science: games",
      "applied research in computer science",
      "high integrity systems",
      "it engineering",
      "information engineering and computer science",
    ],
  },
  {
    domain: "Artificial Intelligence (AI)",
    score: 85,
    keywords: [
      "artificial intelligence",
      "ai ",
      " ai",
      "ai)",
      "(ai)",
      "intelligent systems",
      "intelligent adaptive",
      "intelligent autonomous",
      "human & artificial intelligence",
      "human-centred artificial intelligence",
      "industrial artificial intelligence",
      "information technology - artificial intelligence",
    ],
  },
  {
    domain: "Machine Learning (ML)",
    score: 83,
    keywords: ["machine learning", "mathematics of machine learning"],
  },
  {
    domain: "Data Science / Data Analytics",
    score: 80,
    keywords: [
      "data science",
      "data analytics",
      "data analysis",
      "data engineering",
      "data and knowledge engineering",
      "web and data science",
      "social and economic data science",
      "mathematical data science",
      "data and computer science",
      "management & data science",
      "computational and data science",
      "information technology - data science",
      "data & society",
    ],
  },
  {
    domain: "Embedded Systems / IoT",
    score: 75,
    keywords: [
      "embedded",
      "embedded computing",
      "iot",
      "internet of things",
      "computer engineering for iot",
      "smart sensors",
      "smart actuators",
      "smart energy systems",
      "smart services",
      "embedded and autonomous systems",
    ],
  },
  {
    domain: "Cybersecurity / IT Security",
    score: 70,
    keywords: [
      "cyber security",
      "cybersecurity",
      "it security",
      "information security",
      "enterprise and it security",
      "sociotechnical cybersecurity",
      "computer science - cyber security",
      "business management & cybersecurity",
    ],
  },
  {
    domain: "Robotics / Autonomous Systems",
    score: 68,
    keywords: ["robotics", "autonomous systems", "robot", "ai engineering of autonomous systems"],
  },
  {
    domain: "Computational Sciences / Modelling",
    score: 65,
    keywords: [
      "computational science",
      "computational engineering",
      "computational methods",
      "computational modelling",
      "computational mechanics",
      "computational linguistics",
      "computational neuroscience",
      "computational biology",
      "simulation sciences",
      "scientific computing",
      "computer simulation",
      "computational and data science",
      "high performance computing",
      "quantum computing",
    ],
  },
  {
    domain: "Computer Engineering / Hardware",
    score: 60,
    keywords: [
      "computer engineering",
      "microelectronics",
      "chip design",
      "control, computer and communications engineering",
      "information and communications engineering",
      "quantum technologies in electrical",
    ],
  },
  {
    domain: "Engineering + Management / Business Informatics",
    score: 55,
    keywords: [
      "business informatics",
      "information systems",
      "business computing",
      "management information systems",
      "international information systems",
      "informatics and business",
      "information systems engineering",
      "management and digital technologies",
      "management and information technology",
      "digital business",
      "digital entrepreneurship",
      "digital transformation management",
      "general technology management",
      "business intelligence and process management",
      "digital supply chain management",
      "digital innovation management",
      "digital leadership",
      "project management and data science",
      "engineering and management",
      "mba transformation",
    ],
  },
  {
    domain: "IT Management / Digital Transformation",
    score: 50,
    keywords: [
      "digital transformation",
      "it management",
      "information management",
      "digital sciences",
      "digitalisation",
      "professional it business",
      "digital engineering",
      "digital farming",
      "infomation technology and business transformation",
      "information technologies for the built environment",
    ],
  },
  {
    domain: "Data Analytics / Business Intelligence",
    score: 48,
    keywords: [
      "business intelligence",
      "business analytics",
      "operations research",
      "data analytics and decision science",
      "applied business data science",
      "mannheim master in data science",
      "mannheim master in management analytics",
      "master in management analytics",
      "master of data science for public policy",
      "analytics and artificial intelligence",
      "applied data science",
    ],
  },
  {
    domain: "Cognitive Science / Neuroscience",
    score: 40,
    keywords: ["cognitive science", "cognitive computing", "cognitive systems", "cognitive modelling", "educational technology"],
  },
  {
    domain: "Human-Computer Interaction / UX",
    score: 35,
    keywords: ["human-computer interaction", "usability engineering", "user experience", "interactive media", "human technology", "design and interaction"],
  },
  {
    domain: "Quantum Computing / Quantum Tech",
    score: 35,
    keywords: ["quantum", "quantum computing", "quantum science", "quantum technologies", "quanteninformationstheorie"],
  },
  {
    domain: "Bioinformatics / Health Informatics",
    score: 30,
    keywords: ["bioinformatics", "health informatics", "digital health", "medical informatics", "applied health informatics", "ai in biomedicine", "medical information sciences"],
  },
  {
    domain: "Digital Media / Media Informatics",
    score: 25,
    keywords: ["digital media", "media informatics", "media engineering", "computer science for digital media", "generative design", "visual computing", "language and communication technologies"],
  },
  {
    domain: "Web Engineering / Internet Technologies",
    score: 25,
    keywords: ["web engineering", "web and data science", "web science", "e-government"],
  },
  {
    domain: "SAP / ERP Systems",
    score: 20,
    keywords: ["sap", "enterprise resource planning", "erp"],
  },
  {
    domain: "Automotive / Vehicle Software",
    score: 20,
    keywords: ["automotive", "vehicle", "car software", "autonomous driving", "automotive software"],
  },
  {
    domain: "Space / Satellite Technology",
    score: 15,
    keywords: ["space", "satellite", "aerospace", "marine ecosystem", "engineering of space systems"],
  },
  {
    domain: "Geoinformatics / Spatial Data",
    score: 15,
    keywords: ["geoinformatics", "geo-informatics", "geomatics", "spatial data"],
  },
  {
    domain: "Other / Unclassified",
    score: 10,
    keywords: [],
  },
];

const FEE_COLOR_UNKNOWN = "#60a5fa";
const VIEW_MAX = {
  overall: 100,
  course: 35,
  fees: 20,
  admission: 15,
};
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 8;
const DOT_CLICK_MOVE_THRESHOLD = 5;
export const BLACKLIST_KEY = "unimap_blacklist";

const state = {
  universities: [],
  filtered: [],
  viewMode: "overall",
  datasetFilter: "all",
  domainFilter: "all",
  language: "all",
  feeFilter: "all",
  durationFilter: "4",
  searchQuery: "",
  city: "",
  maxDistance: 600,
  selected: null,
  filterDrawerOpen: false,
  mapCenter: null,
  zoom: {
    scale: 1,
    translate: { x: 0, y: 0 },
    isDragging: false,
    dragStart: null,
    dragOrigin: null,
    touchStartDistance: null,
    touchStartScale: 1,
    touchStartTranslate: null,
    touchStartCenter: null,
  },
};

let elements = {};
const previousPositions = new Map();

export function parseUniversities(rawData) {
  if (!Array.isArray(rawData)) return [];

  return rawData
    .map((entry) => {
      const data = entry?.data || entry;
      const moduleData = data?.page?.sections?.main?.mainContent?.[0]?.modules?.[0]?.data;
      if (!moduleData) return null;

      const sidebarHead = moduleData.sidebar?.find((item) => item?.type === "sidebarHead")?.data || {};
      const keyFacts = moduleData.keyFacts?.data?.items || [];
      const overview = findContentSection(moduleData.content, "hsk-detail-overview", "Overview and admission");
      const feesSection = findContentSection(moduleData.content, "hsk-detail-fees", "Tuition fees");
      const languages = findContentSection(moduleData.content, "hsk-detail-languages", "Languages of instruction");

      const feesBlock = findBlock(feesSection, "Tuition fees");
      const feeTextBlocks = feesSection?.blocks?.filter((block) => block?.type === "text") || [];
      const fees = toText(feesBlock?.data?.text);
      const feesTotal = toText(feeTextBlocks[0]?.data?.text || feeTextBlocks[1]?.data?.text);
      const courseName = toText(moduleData.head?.title);
      const { domain, domainScore } = classifyDomain(courseName);

      return {
        id: entry?.fileId || moduleData.resultId || "",
        dataset: entry?.dataset ?? "applied_sciences",
        domain,
        domainScore,
        courseName,
        universityName: toText(sidebarHead.universityName),
        city: toText(sidebarHead.universityTown),
        state: toText(sidebarHead.universityFederalState),
        logoUrl: sidebarHead.logo?.src?.large?.href || "",
        websiteUrl: sidebarHead.link?.url || "",
        daadUrl: makeDaadUrl(moduleData.url || data?.meta?.canonicalUrl || ""),
        degree: toText(findKeyFact(keyFacts, (item) => item.name === "Degree")?.text),
        duration: toText(findKeyFact(keyFacts, (item) => item.name?.toLowerCase().includes("period"))?.text),
        deadlines: parseDeadlines(moduleData.content, keyFacts),
        fees,
        feesTotal,
        feesLink: feesBlock?.data?.link?.url || "",
        mainLanguage: toText(findBlock(languages, "Main language")?.data?.text),
        admissionModus: toText(findBlock(overview, "Admission modus")?.data?.text),
        admissionRequirements: toText(findBlock(overview, "Admission requirements")?.data?.text),
        studyType: toText(findBlock(overview, "Study Type")?.data?.text),
        isFree: isFreeFees(fees),
      };
    })
    .filter(Boolean);
}

export function classifyDomain(courseName) {
  const lower = String(courseName || "").toLowerCase();
  for (const entry of DOMAIN_MAP) {
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        return { domain: entry.domain, domainScore: entry.score };
      }
    }
  }
  return { domain: "Other / Unclassified", domainScore: 10 };
}

export function getDistance(city1Coords, city2Coords) {
  if (!city1Coords || !city2Coords) return null;

  const earthRadiusKm = 6371;
  const lat1 = toRadians(city1Coords.lat);
  const lat2 = toRadians(city2Coords.lat);
  const deltaLat = toRadians(city2Coords.lat - city1Coords.lat);
  const deltaLng = toRadians(city2Coords.lng - city1Coords.lng);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export function getCityCoords(cityName) {
  const candidates = String(cityName || "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  for (const city of candidates) {
    if (CITY_COORDS[city]) return CITY_COORDS[city];
    const alias = normalizeCityName(city);
    if (CITY_COORDS[alias]) return CITY_COORDS[alias];
  }

  return null;
}

export function computeZoomTransform({
  currentScale,
  currentTranslate,
  targetScale,
  origin,
}) {
  const clampedScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, targetScale));
  void currentScale;
  void origin;

  return {
    scale: clampedScale,
    translate: { ...currentTranslate },
  };
}

export function computeSpreadPoint(point, center, scale) {
  const spreadFactor = 1 + (scale - 1) * 0.8;

  return {
    x: center.x + (point.x - center.x) * spreadFactor,
    y: center.y + (point.y - center.y) * spreadFactor,
  };
}

export function shouldOpenDotAfterPointer(start, end) {
  if (!start || !end) return true;
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  return distance < DOT_CLICK_MOVE_THRESHOLD;
}

export function findClusterHints(positions, scale) {
  if (scale > 1.2) return [];

  const hints = [];
  const visited = new Set();

  positions.forEach((position) => {
    if (visited.has(position.id)) return;

    const cluster = positions.filter(
      (candidate) =>
        Math.hypot(candidate.x - position.x, candidate.y - position.y) <= 20
    );

    if (cluster.length <= 2) return;

    cluster.forEach((item) => visited.add(item.id));
    const outermost = cluster.reduce((current, candidate) =>
      (candidate.distanceFromCenter || 0) > (current.distanceFromCenter || 0)
        ? candidate
        : current
    );

    hints.push({ id: outermost.id, count: cluster.length });
  });

  return hints;
}

export function getDurationSemesters(duration) {
  const match = String(duration || "").match(/(\d+(?:\.\d+)?)\s*semester/i);
  if (!match) return null;

  const value = Number.parseFloat(match[1]);
  return Number.isFinite(value) ? value : null;
}

export function matchesDurationFilter(uni, filterValue) {
  if (filterValue === "all") return true;

  const maxDuration = Number.parseFloat(filterValue);
  if (!Number.isFinite(maxDuration)) return true;

  const duration = getDurationSemesters(uni?.duration);
  if (duration === null) return true;

  return duration <= maxDuration;
}

export function matchesSearchFilter(uni, query) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!normalizedQuery) return true;

  const searchableText = [uni?.universityName, uni?.courseName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(normalizedQuery);
}

export function formatUniversityId(uni) {
  return uni?.id ? uni.id : "Not listed";
}

export function getBlacklist() {
  try {
    return JSON.parse(getStorage()?.getItem(BLACKLIST_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToBlacklist(id) {
  const list = getBlacklist();
  if (!id || list.includes(id)) return;

  list.push(id);
  getStorage()?.setItem(BLACKLIST_KEY, JSON.stringify(list));
}

export function removeFromBlacklist(id) {
  const list = getBlacklist().filter((item) => item !== id);
  getStorage()?.setItem(BLACKLIST_KEY, JSON.stringify(list));
}

export function clearBlacklist() {
  getStorage()?.setItem(BLACKLIST_KEY, JSON.stringify([]));
}

export function isBlacklisted(id) {
  return getBlacklist().includes(id);
}

export function getMobileResultSummary(total) {
  const safeTotal = Number.isFinite(total) ? Math.max(0, Math.trunc(total)) : 0;
  return `${safeTotal} shown`;
}

export function getFilterDrawerAriaState(isOpen) {
  return {
    expanded: String(Boolean(isOpen)),
    hidden: !Boolean(isOpen),
  };
}

function initApp() {
  elements = {
    map: document.querySelector("#orbit-map"),
    tooltip: document.querySelector("#tooltip"),
    drawer: document.querySelector("#detail-drawer"),
    closeDrawer: document.querySelector("#close-drawer"),
    drawerBody: document.querySelector("#drawer-body"),
    viewButtons: document.querySelectorAll("[data-view-mode]"),
    datasetFilter: document.querySelector("#dataset-filter"),
    domainFilter: document.querySelector("#domain-filter"),
    languageFilter: document.querySelector("#language-filter"),
    feeFilter: document.querySelector("#fee-filter"),
    durationFilter: document.querySelector("#duration-filter"),
    searchFilter: document.querySelector("#search-filter"),
    cityFilter: document.querySelector("#city-filter"),
    cityOptions: document.querySelector("#city-options"),
    distanceFilter: document.querySelector("#distance-filter"),
    distanceValue: document.querySelector("#distance-value"),
    resetFilters: document.querySelector("#reset-filters"),
    applyFiltersButton: document.querySelector("#apply-filters"),
    mobileFilterToggle: document.querySelector("#mobile-filter-toggle"),
    closeFilterDrawer: document.querySelector("#close-filter-drawer"),
    filterDrawer: document.querySelector("#filter-drawer"),
    filterBackdrop: document.querySelector("#filter-backdrop"),
    mobileResultSummary: document.querySelector("#mobile-result-summary"),
    hiddenButton: document.querySelector("#hidden-manager-button"),
    hiddenCount: document.querySelector("#hidden-count"),
    blacklistModal: document.querySelector("#blacklist-modal"),
    closeBlacklistModal: document.querySelector("#close-blacklist-modal"),
    clearBlacklist: document.querySelector("#clear-blacklist"),
    blacklistList: document.querySelector("#blacklist-list"),
    statsTotal: document.querySelector("#stats-total"),
    statsFree: document.querySelector("#stats-free"),
    statsEnglish: document.querySelector("#stats-english"),
    statsAverage: document.querySelector("#stats-average"),
    loading: document.querySelector("#loading"),
    zoomIn: document.querySelector("#zoom-in"),
    zoomOut: document.querySelector("#zoom-out"),
    zoomHome: document.querySelector("#zoom-home"),
    zoomLevel: document.querySelector("#zoom-level"),
  };

  setupControls();
  setupZoomControls();
  setFilterDrawerOpen(false);
  updateBlacklistControls();
  loadData();
}

async function loadData() {
  try {
    const response = await fetch("./data/all-daad-raw.json");
    if (!response.ok) throw new Error(`Failed to load data: ${response.status}`);

    const rawData = await response.json();
    state.universities = parseUniversities(rawData)
      .map((uni) => {
        const score = scoreUniversity(uni, MY_PROFILE);
        return {
          ...uni,
          score,
          coords: getCityCoords(uni.city),
        };
      })
      .sort((a, b) => b.score.total - a.score.total);

    if (elements.loading) elements.loading.hidden = true;
    renderCityOptions();
    applyFilters();
  } catch (error) {
    if (elements.loading) {
      elements.loading.textContent = `Could not load UniMap data: ${error.message}`;
    }
  }
}

function setupControls() {
  elements.viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.viewMode = button.dataset.viewMode;
      elements.viewButtons.forEach((item) => item.classList.toggle("active", item === button));
      renderMap();
    });
  });

  elements.datasetFilter.addEventListener("change", (event) => {
    state.datasetFilter = event.target.value;
    applyFilters();
  });

  elements.domainFilter.addEventListener("change", (event) => {
    state.domainFilter = event.target.value;
    applyFilters();
  });

  elements.languageFilter.addEventListener("change", (event) => {
    state.language = event.target.value;
    applyFilters();
  });

  elements.feeFilter.addEventListener("change", (event) => {
    state.feeFilter = event.target.value;
    applyFilters();
  });

  elements.durationFilter.addEventListener("change", (event) => {
    state.durationFilter = event.target.value;
    applyFilters();
  });

  elements.searchFilter.addEventListener("input", (event) => {
    state.searchQuery = event.target.value;
    applyFilters();
  });

  elements.cityFilter.addEventListener("input", (event) => {
    state.city = event.target.value;
    renderMap();
  });

  elements.distanceFilter.addEventListener("input", (event) => {
    state.maxDistance = Number(event.target.value);
    elements.distanceValue.textContent = `${state.maxDistance} km`;
    renderMap();
  });

  elements.resetFilters.addEventListener("click", () => {
    state.viewMode = "overall";
    state.datasetFilter = "all";
    state.domainFilter = "all";
    state.language = "all";
    state.feeFilter = "all";
    state.durationFilter = "4";
    state.searchQuery = "";
    state.city = "";
    state.maxDistance = 600;

    elements.datasetFilter.value = "all";
    elements.domainFilter.value = "all";
    elements.languageFilter.value = "all";
    elements.feeFilter.value = "all";
    elements.durationFilter.value = "4";
    elements.searchFilter.value = "";
    elements.cityFilter.value = "";
    elements.distanceFilter.value = "600";
    elements.distanceValue.textContent = "600 km";
    elements.viewButtons.forEach((button) =>
      button.classList.toggle("active", button.dataset.viewMode === "overall")
    );
    applyFilters();
  });

  elements.mobileFilterToggle.addEventListener("click", () => setFilterDrawerOpen(true));
  elements.closeFilterDrawer.addEventListener("click", () => setFilterDrawerOpen(false));
  elements.applyFiltersButton.addEventListener("click", () => setFilterDrawerOpen(false));
  elements.filterBackdrop.addEventListener("click", () => setFilterDrawerOpen(false));

  elements.hiddenButton.addEventListener("click", () => {
    setFilterDrawerOpen(false);
    openBlacklistModal();
  });
  elements.closeBlacklistModal.addEventListener("click", closeBlacklistModal);
  elements.blacklistModal.addEventListener("click", (event) => {
    if (event.target === elements.blacklistModal) closeBlacklistModal();
  });
  elements.clearBlacklist.addEventListener("click", () => {
    clearBlacklist();
    applyFilters();
    renderBlacklistModal();
    showToast("University restored to the map.");
  });
  elements.blacklistList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-restore-id]");
    if (!button) return;

    removeFromBlacklist(button.dataset.restoreId);
    applyFilters();
    renderBlacklistModal();
    showToast("University restored to the map.");
  });
  elements.drawerBody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-blacklist-id]");
    if (!button) return;

    addToBlacklist(button.dataset.blacklistId);
    closeDrawer();
    applyFilters();
    showToast("University hidden. You can restore it from the blacklist manager.");
  });

  elements.closeDrawer.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setFilterDrawerOpen(false);
      closeDrawer();
      closeBlacklistModal();
    }
  });
}

function setFilterDrawerOpen(isOpen) {
  if (!elements.filterDrawer || !elements.mobileFilterToggle) return;

  state.filterDrawerOpen = Boolean(isOpen);
  const ariaState = getFilterDrawerAriaState(state.filterDrawerOpen);
  const shouldHideDrawer = isMobileFilterLayout() ? ariaState.hidden : false;
  elements.mobileFilterToggle.setAttribute("aria-expanded", ariaState.expanded);
  elements.filterDrawer.setAttribute("aria-hidden", String(shouldHideDrawer));
  elements.filterDrawer.classList.toggle("open", state.filterDrawerOpen);

  if (elements.filterBackdrop) {
    elements.filterBackdrop.hidden = !state.filterDrawerOpen;
  }
}

function isMobileFilterLayout() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
}

function setupZoomControls() {
  elements.map.addEventListener("wheel", handleWheelZoom, { passive: false });
  elements.map.addEventListener("mousedown", startPan);
  elements.map.addEventListener("mousemove", dragPan);
  elements.map.addEventListener("mouseup", stopPan);
  elements.map.addEventListener("mouseleave", stopPan);
  elements.map.addEventListener("touchstart", handleTouchStart, { passive: false });
  elements.map.addEventListener("touchmove", handleTouchMove, { passive: false });
  elements.map.addEventListener("touchend", handleTouchEnd);
  elements.map.addEventListener("touchcancel", handleTouchEnd);

  elements.zoomIn.addEventListener("click", () => zoomFromCenter(1.3));
  elements.zoomOut.addEventListener("click", () => zoomFromCenter(1 / 1.3));
  elements.zoomHome.addEventListener("click", resetZoom);
  updateZoomTransform();
}

function handleWheelZoom(event) {
  event.preventDefault();

  const scale = state.zoom.scale * (event.deltaY < 0 ? 1.15 : 0.87);
  setZoomTransform(
    computeZoomTransform({
      currentScale: state.zoom.scale,
      currentTranslate: state.zoom.translate,
      targetScale: scale,
      origin: { x: event.offsetX, y: event.offsetY },
    })
  );
}

function zoomFromCenter(multiplier) {
  const rect = elements.map.getBoundingClientRect();
  setZoomTransform(
    computeZoomTransform({
      currentScale: state.zoom.scale,
      currentTranslate: state.zoom.translate,
      targetScale: state.zoom.scale * multiplier,
      origin: { x: rect.width / 2, y: rect.height / 2 },
    })
  );
}

function resetZoom() {
  setZoomTransform({
    scale: 1,
    translate: { x: 0, y: 0 },
  });
}

function startPan(event) {
  if (event.button !== 0 || event.target.closest(".university-dot")) return;

  state.zoom.isDragging = true;
  state.zoom.dragStart = { x: event.clientX, y: event.clientY };
  state.zoom.dragOrigin = { ...state.zoom.translate };
  elements.map.classList.add("is-dragging");
}

function dragPan(event) {
  if (!state.zoom.isDragging || !state.zoom.dragStart || !state.zoom.dragOrigin) return;

  state.zoom.translate = {
    x: state.zoom.dragOrigin.x + event.clientX - state.zoom.dragStart.x,
    y: state.zoom.dragOrigin.y + event.clientY - state.zoom.dragStart.y,
  };
  updateZoomTransform();
}

function stopPan() {
  state.zoom.isDragging = false;
  state.zoom.dragStart = null;
  state.zoom.dragOrigin = null;
  elements.map.classList.remove("is-dragging");
}

function handleTouchStart(event) {
  if (event.target.closest(".university-dot")) return;
  event.preventDefault();

  if (event.touches.length === 1) {
    state.zoom.isDragging = true;
    state.zoom.dragStart = touchPoint(event.touches[0]);
    state.zoom.dragOrigin = { ...state.zoom.translate };
    elements.map.classList.add("is-dragging");
  }

  if (event.touches.length === 2) {
    state.zoom.isDragging = false;
    state.zoom.touchStartDistance = getTouchDistance(event.touches);
    state.zoom.touchStartScale = state.zoom.scale;
    state.zoom.touchStartTranslate = { ...state.zoom.translate };
    state.zoom.touchStartCenter = getTouchCenter(event.touches);
  }
}

function handleTouchMove(event) {
  if (event.target.closest(".university-dot")) return;
  event.preventDefault();

  if (event.touches.length === 1 && state.zoom.isDragging) {
    const current = touchPoint(event.touches[0]);
    state.zoom.translate = {
      x: state.zoom.dragOrigin.x + current.x - state.zoom.dragStart.x,
      y: state.zoom.dragOrigin.y + current.y - state.zoom.dragStart.y,
    };
    updateZoomTransform();
  }

  if (event.touches.length === 2 && state.zoom.touchStartDistance) {
    const distance = getTouchDistance(event.touches);
    const ratio = distance / state.zoom.touchStartDistance;
    setZoomTransform(
      computeZoomTransform({
        currentScale: state.zoom.touchStartScale,
        currentTranslate: state.zoom.touchStartTranslate,
        targetScale: state.zoom.touchStartScale * ratio,
        origin: state.zoom.touchStartCenter,
      })
    );
  }
}

function handleTouchEnd(event) {
  if (event.touches.length === 0) {
    stopPan();
    state.zoom.touchStartDistance = null;
    state.zoom.touchStartTranslate = null;
    state.zoom.touchStartCenter = null;
  }
}

function setZoomTransform(nextZoom) {
  state.zoom.scale = nextZoom.scale;
  state.zoom.translate = nextZoom.translate;
  updateZoomTransform();
  updateClusterVisibility();
}

function updateZoomTransform() {
  const zoomLayer = elements.map?.querySelector("#zoomLayer");
  if (!zoomLayer) return;

  zoomLayer.setAttribute(
    "transform",
    `translate(${state.zoom.translate.x},${state.zoom.translate.y})`
  );
  updateZoomLevel();
  updateDotSpread();
  updateLabelScaling();
}

function updateZoomLevel() {
  if (elements.zoomLevel) {
    elements.zoomLevel.textContent = `${state.zoom.scale.toFixed(1)}x`;
  }
}

function updateLabelScaling() {
  const labels = elements.map?.querySelectorAll(".dot-label") || [];
  labels.forEach((label) => {
    label.removeAttribute("transform");
  });
}

function updateDotSpread() {
  if (!state.mapCenter) return;

  const dots = elements.map?.querySelectorAll(".university-dot") || [];
  dots.forEach((dot) => {
    const basePoint = {
      x: Number(dot.dataset.baseX),
      y: Number(dot.dataset.baseY),
    };
    if (!Number.isFinite(basePoint.x) || !Number.isFinite(basePoint.y)) return;

    const point = computeSpreadPoint(basePoint, state.mapCenter, state.zoom.scale);
    dot.setAttribute("transform", `translate(${point.x} ${point.y})`);
  });
}

function updateClusterVisibility() {
  const badges = elements.map?.querySelectorAll(".cluster-badge") || [];
  badges.forEach((badge) => {
    badge.toggleAttribute("hidden", state.zoom.scale > 1.2);
  });
}

function getTouchDistance(touches) {
  const first = touchPoint(touches[0]);
  const second = touchPoint(touches[1]);
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function getTouchCenter(touches) {
  const rect = elements.map.getBoundingClientRect();
  const first = touchPoint(touches[0]);
  const second = touchPoint(touches[1]);

  return {
    x: (first.x + second.x) / 2 - rect.left,
    y: (first.y + second.y) / 2 - rect.top,
  };
}

function touchPoint(touch) {
  return {
    x: touch.clientX,
    y: touch.clientY,
  };
}

function renderCityOptions() {
  elements.cityOptions.innerHTML = Object.keys(CITY_COORDS)
    .sort((a, b) => a.localeCompare(b))
    .map((city) => `<option value="${escapeHtml(city)}"></option>`)
    .join("");
}

function applyFilters() {
  state.filtered = state.universities.filter((uni) => {
    return (
      !isBlacklisted(uni.id) &&
      matchesDatasetFilter(uni, state.datasetFilter) &&
      matchesDomainFilter(uni, state.domainFilter) &&
      matchesSearchFilter(uni, state.searchQuery) &&
      matchesLanguage(uni) &&
      matchesFeeFilter(uni) &&
      matchesDurationFilter(uni, state.durationFilter)
    );
  });

  updateBlacklistControls();
  updateStats();
  renderMap();
}

function renderMap() {
  const width = elements.map.clientWidth || window.innerWidth;
  const height = elements.map.clientHeight || window.innerHeight;
  const center = { x: width / 2, y: height / 2 };
  const maxRadius = Math.max(180, Math.min(width, height) * 0.42);
  const cityCoords = getCityCoords(state.city);
  state.mapCenter = center;

  elements.map.setAttribute("viewBox", `0 0 ${width} ${height}`);
  elements.map.innerHTML = `
    <rect class="pan-hit-area" width="${width}" height="${height}"></rect>
    <g id="zoomLayer">
      <g class="germany-hint" transform="translate(${center.x - 125} ${center.y - 165})">
        <path d="M126 8 92 32 85 68 52 83 65 125 42 152 70 196 60 248 98 302 148 286 184 315 226 278 214 230 244 196 219 158 236 114 198 84 188 43Z" />
      </g>
      ${renderRings(center, maxRadius)}
      <g class="me" transform="translate(${center.x} ${center.y})">
        <circle r="9"></circle>
        <text x="16" y="5">Dev</text>
      </g>
      <g class="universities"></g>
    </g>
  `;

  const group = elements.map.querySelector(".universities");
  const fragment = document.createDocumentFragment();
  const positions = [];

  state.filtered.forEach((uni, index) => {
    const outOfRange = isOutOfRange(uni, cityCoords);
    const point = getOrbitPoint(uni, index, center, maxRadius, outOfRange);
    const startPoint = previousPositions.get(uni.id) || center;
    const node = createDot(uni, startPoint, point, center, outOfRange);
    previousPositions.set(uni.id, point);
    positions.push({ id: uni.id, x: point.x, y: point.y, distanceFromCenter: getPointDistance(point, center) });
    fragment.appendChild(node);
  });

  group.appendChild(fragment);
  renderClusterHints(group, positions);
  updateZoomTransform();
  updateClusterVisibility();
}

function renderRings(center, maxRadius) {
  const rings = [
    { label: "Best match", radius: maxRadius * 0.23 },
    { label: "Good match", radius: maxRadius * 0.43 },
    { label: "Moderate", radius: maxRadius * 0.65 },
    { label: "Low match", radius: maxRadius * 0.9 },
  ];

  return rings
    .map(
      (ring) => `
        <g class="ring">
          <circle cx="${center.x}" cy="${center.y}" r="${ring.radius}"></circle>
          <text x="${center.x + ring.radius + 10}" y="${center.y - 6}">${ring.label}</text>
        </g>
      `
    )
    .join("");
}

function createDot(uni, startPoint, targetPoint, center, outOfRange) {
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const size = 8 + (uni.score.total / 100) * 6;
  let pointerStart = null;
  let latestPointer = null;
  const displayStart = computeSpreadPoint(startPoint, center, state.zoom.scale);
  const displayTarget = computeSpreadPoint(targetPoint, center, state.zoom.scale);

  group.classList.add("university-dot");
  if (uni.score.total > 80) group.classList.add("high-score");
  group.setAttribute("transform", `translate(${displayStart.x} ${displayStart.y})`);
  group.style.opacity = outOfRange ? "0.3" : "1";
  group.dataset.id = uni.id;
  group.dataset.baseX = String(targetPoint.x);
  group.dataset.baseY = String(targetPoint.y);

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("r", String(size));
  circle.setAttribute("fill", getDotColor(uni));

  const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
  label.classList.add("dot-label");
  label.setAttribute("x", String(size + 7));
  label.setAttribute("y", "4");
  label.textContent = uni.universityName || uni.courseName;

  group.append(circle, label);
  group.addEventListener("mouseenter", (event) => showTooltip(event, uni));
  group.addEventListener("mousemove", (event) => moveTooltip(event));
  group.addEventListener("mouseleave", hideTooltip);
  group.addEventListener("mousedown", (event) => event.stopPropagation());
  group.addEventListener("touchstart", (event) => event.stopPropagation(), { passive: true });
  group.addEventListener("pointerdown", (event) => {
    pointerStart = { x: event.clientX, y: event.clientY };
    latestPointer = pointerStart;
  });
  group.addEventListener("pointermove", (event) => {
    latestPointer = { x: event.clientX, y: event.clientY };
  });
  group.addEventListener("click", (event) => {
    event.stopPropagation();
    if (shouldOpenDotAfterPointer(pointerStart, latestPointer)) openDrawer(uni);
  });
  animateDot(group, displayStart, displayTarget);

  return group;
}

function animateDot(group, startPoint, targetPoint) {
  const duration = 500;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    const x = startPoint.x + (targetPoint.x - startPoint.x) * eased;
    const y = startPoint.y + (targetPoint.y - startPoint.y) * eased;

    group.setAttribute("transform", `translate(${x} ${y})`);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function renderClusterHints(group, positions) {
  findClusterHints(positions, 1).forEach((hint) => {
    const dot = Array.from(group.querySelectorAll(".university-dot")).find(
      (node) => node.dataset.id === hint.id
    );
    if (!dot) return;

    const badge = document.createElementNS("http://www.w3.org/2000/svg", "g");
    badge.classList.add("cluster-badge");
    badge.setAttribute("transform", "translate(16 -16)");

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("r", "8");

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    text.textContent = `+${hint.count}`;

    badge.append(circle, text);
    dot.appendChild(badge);
  });
}

function renderDomainBadge(uni) {
  const isTarget = isTargetDomain(uni?.domain);
  const background = isTarget
    ? "var(--color-background-success, rgba(74, 222, 128, 0.16))"
    : "var(--color-background-secondary)";
  const color = isTarget
    ? "var(--color-text-success, #86efac)"
    : "var(--color-text-secondary, var(--muted))";
  return `<span style="display:inline-flex;align-items:center;width:max-content;margin:0.2rem 0 0.35rem;padding:0.22rem 0.5rem;border-radius:999px;background:${background};color:${color};font-size:0.72rem;font-weight:700;">🏷 ${escapeHtml(uni?.domain || "Other / Unclassified")}</span>`;
}

function isTargetDomain(domain) {
  return [
    "Cloud Computing / DevOps",
    "Software Engineering / Development",
    "Distributed Systems / Computer Science",
    "Artificial Intelligence (AI)",
    "Machine Learning (ML)",
    "Data Science / Data Analytics",
    "Embedded Systems / IoT",
    "Cybersecurity / IT Security",
  ].includes(domain);
}

function getOrbitPoint(uni, index, center, maxRadius, outOfRange) {
  const score = getViewScore(uni);
  const normalized = outOfRange ? 0 : (score / VIEW_MAX[state.viewMode]) * 100;
  const range = getRadiusRange(normalized);
  const hash = hashString(uni.id || `${uni.courseName}-${index}`);
  const angle = ((hash % 360) + index * 17) * (Math.PI / 180);
  const jitter = ((hash % 100) / 100) * (range.max - range.min);
  const radius = outOfRange ? maxRadius * 0.95 : scaleRadius(range.min + jitter, maxRadius);

  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  };
}

function getRadiusRange(score) {
  if (score >= 85) return { min: 80, max: 120 };
  if (score >= 70) return { min: 150, max: 200 };
  if (score >= 50) return { min: 230, max: 290 };
  if (score >= 30) return { min: 330, max: 400 };
  return { min: 440, max: 520 };
}

function scaleRadius(rawRadius, maxRadius) {
  return (rawRadius / 520) * maxRadius;
}

function getPointDistance(point, center) {
  return Math.hypot(point.x - center.x, point.y - center.y);
}

function getViewScore(uni) {
  if (state.viewMode === "course") return uni.score.breakdown.courseRelevance;
  if (state.viewMode === "fees") return uni.score.breakdown.fees;
  if (state.viewMode === "admission") return uni.score.breakdown.admission;
  return uni.score.total;
}

function updateStats() {
  const total = state.filtered.length;
  const free = state.filtered.filter((uni) => uni.isFree).length;
  const english = state.filtered.filter((uni) =>
    uni.mainLanguage.toLowerCase().includes("english")
  ).length;
  const average = total
    ? Math.round(state.filtered.reduce((sum, uni) => sum + uni.score.total, 0) / total)
    : 0;

  elements.statsTotal.textContent = String(total);
  elements.statsFree.textContent = String(free);
  elements.statsEnglish.textContent = String(english);
  elements.statsAverage.textContent = String(average);
  if (elements.mobileResultSummary) {
    elements.mobileResultSummary.textContent = getMobileResultSummary(total);
  }
}

function showTooltip(event, uni) {
  const fees = uni.isFree || !uni.fees ? "Free / No tuition info" : uni.fees;
  elements.tooltip.innerHTML = `
    <strong>${escapeHtml(uni.universityName)}</strong>
    <span>${escapeHtml(uni.city)}</span>
    <p>${escapeHtml(uni.courseName)}</p>
    ${renderDomainBadge(uni)}
    <div class="tooltip-row">
      <b>${uni.score.total}/100</b>
      <span>${escapeHtml(fees)}</span>
    </div>
    <small>${escapeHtml(uni.mainLanguage || "Language unknown")}</small>
    <em>Click for details &rarr;</em>
  `;
  elements.tooltip.hidden = false;
  moveTooltip(event);
}

function moveTooltip(event) {
  elements.tooltip.style.transform = `translate(${event.clientX + 18}px, ${event.clientY + 18}px)`;
}

function hideTooltip() {
  elements.tooltip.hidden = true;
}

function openDrawer(uni) {
  state.selected = uni;
  elements.drawerBody.innerHTML = renderDrawer(uni);
  elements.drawer.classList.add("open");
  elements.drawer.setAttribute("aria-hidden", "false");
}

function closeDrawer() {
  elements.drawer.classList.remove("open");
  elements.drawer.setAttribute("aria-hidden", "true");
  state.selected = null;
}

function openBlacklistModal() {
  renderBlacklistModal();
  elements.blacklistModal.hidden = false;
  elements.blacklistModal.setAttribute("aria-hidden", "false");
}

function closeBlacklistModal() {
  elements.blacklistModal.hidden = true;
  elements.blacklistModal.setAttribute("aria-hidden", "true");
}

function renderBlacklistModal() {
  const blacklist = getBlacklist();
  const hiddenUniversities = blacklist.map((id) => {
    return state.universities.find((uni) => uni.id === id) || { id };
  });

  elements.clearBlacklist.disabled = blacklist.length === 0;
  elements.blacklistList.innerHTML = hiddenUniversities.length
    ? hiddenUniversities.map(renderBlacklistedRow).join("")
    : `<p class="blacklist-empty">No hidden universities. Hiding a university removes it from the map.</p>`;
}

function renderBlacklistedRow(uni) {
  return `
    <div class="blacklist-row">
      <div>
        <strong>${escapeHtml(uni.universityName || formatUniversityId(uni))}</strong>
        <span>${escapeHtml(uni.courseName || "Course not listed")}</span>
        <small>${escapeHtml(uni.city || "City not listed")}</small>
      </div>
      <button class="restore-button" type="button" data-restore-id="${escapeHtml(uni.id)}">
        <span class="ti ti-eye" aria-hidden="true"></span>
        Restore
      </button>
    </div>
  `;
}

function updateBlacklistControls() {
  if (!elements.hiddenButton || !elements.hiddenCount) return;

  const count = getBlacklist().length;
  elements.hiddenCount.textContent = String(count);
  elements.hiddenButton.classList.toggle("has-hidden", count > 0);
  elements.hiddenButton.classList.toggle("is-empty", count === 0);
}

function showToast(message) {
  const existing = document.getElementById("unimap-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "unimap-toast";
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-background-primary);
    border: 0.5px solid var(--color-border-secondary);
    border-radius: var(--border-radius-lg);
    padding: 10px 20px;
    font-size: 14px;
    color: var(--color-text-primary);
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.2s ease;
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
  });
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 200);
  }, 3000);
}

function renderDrawer(uni) {
  const breakdown = [
    [`Course Match (${uni.domain || "Other / Unclassified"})`, uni.score.breakdown.courseRelevance, 35],
    ["Fees", uni.score.breakdown.fees, 20],
    ["Language", uni.score.breakdown.language, 15],
    ["Admission", uni.score.breakdown.admission, 15],
    ["University Type", uni.score.breakdown.universityType, 10],
    ["Work Experience", uni.score.breakdown.workExperience, 5],
  ];
  const deadlineItems = uni.deadlines.length
    ? uni.deadlines.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
    : "<li>No deadline information found.</li>";

  return `
    <div class="drawer-logo-wrap">
      ${
        uni.logoUrl
          ? `<img class="drawer-logo" src="${escapeHtml(uni.logoUrl)}" alt="${escapeHtml(uni.universityName)} logo">`
          : `<div class="drawer-logo placeholder">UniMap</div>`
      }
    </div>
    <h2>${escapeHtml(uni.courseName)}</h2>
    ${renderDomainBadge(uni)}
    <p class="muted">${escapeHtml(uni.universityName)}</p>
    <p>${escapeHtml([uni.city, uni.state].filter(Boolean).join(", "))}</p>
    <div class="score-card">
      <strong>${uni.score.total}/100</strong>
      <span>Overall match</span>
    </div>
    <div class="breakdown">
      ${breakdown
        .map(
          ([label, value, max]) => `
            <div class="bar-row">
              <span>${label}</span>
              <div class="bar"><i style="width:${(value / max) * 100}%"></i></div>
              <b>${label.startsWith("Course Match") ? `${value}/${max}` : value}</b>
            </div>
          `
        )
        .join("")}
    </div>
    <dl>
      <dt>ID</dt><dd>${escapeHtml(formatUniversityId(uni))}</dd>
      <dt>Degree</dt><dd>${escapeHtml(uni.degree || "Not listed")}</dd>
      <dt>Duration</dt><dd>${escapeHtml(uni.duration || "Not listed")}</dd>
      <dt>Admission Modus</dt><dd>${escapeHtml(uni.admissionModus || "Unknown")}</dd>
      <dt>Admission Requirements</dt><dd>${escapeHtml(uni.admissionRequirements || "Not listed")}</dd>
      <dt>Fees</dt><dd>${escapeHtml(uni.fees || "Free / No tuition info")}</dd>
      <dt>Fees Total</dt><dd>${escapeHtml(uni.feesTotal || "Not listed")}</dd>
      <dt>Language of Instruction</dt><dd>${escapeHtml(uni.mainLanguage || "Not listed")}</dd>
    </dl>
    <h3>Deadlines</h3>
    <ul class="deadline-list">${deadlineItems}</ul>
    <div class="drawer-actions">
      ${renderLinkButton("DAAD Page", uni.daadUrl)}
      ${renderLinkButton("University Website", uni.websiteUrl)}
      ${renderLinkButton("Fee Details", uni.feesLink)}
    </div>
    <button class="blacklist-button" type="button" data-blacklist-id="${escapeHtml(uni.id)}">
      <span class="ti ti-eye-off" aria-hidden="true"></span>
      Hide this university
    </button>
  `;
}

function renderLinkButton(label, url) {
  if (!url) return `<button class="button disabled" disabled>${label}</button>`;
  return `<a class="button" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${label}</a>`;
}

export function matchesDatasetFilter(uni, filterValue) {
  if (filterValue === "all") return true;
  return uni?.dataset === filterValue;
}

export function matchesDomainFilter(uni, filterValue) {
  if (filterValue === "all") return true;
  return uni?.domain === filterValue;
}

function matchesLanguage(uni) {
  const language = uni.mainLanguage.toLowerCase();

  if (state.language === "english") return language === "english" || language.includes("english");
  if (state.language === "german") return language === "german";
  if (state.language === "both") return language.includes("english") && language.includes("german");
  return true;
}

function matchesFeeFilter(uni) {
  const amount = getFeeAmount(uni);

  if (state.feeFilter === "free") return uni.isFree;
  if (state.feeFilter === "under500") return uni.isFree || (amount !== null && amount < 500);
  if (state.feeFilter === "under1500") return uni.isFree || (amount !== null && amount < 1500);
  if (state.feeFilter === "paid") return !uni.isFree;
  return true;
}

function isOutOfRange(uni, cityCoords) {
  if (!cityCoords) return false;
  const uniCoords = uni.coords || getCityCoords(uni.city);
  const distance = getDistance(cityCoords, uniCoords);
  return distance !== null && distance > state.maxDistance;
}

function getDotColor(uni) {
  const amount = getFeeAmount(uni);

  if (uni.isFree) return "#4ade80";
  if (amount === null) return FEE_COLOR_UNKNOWN;
  if (amount < 500) return "#2dd4bf";
  if (amount <= 2000) return "#facc15";
  return "#fb923c";
}

function parseDeadlines(content = [], keyFacts = []) {
  const deadlines = [];
  const keyFactDeadlines = findKeyFact(keyFacts, (item) => item.name === "Deadlines")?.text;
  const keyFactText = Array.isArray(keyFactDeadlines) ? keyFactDeadlines : [keyFactDeadlines].filter(Boolean);
  deadlines.push(...keyFactText.map(toText).filter(Boolean));

  const deadlineSection = findContentSection(content, "hsk-detail-deadlines", "Application deadlines");
  deadlineSection?.blocks?.forEach((block) => {
    const semester = toText(block?.data?.headline);
    block?.data?.items?.forEach((item) => {
      const parts = [semester, item?.headline, item?.deadline, item?.comment]
        .map(toText)
        .filter(Boolean);
      if (parts.length) deadlines.push(parts.join(": "));
    });
  });

  return [...new Set(deadlines)];
}

function findContentSection(content = [], id, headline) {
  const lowerHeadline = headline.toLowerCase();
  return (
    content.find((section) => section?.data?.id === id) ||
    content.find((section) => section?.data?.headline?.toLowerCase() === lowerHeadline) ||
    null
  );
}

function findBlock(section, headline) {
  const lowerHeadline = headline.toLowerCase();
  return (
    section?.blocks?.find((block) => block?.data?.headline?.toLowerCase() === lowerHeadline) ||
    null
  );
}

function findKeyFact(items, predicate) {
  return items.find(predicate) || null;
}

function toText(value) {
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join(", ");
  if (value === null || value === undefined) return "";
  return cleanHtml(String(value));
}

function cleanHtml(text) {
  return String(text)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function isFreeFees(fees) {
  return fees === null || fees === undefined || String(fees).trim() === "" || String(fees).trim() === "0";
}

function makeDaadUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://www.daad.de${url}`;
}

function normalizeCityName(city) {
  const aliases = {
    München: "Munich",
    Köln: "Cologne",
    Nürnberg: "Nuremberg",
    "Frankfurt am Main": "Frankfurt",
  };

  return aliases[city] || city;
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function hashString(value) {
  return String(value)
    .split("")
    .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getStorage() {
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

if (typeof document !== "undefined") {
  window.addEventListener("DOMContentLoaded", initApp);
  window.addEventListener("resize", () => {
    if (state.universities.length) renderMap();
    setFilterDrawerOpen(state.filterDrawerOpen);
  });
}
