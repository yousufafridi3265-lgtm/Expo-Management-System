import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AUTH_EXPIRED_EVENT, TOKEN_KEY } from "../apis/api";
import { getCurrentUser, loginUser, registerUser } from "../apis/authApi";
import { notifyError } from "../utils/notify";

const AuthContext = createContext(null);

// Backend { token, user } deta hai. Token browser mein rakhte hain, user state mein
const saveSession = (data, setUser) => {
  localStorage.setItem(TOKEN_KEY, data.token);
  setUser(data.user);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // App khulte hi token ki jaanch hoti hai. Tab tak true rehta hai
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  // Page reload par: token ho to /me se user wapas le aao
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;

    let cancelled = false;
    getCurrentUser()
      .then((response) => {
        if (!cancelled) setUser(response.data.user);
      })
      .catch(() => {
        // 401 par api.js token hata chuka hota hai. Server band ho to user login page dekhe ga
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Beech mein token expire ho jaye to logout karo
  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      notifyError("Session expired. Please log in again.");
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, []);

  // Errors yahan nahi pakarte. Page pakre ga aur toast dikhaye ga
  const login = async (credentials) => {
    const response = await loginUser(credentials);
    saveSession(response.data, setUser);
  };

    // Exhibitor ko company profile bhi banana hota hai. Is liye createProfile (optional) function milta hai.
  // Pehle account banta hai, phir profile. Profile fail ho to account phir bhi bana rehta hai,
  // is liye us ka error throw nahi karte, wapas bhej dete hain
  const register = async (details, createProfile) => {
    const response = await registerUser(details);
    // Token pehle save karte hain, taake profile wali request authorized ho
    localStorage.setItem(TOKEN_KEY, response.data.token);

    let profileError = null;
    if (createProfile) {
      try {
        await createProfile();
      } catch (error) {
        profileError = error;
      }
    }

    // User ab set hota hai (is se GuestRoute dashboard par bhej deta hai)
    setUser(response.data.user);
    return { profileError };
  };

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth sirf AuthProvider ke andar use ho sakta hai");
  }
  return context;
};

