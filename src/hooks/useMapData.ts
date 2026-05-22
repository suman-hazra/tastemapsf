// Single-source data hook for the map: fetches the world TopoJSON, exposes
// the curated country list, and gates rendering on the async fetch (not on
// the synchronous restaurants.ts import — that's available at first render).
//
// Status state machine:
//   loading → ready    (TopoJSON loaded + parsed successfully)
//   loading → error    (network failure or malformed JSON)
//
// On mount in dev mode, runs the countryIdMap integrity check once. Logs to
// console.error if any slug/ISO drift is detected. Skipped in production
// builds entirely (zero runtime cost).

import { useEffect, useState } from "react";
import type { Topology } from "topojson-specification";
import {
  assertCountryIdMapIntegrity,
  slugForGeoId,
} from "../data/countryIdMap";
import { countries } from "../data/restaurants";
import type { Country } from "../data/types";

export type MapDataStatus = "loading" | "ready" | "error";

export interface MapDataReady {
  status: "ready";
  topology: Topology;
  countries: Country[];
  /** Indexed lookup: slug → Country. Built once. */
  countryBySlug: ReadonlyMap<string, Country>;
  /** Resolves a TopoJSON geography.id to a Country (or undefined for unseeded). */
  countryForGeoId: (geoId: string | number) => Country | undefined;
  /** Total number of seeded countries. Used as the counter denominator. */
  total: number;
}

export interface MapDataLoading {
  status: "loading";
}

export interface MapDataError {
  status: "error";
  message: string;
}

export type MapData = MapDataLoading | MapDataReady | MapDataError;

const TOPOJSON_URL = "/countries-110m.json";

export function useMapData(): MapData {
  const [state, setState] = useState<MapData>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    assertCountryIdMapIntegrity();

    (async () => {
      try {
        const response = await fetch(TOPOJSON_URL);
        if (!response.ok) {
          throw new Error(
            `Failed to load map data (HTTP ${response.status}).`,
          );
        }
        const topology = (await response.json()) as Topology;

        if (cancelled) return;

        const countryBySlug = new Map(countries.map((c) => [c.id, c]));

        setState({
          status: "ready",
          topology,
          countries,
          countryBySlug,
          countryForGeoId: (geoId) => {
            const slug = slugForGeoId(geoId);
            return slug ? countryBySlug.get(slug) : undefined;
          },
          total: countries.length,
        });
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error
            ? err.message
            : "Couldn't load map data — check your connection and reload.";
        console.error("[useMapData] load failed:", err);
        setState({ status: "error", message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
