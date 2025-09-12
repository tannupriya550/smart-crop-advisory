import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLanguage } from '@/hooks/use-language';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';
import { insertFarmProfileSchema, type FarmProfile } from '@shared/schema';
import { z } from 'zod';

const profileFormSchema = insertFarmProfileSchema.extend({
  farmSize: z.number().min(0.1, "Farm size must be at least 0.1 acres"),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

const soilTypes = [
  'Black Cotton Soil',
  'Red Soil',
  'Loamy Soil',
  'Sandy Loam',
  'Clay Soil',
  'Alluvial Soil'
];

const irrigationMethods = [
  'Drip Irrigation',
  'Sprinkler Irrigation',
  'Flood Irrigation',
  'Furrow Irrigation',
  'Rain Fed'
];

const commonCrops = [
  'Cotton', 'Soybean', 'Maize', 'Wheat', 'Rice', 'Sugarcane', 
  'Tomato', 'Onion', 'Potato', 'Groundnut', 'Sunflower'
];

export default function Profile() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [farmProfile, setFarmProfile] = useLocalStorage<Partial<FarmProfile> | null>('farm-profile', null);
  
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      farmerName: '',
      location: '',
      farmSize: 1,
      soilType: '',
      irrigation: '',
      previousCrops: [],
      language: language
    }
  });

  useEffect(() => {
    if (farmProfile) {
      form.reset({
        farmerName: farmProfile.farmerName || '',
        location: farmProfile.location || '',
        farmSize: farmProfile.farmSize || 1,
        soilType: farmProfile.soilType || '',
        irrigation: farmProfile.irrigation || '',
        previousCrops: (farmProfile.previousCrops as string[]) || [],
        language: farmProfile.language || language
      });
    }
  }, [farmProfile, form, language]);

  const onSubmit = (data: ProfileFormData) => {
    try {
      const profileData: Partial<FarmProfile> = {
        ...data,
        id: farmProfile?.id || crypto.randomUUID(), // Generate ID if new profile
        language,
        createdAt: farmProfile?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      setFarmProfile(profileData);
      
      toast({
        title: "Profile Saved",
        description: "Your farm profile has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-profile-title">{t('farmProfile')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="farmerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Farmer Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your name" 
                        {...field} 
                        data-testid="input-farmer-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="City, State" 
                        {...field} 
                        data-testid="input-location"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="farmSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('farmSize')} ({t('acres')})</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="2.5" 
                        step="0.1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-farm-size"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="soilType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('soilType')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-soil-type">
                          <SelectValue placeholder="Select soil type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {soilTypes.map((soil) => (
                          <SelectItem key={soil} value={soil}>
                            {soil}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="irrigation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('irrigation')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-irrigation">
                          <SelectValue placeholder="Select irrigation method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {irrigationMethods.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Previous Crops (Select up to 3)</Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                  {commonCrops.map((crop) => {
                    const isSelected = (form.watch('previousCrops') as string[])?.includes(crop);
                    return (
                      <label key={crop} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const currentCrops = (form.getValues('previousCrops') as string[]) || [];
                            if (e.target.checked) {
                              if (currentCrops.length < 3) {
                                form.setValue('previousCrops', [...currentCrops, crop]);
                              }
                            } else {
                              form.setValue('previousCrops', currentCrops.filter(c => c !== crop));
                            }
                          }}
                          data-testid={`checkbox-crop-${crop.toLowerCase().replace(' ', '-')}`}
                        />
                        <span>{crop}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                data-testid="button-save-profile"
              >
                Save Profile
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
