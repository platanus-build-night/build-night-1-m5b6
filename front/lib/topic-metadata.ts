import { Topic, AuthorSource } from "./types"; // Make sure AuthorSource is imported

// --- Topic Metadata Mappings ---
export const topicNames: Record<Topic, string> = {
  social: "Social",
  science: "Ciencia",
  tech: "Tecnología",
  arts: "Artes",
  sports: "Deportes",
  business: "Negocios",
};

export const topicPhonetics: Record<Topic, string> = {
  social:  "soh-SYAL",       // Social
  science: "SYEN-sya",       // Ciencia
  tech:    "tek-no-lo-HEE-ah",// Tecnología
  arts:    "AR-tes",          // Artes
  sports:  "de-POR-tes",      // Deportes
  business:"ne-GO-sjos",     // Negocios
};

export const getTopicPhonetic = (topic: Topic): string => {
  return topicPhonetics[topic];
};


export const getTopicGradient = (topic: Topic): string => {
  switch (topic) {
    case "social":
      // Warm community glow with two radial "bursts"
      return `
        radial-gradient(circle at 30% 30%, rgba(255,95,109,0.85) 0%, rgba(215,35,75,0.85) 60%, rgba(158,23,57,0.9) 100%),
        radial-gradient(circle at 70% 70%, rgba(255,195,113,0.6) 0%, transparent 70%)
      `.trim();

    case "science":
      // Fresh discovery spectrum
      return `
        radial-gradient(circle at 40% 40%, rgba(33,147,176,0.9) 0%, rgba(15,75,102,0.85) 70%, rgba(10,50,80,0.9) 100%),
        radial-gradient(circle at 65% 65%, rgba(109,213,237,0.6) 0%, transparent 80%)
      `.trim();

    case "tech":
      // Electric pulse with bright core and dark outer
      return `
        radial-gradient(circle at center, rgba(0,195,255,0.9) 0%, rgba(0,80,110,0.85) 60%, rgba(0,40,60,0.9) 100%),
        radial-gradient(circle at 80% 20%, rgba(255,255,28,0.5) 0%, transparent 80%)
      `.trim();

    case "arts":
      // Creative pastel sunrise reversed for contrast
      return `
        radial-gradient(circle at 25% 25%, rgba(255,154,139,0.8) 0%, rgba(200,100,110,0.8) 60%, rgba(140,50,70,0.9) 100%),
        radial-gradient(circle at 75% 75%, rgba(255,106,136,0.5) 0%, transparent 70%)
      `.trim();

    case "sports":
      // High-energy fire burst
      return `
        radial-gradient(circle at 30% 70%, rgba(247,151,30,0.9) 0%, rgba(200,110,20,0.85) 60%, rgba(150,80,15,0.9) 100%),
        radial-gradient(circle at 80% 30%, rgba(255,111,97,0.6) 0%, transparent 70%)
      `.trim();

    case "business":
      // Sleek steel-blue depth
      return `
        radial-gradient(circle at center, rgba(44,62,80,0.9) 0%, rgba(28,40,60,0.9) 70%, rgba(18,28,40,0.95) 100%),
        radial-gradient(circle at 70% 30%, rgba(76,161,175,0.5) 0%, transparent 80%)
      `.trim();

    default:
      return `
        radial-gradient(circle at center, rgba(80,80,80,0.9) 0%, rgba(50,50,50,0.9) 100%)
      `.trim();
  }
};

// New function for lighter gradients
export const getLightTopicGradient = (topic: Topic): string => {
  switch (topic) {
    case "social":
      // Much lighter warm community glow
      return `
        radial-gradient(circle at 30% 30%, rgba(255,95,109,0.1) 0%, rgba(215,35,75,0.1) 60%, rgba(158,23,57,0.15) 100%),
        radial-gradient(circle at 70% 70%, rgba(255,195,113,0.05) 0%, transparent 70%)
      `.trim();

    case "science":
      // Much lighter fresh discovery spectrum
      return `
        radial-gradient(circle at 40% 40%, rgba(33,147,176,0.15) 0%, rgba(15,75,102,0.1) 70%, rgba(10,50,80,0.15) 100%),
        radial-gradient(circle at 65% 65%, rgba(109,213,237,0.05) 0%, transparent 80%)
      `.trim();

    case "tech":
      // Much lighter electric pulse
      return `
        radial-gradient(circle at center, rgba(0,195,255,0.15) 0%, rgba(0,80,110,0.1) 60%, rgba(0,40,60,0.15) 100%),
        radial-gradient(circle at 80% 20%, rgba(255,255,28,0.05) 0%, transparent 80%)
      `.trim();

    case "arts":
      // Much lighter creative pastel sunrise
      return `
        radial-gradient(circle at 25% 25%, rgba(255,154,139,0.1) 0%, rgba(200,100,110,0.1) 60%, rgba(140,50,70,0.15) 100%),
        radial-gradient(circle at 75% 75%, rgba(255,106,136,0.05) 0%, transparent 70%)
      `.trim();

    case "sports":
      // Much lighter high-energy fire burst
      return `
        radial-gradient(circle at 30% 70%, rgba(247,151,30,0.15) 0%, rgba(200,110,20,0.1) 60%, rgba(150,80,15,0.15) 100%),
        radial-gradient(circle at 80% 30%, rgba(255,111,97,0.05) 0%, transparent 70%)
      `.trim();

    case "business":
      // Much lighter sleek steel-blue depth
      return `
        radial-gradient(circle at center, rgba(44,62,80,0.15) 0%, rgba(28,40,60,0.15) 70%, rgba(18,28,40,0.2) 100%),
        radial-gradient(circle at 70% 30%, rgba(76,161,175,0.05) 0%, transparent 80%)
      `.trim();

    default:
      // Much lighter default gradient
      return `
        radial-gradient(circle at center, rgba(80,80,80,0.1) 0%, rgba(50,50,50,0.1) 100%)
      `.trim();
  }
};

export const getTopicIcon = (topic: Topic): string => {
  switch (topic) {
    case "social":
      return "UserGroupIcon";
    case "science":
      return "BeakerIcon";
    case "tech":
      return "CpuChipIcon";
    case "arts":
      return "PaintBrushIcon";
    case "sports":
      return "TrophyIcon";
    case "business":
      return "BriefcaseIcon";
    default:
      // Return a default icon name for unhandled topics
      return "QuestionMarkCircleIcon";
  }
};

// --- Author/Source Metadata ---
export const sourceIcon: Record<AuthorSource, { symbol?: string; src?: string }> = {
  "Emol": { src: "/emol.jpg" },
  "T13": { src: "/t13.webp" },
  "LaTercera": { src: "/lt.jpg" },
  "ElPais": { src: "/elpais.png" },
  "ElMostrador": { src: "/elmostrador.png" }, 
};

