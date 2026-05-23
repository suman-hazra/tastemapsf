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
//
// Centroids are pre-computed for all seeded countries so the Avatar can
// teleport to a country's center without re-parsing geometry on every click.

import { useEffect, useState } from "react";
import { geoCentroid } from "d3-geo";
import { feature } from "topojson-client";
import type {
  Topology,
  GeometryObject,
  GeometryCollection,
} from "topojson-specification";
import type { Feature, FeatureCollection, Geometry } from "geojson";
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
  /** Returns [lng, lat] centroid for a seeded country slug, undefined otherwise. */
  centroidForSlug: (slug: string) => [number, number] | undefined;
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

// Visual marker anchors. d3.geoCentroid is mathematically correct, but for
// simplified or multi-part country geometries it can land somewhere that
// looks wrong at this map scale.
const MARKER_COORDINATE_OVERRIDES: Record<string, [number, number]> = {
  france: [2.2, 46.2],
};

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

        // Pre-compute centroids for all seeded countries. Avatar uses these
        // for instant placement without re-parsing topology on each click.
        const centroidBySlug = new Map<string, [number, number]>();
        const countriesObject = topology.objects.countries as
          | GeometryCollection
          | GeometryObject
          | undefined;
        if (countriesObject) {
          const fc = feature(topology, countriesObject) as
            | Feature<Geometry>
            | FeatureCollection<Geometry>;
          const features =
            "features" in fc ? fc.features : [fc as Feature<Geometry>];
          for (const f of features) {
            const slug = slugForGeoId(String(f.id ?? ""));
            if (slug) {
              const override = MARKER_COORDINATE_OVERRIDES[slug];
              const [lng, lat] = override ?? geoCentroid(f);
              centroidBySlug.set(slug, [lng, lat]);
            }
          }
        }

        setState({
          status: "ready",
          topology,
          countries,
          countryBySlug,
          countryForGeoId: (geoId) => {
            const slug = slugForGeoId(geoId);
            return slug ? countryBySlug.get(slug) : undefined;
          },
          centroidForSlug: (slug) => centroidBySlug.get(slug),
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
