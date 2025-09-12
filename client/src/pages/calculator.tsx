import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLanguage } from '@/hooks/use-language';
import { Badge } from '@/components/ui/badge';
import { Calculator, Leaf } from 'lucide-react';

interface FertilizerCalculation {
  cropType: string;
  area: number;
  nLevel?: number;
  pLevel?: number;
  kLevel?: number;
}

interface FertilizerRecommendation {
  name: string;
  nutrientRatio: string;
  quantity: number;
  costPerBag: number;
  totalCost: number;
  description: string;
}

const cropFertilizerData: Record<string, {
  nRequirement: number;
  pRequirement: number;
  kRequirement: number;
  baseFertilizers: Array<{
    name: string;
    nutrientRatio: string;
    nPercent: number;
    pPercent: number;
    kPercent: number;
    costPerBag: number;
  }>;
}> = {
  soybean: {
    nRequirement: 40,
    pRequirement: 60,
    kRequirement: 40,
    baseFertilizers: [
      { name: "Urea", nutrientRatio: "46:0:0", nPercent: 46, pPercent: 0, kPercent: 0, costPerBag: 1200 },
      { name: "DAP", nutrientRatio: "18:46:0", nPercent: 18, pPercent: 46, kPercent: 0, costPerBag: 1400 },
      { name: "Potash", nutrientRatio: "0:0:60", nPercent: 0, pPercent: 0, kPercent: 60, costPerBag: 900 }
    ]
  },
  cotton: {
    nRequirement: 60,
    pRequirement: 30,
    kRequirement: 30,
    baseFertilizers: [
      { name: "Urea", nutrientRatio: "46:0:0", nPercent: 46, pPercent: 0, kPercent: 0, costPerBag: 1200 },
      { name: "DAP", nutrientRatio: "18:46:0", nPercent: 18, pPercent: 46, kPercent: 0, costPerBag: 1400 },
      { name: "NPK", nutrientRatio: "19:19:19", nPercent: 19, pPercent: 19, kPercent: 19, costPerBag: 1100 }
    ]
  },
  maize: {
    nRequirement: 80,
    pRequirement: 40,
    kRequirement: 40,
    baseFertilizers: [
      { name: "Urea", nutrientRatio: "46:0:0", nPercent: 46, pPercent: 0, kPercent: 0, costPerBag: 1200 },
      { name: "DAP", nutrientRatio: "18:46:0", nPercent: 18, pPercent: 46, kPercent: 0, costPerBag: 1400 },
      { name: "Potash", nutrientRatio: "0:0:60", nPercent: 0, pPercent: 0, kPercent: 60, costPerBag: 900 }
    ]
  },
  wheat: {
    nRequirement: 60,
    pRequirement: 30,
    kRequirement: 30,
    baseFertilizers: [
      { name: "Urea", nutrientRatio: "46:0:0", nPercent: 46, pPercent: 0, kPercent: 0, costPerBag: 1200 },
      { name: "DAP", nutrientRatio: "18:46:0", nPercent: 18, pPercent: 46, kPercent: 0, costPerBag: 1400 },
      { name: "NPK", nutrientRatio: "12:32:16", nPercent: 12, pPercent: 32, kPercent: 16, costPerBag: 1300 }
    ]
  }
};

export default function FertilizerCalculator() {
  const { t } = useLanguage();
  const [results, setResults] = useState<FertilizerRecommendation[]>([]);
  const [totalCost, setTotalCost] = useState(0);

  const form = useForm<FertilizerCalculation>({
    defaultValues: {
      cropType: '',
      area: 1,
      nLevel: undefined,
      pLevel: undefined,
      kLevel: undefined,
    }
  });

  const onSubmit = (data: FertilizerCalculation) => {
    const cropData = cropFertilizerData[data.cropType];
    if (!cropData) return;

    // Calculate nutrient requirements (kg/acre)
    const nRequired = cropData.nRequirement * data.area;
    const pRequired = cropData.pRequirement * data.area;
    const kRequired = cropData.kRequirement * data.area;

    // Adjust for soil test results if provided
    const nNeeded = data.nLevel ? Math.max(0, nRequired - (data.nLevel * data.area * 10)) : nRequired;
    const pNeeded = data.pLevel ? Math.max(0, pRequired - (data.pLevel * data.area * 10)) : pRequired;
    const kNeeded = data.kLevel ? Math.max(0, kRequired - (data.kLevel * data.area * 10)) : kRequired;

    const recommendations: FertilizerRecommendation[] = [];
    let totalInvestment = 0;

    // Calculate fertilizer requirements
    cropData.baseFertilizers.forEach(fertilizer => {
      let quantityNeeded = 0;
      let primaryNutrient = '';

      if (fertilizer.nPercent > 0 && nNeeded > 0) {
        quantityNeeded = Math.max(quantityNeeded, nNeeded / (fertilizer.nPercent / 100));
        primaryNutrient = 'Nitrogen';
      }
      if (fertilizer.pPercent > 0 && pNeeded > 0) {
        quantityNeeded = Math.max(quantityNeeded, pNeeded / (fertilizer.pPercent / 100));
        primaryNutrient = primaryNutrient ? `${primaryNutrient} & Phosphorus` : 'Phosphorus';
      }
      if (fertilizer.kPercent > 0 && kNeeded > 0) {
        quantityNeeded = Math.max(quantityNeeded, kNeeded / (fertilizer.kPercent / 100));
        primaryNutrient = primaryNutrient ? `${primaryNutrient} & Potash` : 'Potash';
      }

      if (quantityNeeded > 0) {
        const bags = Math.ceil(quantityNeeded / 50); // Assuming 50kg bags
        const cost = bags * fertilizer.costPerBag;
        totalInvestment += cost;

        recommendations.push({
          name: fertilizer.name,
          nutrientRatio: fertilizer.nutrientRatio,
          quantity: Math.round(quantityNeeded),
          costPerBag: fertilizer.costPerBag,
          totalCost: cost,
          description: `Primary source of ${primaryNutrient}`
        });
      }
    });

    setResults(recommendations);
    setTotalCost(totalInvestment);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2" data-testid="text-calculator-title">
          <Calculator className="h-6 w-6 text-primary" />
          {t('calculator')}
        </h1>
        <p className="text-muted-foreground">
          Calculate the optimal fertilizer requirements for your crops
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle data-testid="text-input-form-title">Crop & Field Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="cropType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crop Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-crop-type">
                            <SelectValue placeholder="Select crop" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="soybean">Soybean</SelectItem>
                          <SelectItem value="cotton">Cotton</SelectItem>
                          <SelectItem value="maize">Maize</SelectItem>
                          <SelectItem value="wheat">Wheat</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area (Acres)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="2.5" 
                          step="0.1"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-area"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Soil Test Results (Optional)</label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Leave empty if soil test is not available
                  </p>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="nLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="N %" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              data-testid="input-n-level"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="P %" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              data-testid="input-p-level"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="kLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="K %" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              data-testid="input-k-level"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  data-testid="button-calculate"
                >
                  {t('calculate')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle data-testid="text-results-title">Fertilizer Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8">
                <Leaf className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground" data-testid="text-no-results">
                  Enter crop details above to get fertilizer recommendations
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((fertilizer, index) => (
                  <div 
                    key={fertilizer.name} 
                    className="p-4 border border-border rounded-md"
                    data-testid={`card-fertilizer-${index}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium" data-testid={`text-fertilizer-name-${index}`}>
                          {fertilizer.name}
                        </h3>
                        <Badge variant="outline" className="mt-1">
                          {fertilizer.nutrientRatio}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary text-lg" data-testid={`text-quantity-${index}`}>
                          {fertilizer.quantity} kg
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ({Math.ceil(fertilizer.quantity / 50)} bags)
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Cost per bag (50kg):</span>
                      <span data-testid={`text-cost-per-bag-${index}`}>₹{fertilizer.costPerBag}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span>Total Cost:</span>
                      <span data-testid={`text-total-cost-${index}`}>₹{fertilizer.totalCost}</span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {fertilizer.description}
                    </p>
                  </div>
                ))}
                
                <div className="p-4 bg-muted rounded-md">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Investment:</span>
                    <span className="text-primary" data-testid="text-total-investment">
                      ₹{totalCost.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1" data-testid="text-per-acre-cost">
                    For {form.watch('area')} acres (₹{Math.round(totalCost / (form.watch('area') || 1)).toLocaleString()} per acre)
                  </p>
                </div>

                <div className="mt-4 p-3 bg-primary/5 rounded-md border border-primary/20">
                  <p className="text-sm font-medium text-primary mb-1">Application Tips:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Apply fertilizers in split doses for better absorption</li>
                    <li>• Water the field after fertilizer application</li>
                    <li>• Store fertilizers in a cool, dry place</li>
                    <li>• Consider organic alternatives like compost for soil health</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
