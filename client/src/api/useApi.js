import { useCallback, useEffect, useState } from "react";

/**
 * Runs a memoized loader and tracks loading/error/data. Call sites must wrap
 * the loader in useCallback so a new identity means a real dependency change.
 */
export function useApi(loader) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setState((previous) => ({ ...previous, loading: true, error: null }));
    loader()
      .then((data) => {
        if (active) setState({ data, error: null, loading: false });
      })
      .catch((error) => {
        if (active) setState({ data: null, error, loading: false });
      });
    return () => {
      active = false;
    };
  }, [loader, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  return { ...state, reload };
}
