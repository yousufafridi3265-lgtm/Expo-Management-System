import { createContext, useContext, useEffect, useState } from "react";

// index.html ki chhoti script bhi yahi naam use karti hai
const THEME_KEY = "expo_theme";

const ThemeContext = createContext(null);

// Saved theme padhta hai. Na mile ya storage band ho to "light"
const getSavedTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getSavedTheme);

  // Theme badalte hi <html> par "dark" class lagao/hatao aur choice save karo
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");

    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Storage band ho to theme phir bhi chalti hai, bas yaad nahi rahe gi
    }
  }, [theme]);

  const toggleTheme = () =>
    setTheme((current) => (current === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme can only be used inside ThemeProvider");
  }

  return context;
};
