import { useState, useEffect } from "react";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string;
}

export function useFetch<T>(
  url?: string,
  options?: RequestInit,
  transform?: (json: any) => T
) : FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!url);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(url, { ...options, signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const value = transform ? transform(json) : json.data ?? json;
        setData(value);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message || "Error al cargar datos");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}