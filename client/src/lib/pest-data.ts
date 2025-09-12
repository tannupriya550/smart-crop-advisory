export interface PestData {
  id: string;
  name: string;
  crops: string[];
  symptoms: string[];
  treatment: string[];
  prevention: string[];
  severity: 'Low' | 'Medium' | 'High';
  imageUrl?: string;
}

export const pestDatabase: PestData[] = [
  {
    id: "bollworm",
    name: "Bollworm",
    crops: ["Cotton", "Tomato", "Maize"],
    symptoms: [
      "Holes in leaves and bolls",
      "Caterpillars visible on plants",
      "Damaged flowers and fruits",
      "Frass (insect waste) on plants"
    ],
    treatment: [
      "Spray Bt cotton varieties",
      "Use pheromone traps",
      "Apply neem-based pesticides",
      "Use Bacillus thuringiensis (Bt) spray"
    ],
    prevention: [
      "Regular field monitoring",
      "Crop rotation with non-host crops",
      "Remove and destroy crop residue",
      "Plant trap crops around main crop"
    ],
    severity: "High",
    imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b"
  },
  {
    id: "aphids",
    name: "Aphids",
    crops: ["Cotton", "Wheat", "Mustard", "Potato"],
    symptoms: [
      "Yellowing of leaves",
      "Curling and distortion of leaves",
      "Sticky honeydew on plants",
      "Stunted plant growth"
    ],
    treatment: [
      "Spray insecticidal soap",
      "Use neem oil solution",
      "Apply systemic insecticides",
      "Release ladybugs as biological control"
    ],
    prevention: [
      "Monitor regularly during cool weather",
      "Remove weeds that harbor aphids",
      "Use reflective mulches",
      "Plant companion crops like marigold"
    ],
    severity: "Medium",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96"
  },
  {
    id: "leaf-blight",
    name: "Leaf Blight",
    crops: ["Rice", "Wheat", "Maize"],
    symptoms: [
      "Brown spots on leaves",
      "Yellowing and wilting",
      "Premature leaf drop",
      "Reduced grain quality"
    ],
    treatment: [
      "Apply copper-based fungicides",
      "Use resistant varieties",
      "Improve field drainage",
      "Remove infected plant debris"
    ],
    prevention: [
      "Avoid overhead irrigation",
      "Ensure proper plant spacing",
      "Rotate crops regularly",
      "Use certified disease-free seeds"
    ],
    severity: "High",
    imageUrl: "https://pixabay.com/get/g52c33f7b42c77481acb4c8debc397a1a425bc0366451997aef7ed8ecfcb5336ab0e2cb33a71d91fc4b7efd16c1cb95c770f951c19748d8d8a97ddcba6f88d2e4_1280.jpg"
  },
  {
    id: "whitefly",
    name: "Whitefly",
    crops: ["Cotton", "Tomato", "Okra"],
    symptoms: [
      "White flies under leaves",
      "Yellowing of leaves",
      "Honeydew secretion",
      "Transmission of viral diseases"
    ],
    treatment: [
      "Use yellow sticky traps",
      "Spray neem-based insecticides",
      "Apply systemic insecticides",
      "Biological control with Encarsia"
    ],
    prevention: [
      "Regular monitoring",
      "Remove weeds",
      "Use resistant varieties",
      "Maintain field hygiene"
    ],
    severity: "High"
  },
  {
    id: "stem-borer",
    name: "Stem Borer",
    crops: ["Rice", "Sugarcane", "Maize"],
    symptoms: [
      "Dead heart in young plants",
      "White ear heads in rice",
      "Holes in stem with frass",
      "Stunted plant growth"
    ],
    treatment: [
      "Release egg parasitoids",
      "Apply granular insecticides",
      "Use pheromone traps",
      "Biological control with Trichogramma"
    ],
    prevention: [
      "Destroy stubble after harvest",
      "Avoid late planting",
      "Use resistant varieties",
      "Maintain proper water levels"
    ],
    severity: "High"
  }
];

export function searchPests(query: string): PestData[] {
  const searchTerm = query.toLowerCase();
  return pestDatabase.filter(pest => 
    pest.name.toLowerCase().includes(searchTerm) ||
    pest.crops.some(crop => crop.toLowerCase().includes(searchTerm)) ||
    pest.symptoms.some(symptom => symptom.toLowerCase().includes(searchTerm))
  );
}

export function getPestsByCrop(cropName: string): PestData[] {
  return pestDatabase.filter(pest => 
    pest.crops.some(crop => crop.toLowerCase() === cropName.toLowerCase())
  );
}
