import { useEffect, useMemo, useRef, useState } from "react";
import type { MapArea, MapLayer, MapView } from "../types";

export type DetailLevel = "province" | "district" | "subdistrict";
const EMPTY_AREAS: MapArea[] = [];

/** Change geography with magnification while preserving the camera and cursor anchor. */
export function useVisibleLayers(
  provinces: MapArea[],
  view: MapView,
  viewport: { width: number; height: number },
  subdistrictParentId?: string,
) {
  const level: DetailLevel =
    view.k < 3.5 ? "province" : subdistrictParentId ? "subdistrict" : "district";
  const [layers, setLayers] = useState<Record<string, MapLayer>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [attempt, setAttempt] = useState(0);
  const pending = useRef(new Map<string, AbortController>());
  const cache = useRef(new Map<string, MapLayer>());
  const failures = useRef(new Set<string>());

  const bounds = {
    x0: (400 - viewport.width / 2 - view.x) / view.k,
    y0: (400 - viewport.height / 2 - view.y) / view.k,
    x1: (400 + viewport.width / 2 - view.x) / view.k,
    y1: (400 + viewport.height / 2 - view.y) / view.k,
  };
  const visible = provinces.filter(
    (area) =>
      area.bounds[0] <= bounds.x1 &&
      area.bounds[2] >= bounds.x0 &&
      area.bounds[1] <= bounds.y1 &&
      area.bounds[3] >= bounds.y0,
  );
  const provinceKey = visible
    .map((area) => area.id)
    .sort()
    .join(",");
  const paths = useMemo(
    () =>
      level === "province"
        ? []
        : provinceKey
            .split(",")
            .filter(Boolean)
            .flatMap((id) =>
              level === "subdistrict" && id === subdistrictParentId?.slice(0, 2)
                ? [`districts/${id}`, `subdistricts/${id}`]
                : [`districts/${id}`],
            ),
    [level, provinceKey, subdistrictParentId],
  );
  const pathKey = paths.join("|");

  useEffect(() => {
    // Briefly coalesce a fast wheel/pinch gesture, without delaying the camera.
    const timer = setTimeout(() => {
      for (const path of pathKey.split("|").filter(Boolean)) {
        if (cache.current.has(path) || pending.current.has(path) || failures.current.has(path))
          continue;
        const controller = new AbortController();
        pending.current.set(path, controller);
        fetch(`/maps/thailand/${path}.json`, { signal: controller.signal, cache: "no-cache" })
          .then(async (response) => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const layer = (await response.json()) as MapLayer;
            if (!Array.isArray(layer.areas) || layer.parentId !== path.split("/")[1])
              throw new Error("Invalid geographic layer");
            if (controller.signal.aborted) return;
            cache.current.set(path, layer);
            setLayers((current) => ({ ...current, [path]: layer }));
          })
          .catch(() => {
            if (!controller.signal.aborted) {
              failures.current.add(path);
              setErrors((current) => ({ ...current, [path]: true }));
            }
          })
          .finally(() => pending.current.delete(path));
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [pathKey, attempt]);

  useEffect(() => {
    const controllers = pending.current;
    return () => {
      controllers.forEach((controller) => controller.abort());
      controllers.clear();
    };
  }, []);

  const districtAreas = paths
    .filter((path) => path.startsWith("districts/"))
    .flatMap((path) => layers[path]?.areas ?? EMPTY_AREAS);
  const detailAreas =
    level === "province"
      ? provinces
      : level === "district"
        ? districtAreas
        : paths
            .filter((path) => path.startsWith("subdistricts/"))
            .flatMap((path) => layers[path]?.areas ?? EMPTY_AREAS)
            .filter((area) => area.parentId === subdistrictParentId);
  return {
    level,
    areas: detailAreas,
    districts: districtAreas,
    loading: paths.some((path) => !layers[path] && !errors[path]),
    error: paths.some((path) => errors[path]),
    retry: () => {
      for (const path of paths) failures.current.delete(path);
      setErrors((current) => {
        const next = { ...current };
        for (const path of paths) delete next[path];
        return next;
      });
      setAttempt((value) => value + 1);
    },
  };
}
