import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../utils/getErrorMessage";

// Page par data lana: loading, data, error aur dobara koshish (reload) ek jagah.
// request: promise wapas karne wala function, jaise () => getEvents({ status })
// deps: jab yeh badlein to data dobara aata hai, jaise [status]
const useFetch = (request, deps = []) => {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Jaldi jaldi filter badalne par purana jawab naye ko na bigare
    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: "" }));

    request()
      .then((response) => {
        if (!cancelled) setState({ data: response.data, loading: false, error: "" });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error: getErrorMessage(error) });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { ...state, reload };
};

export default useFetch;