import { createContext, useContext, useState, useEffect } from "react";
import { translations, Language, TranslationKey } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // ✅ Check if saved in localStorage
    const saved = localStorage.getItem("crop-advisor-language");
    if (saved) return saved as Language;

    // ✅ Auto-detect from browser
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("pa")) return "pa" as Language;
    if (browserLang.startsWith("hi")) return "hi" as Language;

    return "en"; // default
  });

  useEffect(() => {
    localStorage.setItem("crop-advisor-language", language);
  }, [language]);

  const t = (key: TranslationKey): string => {
    return (
      translations[language][key] || translations.en[key] || key
    );
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
