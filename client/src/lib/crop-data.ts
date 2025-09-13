export interface CropData {
  name: string;
  season: string;
  soilTypes: string[];
  waterRequirement: 'Low' | 'Medium' | 'High';
  duration: number; // in days
  expectedYield: number; // per acre
  estimatedIncome: number; // per acre
  diseases: string[];
  fertilizers: string[];
}

export const cropDatabase: CropData[] = [
  // Existing Crops
  {
    name: "Soybean",
    season: "Kharif",
    soilTypes: ["Black Cotton Soil", "Red Soil", "Loamy Soil"],
    waterRequirement: "Medium",
    duration: 100,
    expectedYield: 15,
    estimatedIncome: 45000,
    diseases: ["Rust", "Blight", "Mosaic Virus"],
    fertilizers: ["DAP", "Urea", "Potash"]
  },
  {
    name: "Cotton",
    season: "Kharif",
    soilTypes: ["Black Cotton Soil", "Red Soil"],
    waterRequirement: "High",
    duration: 180,
    expectedYield: 8,
    estimatedIncome: 60000,
    diseases: ["Bollworm", "Whitefly", "Leaf Curl"],
    fertilizers: ["DAP", "Urea", "NPK"]
  },
  {
    name: "Maize",
    season: "Kharif",
    soilTypes: ["Loamy Soil", "Sandy Loam", "Red Soil"],
    waterRequirement: "Medium",
    duration: 120,
    expectedYield: 25,
    estimatedIncome: 38000,
    diseases: ["Stem Borer", "Fall Army Worm", "Leaf Blight"],
    fertilizers: ["Urea", "DAP", "Potash"]
  },
  {
    name: "Wheat",
    season: "Rabi",
    soilTypes: ["Loamy Soil", "Clay Soil", "Sandy Loam"],
    waterRequirement: "Medium",
    duration: 130,
    expectedYield: 20,
    estimatedIncome: 35000,
    diseases: ["Rust", "Smut", "Aphids"],
    fertilizers: ["Urea", "DAP", "NPK"]
  },
  {
    name: "Sugarcane",
    season: "Annual",
    soilTypes: ["Loamy Soil", "Clay Soil"],
    waterRequirement: "High",
    duration: 365,
    expectedYield: 400,
    estimatedIncome: 80000,
    diseases: ["Red Rot", "Smut", "Borer"],
    fertilizers: ["Urea", "DAP", "Potash"]
  },
  {
    name: "Rice",
    season: "Kharif",
    soilTypes: ["Clay Soil", "Loamy Soil"],
    waterRequirement: "High",
    duration: 120,
    expectedYield: 22,
    estimatedIncome: 40000,
    diseases: ["Blast", "Blight", "Brown Plant Hopper"],
    fertilizers: ["Urea", "DAP", "Zinc Sulphate"]
  },
  
  // Kharif Crops (Monsoon Season)
  {
    name: "Pearl Millet (Bajra)",
    season: "Kharif",
    soilTypes: ["Sandy Soil", "Sandy Loam", "Red Soil"],
    waterRequirement: "Low",
    duration: 75,
    expectedYield: 12,
    estimatedIncome: 18000,
    diseases: ["Downy Mildew", "Smut", "Ergot"],
    fertilizers: ["Urea", "DAP", "Potash"]
  },
  {
    name: "Sorghum (Jowar)",
    season: "Kharif",
    soilTypes: ["Red Soil", "Sandy Loam", "Black Cotton Soil"],
    waterRequirement: "Low",
    duration: 110,
    expectedYield: 15,
    estimatedIncome: 22000,
    diseases: ["Anthracnose", "Grain Mold", "Shoot Fly"],
    fertilizers: ["Urea", "DAP", "NPK"]
  },
  {
    name: "Finger Millet (Ragi)",
    season: "Kharif",
    soilTypes: ["Red Soil", "Loamy Soil", "Hilly Soil"],
    waterRequirement: "Medium",
    duration: 120,
    expectedYield: 10,
    estimatedIncome: 35000,
    diseases: ["Blast", "Brown Spot", "Smut"],
    fertilizers: ["Urea", "DAP", "Potash"]
  },
  {
    name: "Groundnut",
    season: "Kharif",
    soilTypes: ["Sandy Loam", "Red Soil", "Black Cotton Soil"],
    waterRequirement: "Medium",
    duration: 120,
    expectedYield: 18,
    estimatedIncome: 55000,
    diseases: ["Tikka Disease", "Rust", "Bud Necrosis"],
    fertilizers: ["DAP", "Potash", "Gypsum"]
  },
  {
    name: "Sunflower",
    season: "Kharif",
    soilTypes: ["Red Soil", "Black Cotton Soil", "Loamy Soil"],
    waterRequirement: "Medium",
    duration: 90,
    expectedYield: 12,
    estimatedIncome: 48000,
    diseases: ["Downy Mildew", "Rust", "Head Rot"],
    fertilizers: ["Urea", "DAP", "Potash"]
  },
  {
    name: "Sesame (Til)",
    season: "Kharif",
    soilTypes: ["Sandy Loam", "Red Soil", "Well-drained Soil"],
    waterRequirement: "Low",
    duration: 85,
    expectedYield: 8,
    estimatedIncome: 40000,
    diseases: ["Phyllody", "Bacterial Blight", "Leaf Spot"],
    fertilizers: ["Urea", "DAP", "Potash"]
  },
  {
    name: "Castor",
    season: "Kharif",
    soilTypes: ["Red Soil", "Sandy Loam", "Black Cotton Soil"],
    waterRequirement: "Low",
    duration: 150,
    expectedYield: 10,
    estimatedIncome: 45000,
    diseases: ["Wilt", "Gray Mold", "Leaf Spot"],
    fertilizers: ["Urea", "DAP", "Potash"]
  },
  
  // Rabi Crops (Winter Season)
  {
    name: "Barley",
    season: "Rabi",
    soilTypes: ["Loamy Soil", "Sandy Loam", "Clay Soil"],
    waterRequirement: "Medium",
    duration: 120,
    expectedYield: 18,
    estimatedIncome: 25000,
    diseases: ["Stripe Rust", "Loose Smut", "Powdery Mildew"],
    fertilizers: ["Urea", "DAP", "NPK"]
  },
  {
    name: "Chickpea (Gram)",
    season: "Rabi",
    soilTypes: ["Clay Soil", "Loamy Soil", "Black Cotton Soil"],
    waterRequirement: "Low",
    duration: 120,
    expectedYield: 12,
    estimatedIncome: 42000,
    diseases: ["Wilt", "Blight", "Pod Borer"],
    fertilizers: ["DAP", "Potash", "Rhizobium"]
  },
  {
    name: "Lentil (Masoor)",
    season: "Rabi",
    soilTypes: ["Loamy Soil", "Clay Soil", "Well-drained Soil"],
    waterRequirement: "Low",
    duration: 110,
    expectedYield: 10,
    estimatedIncome: 50000,
    diseases: ["Wilt", "Rust", "Blight"],
    fertilizers: ["DAP", "Potash", "Rhizobium"]
  },
  {
    name: "Mustard",
    season: "Rabi",
    soilTypes: ["Loamy Soil", "Sandy Loam", "Clay Soil"],
    waterRequirement: "Low",
    duration: 100,
    expectedYield: 12,
    estimatedIncome: 36000,
    diseases: ["White Rust", "Downy Mildew", "Aphids"],
    fertilizers: ["Urea", "DAP", "Potash"]
  },
  {
    name: "Safflower",
    season: "Rabi",
    soilTypes: ["Black Cotton Soil", "Red Soil", "Sandy Loam"],
    waterRequirement: "Low",
    duration: 120,
    expectedYield: 8,
    estimatedIncome: 32000,
    diseases: ["Wilt", "Rust", "Aphids"],
    fertilizers: ["Urea", "DAP", "Potash"]
  },
  {
    name: "Coriander",
    season: "Rabi",
    soilTypes: ["Loamy Soil", "Well-drained Soil", "Sandy Loam"],
    waterRequirement: "Medium",
    duration: 90,
    expectedYield: 12,
    estimatedIncome: 60000,
    diseases: ["Wilt", "Stem Gall", "Aphids"],
    fertilizers: ["Urea", "DAP", "Potash"]
  },
  
  // Pulse Crops
  {
    name: "Pigeon Pea (Arhar/Tur)",
    season: "Kharif",
    soilTypes: ["Red Soil", "Black Cotton Soil", "Sandy Loam"],
    waterRequirement: "Medium",
    duration: 180,
    expectedYield: 12,
    estimatedIncome: 65000,
    diseases: ["Wilt", "Sterility Mosaic", "Pod Fly"],
    fertilizers: ["DAP", "Potash", "Rhizobium"]
  },
  {
    name: "Green Gram (Moong)",
    season: "Kharif",
    soilTypes: ["Sandy Loam", "Loamy Soil", "Well-drained Soil"],
    waterRequirement: "Low",
    duration: 65,
    expectedYield: 8,
    estimatedIncome: 45000,
    diseases: ["Yellow Mosaic", "Powdery Mildew", "Leaf Spot"],
    fertilizers: ["DAP", "Potash", "Rhizobium"]
  },
  {
    name: "Black Gram (Urad)",
    season: "Kharif",
    soilTypes: ["Clay Soil", "Loamy Soil", "Black Cotton Soil"],
    waterRequirement: "Medium",
    duration: 70,
    expectedYield: 8,
    estimatedIncome: 55000,
    diseases: ["Yellow Mosaic", "Leaf Crinkle", "Pod Borer"],
    fertilizers: ["DAP", "Potash", "Rhizobium"]
  },
  
  // Vegetable Crops
  {
    name: "Tomato",
    season: "Rabi",
    soilTypes: ["Loamy Soil", "Sandy Loam", "Well-drained Soil"],
    waterRequirement: "High",
    duration: 120,
    expectedYield: 200,
    estimatedIncome: 150000,
    diseases: ["Blight", "Wilt", "Fruit Rot"],
    fertilizers: ["Urea", "DAP", "NPK"]
  },
  {
    name: "Onion",
    season: "Rabi",
    soilTypes: ["Loamy Soil", "Sandy Loam", "Well-drained Soil"],
    waterRequirement: "Medium",
    duration: 120,
    expectedYield: 150,
    estimatedIncome: 90000,
    diseases: ["Purple Blotch", "Downy Mildew", "Thrips"],
    fertilizers: ["Urea", "DAP", "Potash"]
  },
  {
    name: "Potato",
    season: "Rabi",
    soilTypes: ["Loamy Soil", "Sandy Loam", "Well-drained Soil"],
    waterRequirement: "Medium",
    duration: 90,
    expectedYield: 180,
    estimatedIncome: 80000,
    diseases: ["Late Blight", "Early Blight", "Black Scurf"],
    fertilizers: ["Urea", "DAP", "Potash"]
  },
  {
    name: "Brinjal (Eggplant)",
    season: "Kharif",
    soilTypes: ["Loamy Soil", "Sandy Loam", "Well-drained Soil"],
    waterRequirement: "Medium",
    duration: 150,
    expectedYield: 120,
    estimatedIncome: 85000,
    diseases: ["Bacterial Wilt", "Little Leaf", "Fruit Borer"],
    fertilizers: ["Urea", "DAP", "NPK"]
  },
  {
    name: "Okra (Bhindi)",
    season: "Kharif",
    soilTypes: ["Loamy Soil", "Sandy Loam", "Well-drained Soil"],
    waterRequirement: "Medium",
    duration: 120,
    expectedYield: 80,
    estimatedIncome: 70000,
    diseases: ["Yellow Mosaic", "Powdery Mildew", "Fruit Borer"],
    fertilizers: ["Urea", "DAP", "Potash"]
  },
  {
    name: "Chilli",
    season: "Kharif",
    soilTypes: ["Loamy Soil", "Sandy Loam", "Red Soil"],
    waterRequirement: "Medium",
    duration: 180,
    expectedYield: 25,
    estimatedIncome: 125000,
    diseases: ["Anthracnose", "Bacterial Wilt", "Thrips"],
    fertilizers: ["Urea", "DAP", "NPK"]
  },
  
  // Cash Crops & Spices
  {
    name: "Turmeric",
    season: "Kharif",
    soilTypes: ["Loamy Soil", "Red Soil", "Well-drained Soil"],
    waterRequirement: "High",
    duration: 300,
    expectedYield: 25,
    estimatedIncome: 200000,
    diseases: ["Rhizome Rot", "Leaf Spot", "Scale Insects"],
    fertilizers: ["Organic Manure", "NPK", "Potash"]
  },
  {
    name: "Ginger",
    season: "Kharif",
    soilTypes: ["Loamy Soil", "Sandy Loam", "Well-drained Soil"],
    waterRequirement: "High",
    duration: 240,
    expectedYield: 100,
    estimatedIncome: 300000,
    diseases: ["Rhizome Rot", "Bacterial Wilt", "Leaf Spot"],
    fertilizers: ["Organic Manure", "NPK", "Potash"]
  },
  {
    name: "Garlic",
    season: "Rabi",
    soilTypes: ["Loamy Soil", "Sandy Loam", "Well-drained Soil"],
    waterRequirement: "Medium",
    duration: 150,
    expectedYield: 80,
    estimatedIncome: 160000,
    diseases: ["Purple Blotch", "White Rot", "Thrips"],
    fertilizers: ["Urea", "DAP", "Potash"]
  },
  
  // Fiber Crops
  {
    name: "Jute",
    season: "Kharif",
    soilTypes: ["Clay Soil", "Loamy Soil", "Alluvial Soil"],
    waterRequirement: "High",
    duration: 120,
    expectedYield: 20,
    estimatedIncome: 35000,
    diseases: ["Stem Rot", "Root Rot", "Anthracnose"],
    fertilizers: ["Urea", "DAP", "Potash"]
  },
  
  // Fodder Crops
  {
    name: "Lucerne (Alfalfa)",
    season: "Annual",
    soilTypes: ["Loamy Soil", "Sandy Loam", "Well-drained Soil"],
    waterRequirement: "High",
    duration: 365,
    expectedYield: 60,
    estimatedIncome: 45000,
    diseases: ["Root Rot", "Leaf Spot", "Aphids"],
    fertilizers: ["DAP", "Potash", "Organic Manure"]
  },
  {
    name: "Berseem",
    season: "Rabi",
    soilTypes: ["Loamy Soil", "Clay Soil", "Alluvial Soil"],
    waterRequirement: "High",
    duration: 120,
    expectedYield: 45,
    estimatedIncome: 25000,
    diseases: ["Root Rot", "Leaf Spot", "Aphids"],
    fertilizers: ["DAP", "Potash", "Rhizobium"]
  }
];

export function getCropRecommendations(
  soilType: string,
  season: string,
  farmSize: number
): Array<CropData & { matchPercentage: number }> {
  return cropDatabase
    .filter(crop => 
      crop.soilTypes.includes(soilType) && 
      (crop.season === season || crop.season === "Annual")
    )
    .map(crop => ({
      ...crop,
      matchPercentage: calculateMatchPercentage(crop, soilType, season)
    }))
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, 3);
}

function calculateMatchPercentage(crop: CropData, soilType: string, season: string): number {
  let score = 0;
  
  // Soil compatibility
  if (crop.soilTypes.includes(soilType)) score += 40;
  
  // Season compatibility
  if (crop.season === season) score += 30;
  else if (crop.season === "Annual") score += 20;
  
  // Additional factors
  score += Math.random() * 30; // Simulate other factors like climate, market prices
  
  return Math.min(Math.round(score), 100);
}
