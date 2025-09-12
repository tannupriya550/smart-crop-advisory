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
