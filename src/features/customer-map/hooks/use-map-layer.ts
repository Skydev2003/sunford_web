import { useEffect, useState } from "react";
import type { MapLayer } from "../types";

/** Fetch only the geographic layer being explored; cache it for the open dialog. */
export function useMapLayer(path: string | null) {
  const [layers, setLayers] = useState<Record<string, MapLayer>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [attempt, setAttempt] = useState(0);
  const layer = path ? layers[path] : undefined;

  useEffect(() => {
    if (!path || layer) return;
    const controller = new AbortController();
    fetch(`/maps/thailand/${path}.json`, { signal: controller.signal, cache: "no-cache" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = (await response.json()) as MapLayer;
        if (!Array.isArray(result.areas) || !result.areas.length)
          throw new Error("Invalid map layer");
        if (!controller.signal.aborted) setLayers((current) => ({ ...current, [path]: result }));
      })
      .catch(() => {
        if (!controller.signal.aborted) setErrors((current) => ({ ...current, [path]: true }));
      });
    return () => controller.abort();
  }, [path, layer, attempt]);

  return {
    layer,
    error: path ? errors[path] : false,
    retry: () => {
      if (path) setErrors((current) => ({ ...current, [path]: false }));
      setAttempt((value) => value + 1);
    },
  };
}
