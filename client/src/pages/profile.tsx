import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useLanguage } from "@/hooks/use-language";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";
import {
  insertFarmProfileSchema,
  type FarmProfile,
} from "@shared/schema";
import { z } from "zod";

// ✅ Schema for form validation
const profileFormSchema = insertFarmProfileSchema.extend({
  farmSize: z.number().min(0.1, "Farm size must be at least 0.1 acres"),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

const soilTypes = [
  "Black Cotton Soil",
  "Red Soil",
  "Loamy Soil",
  "Sandy Loam",
  "Clay Soil",
  "Alluvial Soil",
];

const irrigationMethods = [
  "Drip Irrigation",
  "Sprinkler Irrigation",
  "Flood Irrigation",
  "Furrow Irrigation",
  "Rain Fed",
];

const commonCrops = [
  "Cotton",
  "Soybean",
  "Maize",
  "Wheat",
  "Rice",
  "Sugarcane",
  "Tomato",
  "Onion",
  "Potato",
  "Groundnut",
  "Sunflower",
];

export default function Profile() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [farmProfile, setFarmProfile] = useLocalStorage<
    Partial<FarmProfile> | null
  >("farm-profile", null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      farmerName: "",
      location: "",
      farmSize: 1,
      soilType: "",
      irrigation: "",
      previousCrops: [],
      language: language,
    },
  });

  // ✅ Load saved profile into form
  useEffect(() => {
    if (farmProfile) {
      form.reset({
        farmerName: farmProfile.farmerName || "",
        location: farmProfile.location || "",
        farmSize: farmProfile.farmSize || 1,
        soilType: farmProfile.soilType || "",
        irrigation: farmProfile.irrigation || "",
        previousCrops: (farmProfile.previousCrops as string[]) ?? [], // ✅ fixed typing
        language: farmProfile.language || language,
      });
    }
  }, [farmProfile, form, language]);

  // ✅ Save profile
  const onSubmit = (data: ProfileFormData) => {
    try {
      const profileData: Partial<FarmProfile> = {
        ...data,
        previousCrops: (data.previousCrops ?? []) as string[], // ✅ fix typing
        id: farmProfile?.id || crypto.randomUUID(),
        language,
        createdAt: farmProfile?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      setFarmProfile(profileData);

      toast({
        title: "✅ Profile Saved",
        description: `Hello ${
          data.farmerName || "Farmer"
        }, your profile was updated successfully!`,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="profile-3d-container max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Animated Farmer Characters */}
      <div className="farmer-character farmer-floating">
        <div className="farmer-body">
          <div className="farmer-hat"></div>
          <div className="farmer-eyes">
            <div className="farmer-eye left"></div>
            <div className="farmer-eye right"></div>
          </div>
          <div className="farmer-mouth"></div>
          <div className="farmer-arms">
            <div className="farmer-arm left"></div>
            <div className="farmer-arm right"></div>
          </div>
          <div className="farmer-speech-bubble">
            Welcome! 🌱
          </div>
          <div className="farmer-peep"></div>
        </div>
      </div>

      {/* Second Farmer Character */}
      <div className="farmer-character-2 farmer-small">
        <div className="farmer-body">
          <div className="farmer-hat"></div>
          <div className="farmer-eyes">
            <div className="farmer-eye left"></div>
            <div className="farmer-eye right"></div>
          </div>
          <div className="farmer-mouth"></div>
          <div className="farmer-arms">
            <div className="farmer-arm left"></div>
            <div className="farmer-arm right"></div>
          </div>
          <div className="farmer-speech-bubble">
            Hi there! 👋
          </div>
        </div>
      </div>

      {/* Third Farmer Character */}
      <div className="farmer-character-3 farmer-small">
        <div className="farmer-body">
          <div className="farmer-hat"></div>
          <div className="farmer-eyes">
            <div className="farmer-eye left"></div>
            <div className="farmer-eye right"></div>
          </div>
          <div className="farmer-mouth"></div>
          <div className="farmer-arms">
            <div className="farmer-arm left"></div>
            <div className="farmer-arm right"></div>
          </div>
          <div className="farmer-speech-bubble">
            Let's farm! 🚜
          </div>
        </div>
      </div>

      {/* Peeking Farmer */}
      <div className="farmer-peek">
        <div className="farmer-body">
          <div className="farmer-hat"></div>
          <div className="farmer-eyes">
            <div className="farmer-eye left"></div>
            <div className="farmer-eye right"></div>
          </div>
          <div className="farmer-mouth"></div>
        </div>
      </div>
      
      <Card className="profile-3d-card profile-3d-shadow">
        <CardHeader className="profile-3d-header">
          <CardTitle data-testid="text-profile-title" className="profile-depth-layer-4">
            {t("farmProfile")}
          </CardTitle>
        </CardHeader>
        <CardContent className="profile-form-3d">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Farmer Name */}
              <FormField
                control={form.control}
                name="farmerName"
                render={({ field }) => (
                  <FormItem className="profile-form-field profile-depth-layer-1">
                    <FormLabel className="profile-floating-element">Farmer Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        {...field}
                        data-testid="input-farmer-name"
                        className="profile-floating-element"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="profile-form-field profile-depth-layer-2">
                    <FormLabel className="profile-floating-element">Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="City, State"
                        {...field}
                        data-testid="input-location"
                        className="profile-floating-element"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Farm Size */}
              <FormField
                control={form.control}
                name="farmSize"
                render={({ field }) => (
                  <FormItem className="profile-form-field profile-depth-layer-3">
                    <FormLabel className="profile-floating-element">
                      {t("farmSize")} ({t("acres")})
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2.5"
                        step="0.1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                        data-testid="input-farm-size"
                        className="profile-floating-element"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Soil Type */}
              <FormField
                control={form.control}
                name="soilType"
                render={({ field }) => (
                  <FormItem className="profile-form-field profile-depth-layer-2">
                    <FormLabel className="profile-floating-element">{t("soilType")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-soil-type" className="profile-floating-element">
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

              {/* Irrigation */}
              <FormField
                control={form.control}
                name="irrigation"
                render={({ field }) => (
                  <FormItem className="profile-form-field profile-depth-layer-1">
                    <FormLabel className="profile-floating-element">{t("irrigation")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-irrigation" className="profile-floating-element">
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

              {/* Previous Crops */}
              <div className="space-y-2 profile-form-field profile-depth-layer-3">
                <Label className="profile-floating-element">Previous Crops (Select up to 3)</Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2 profile-floating-element">
                  {commonCrops.map((crop) => {
                    const isSelected = (
                      (form.watch("previousCrops") as string[]) ?? []
                    ).includes(crop);
                    return (
                      <label
                        key={crop}
                        className="flex items-center space-x-2 text-sm profile-floating-element"
                        style={{ animationDelay: `${Math.random() * 0.5}s` }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const currentCrops =
                              (form.getValues("previousCrops") as string[]) ||
                              [];
                            if (e.target.checked) {
                              if (currentCrops.length < 3) {
                                form.setValue("previousCrops", [
                                  ...currentCrops,
                                  crop,
                                ]);
                              }
                            } else {
                              form.setValue(
                                "previousCrops",
                                currentCrops.filter((c) => c !== crop)
                              );
                            }
                          }}
                          data-testid={`checkbox-crop-${crop
                            .toLowerCase()
                            .replace(" ", "-")}`}
                          className="profile-floating-element"
                        />
                        <span className="profile-floating-element">{crop}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full profile-3d-button profile-depth-layer-4"
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
