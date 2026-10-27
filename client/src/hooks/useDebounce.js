import { useEffect, useState } from "react";

// Value badalne ke delay ke baad hi nayi value deta hai. Search box mein har harf par request na jaye
const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export default useDebounce;