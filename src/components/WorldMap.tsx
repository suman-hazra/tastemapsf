// Gradient-pop world map:
//   • Pale ocean background, light gray inactive land, white country borders
//   • Violet/cyan gradient for countries with SF restaurants
//   • Lime/cyan gradient for tried countries
//   • Hover/selected states preserve fill and darken only the outline
//   • Tried countries keep flag markers at higher zoom levels
//   • Uppercase Inter ocean labels float over the water
//
// Bounded panning (no globe wrap): the SVG viewBox is sized to the world's
// projected width at scale 170 (~930px), so there's no empty Pacific margin
// inside the map area. ZoomableGroup's translateExtent clamps panning to
// those bounds — the user can't pan into blank ocean past the world's edges.
//
// Zoom/pan: react-simple-maps' ZoomableGroup handles wheel-zoom and drag-pan
// natively. Country strokes use vector-effect to stay 1px regardless of zoom.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { geoNaturalEarth1 } from "d3-geo";
import { map as c } from "../styles/tokens";
import {
  flagForGeoId,
  slugForGeoId,
  KNOWN_UNMAPPED_SLUGS,
} from "../data/countryIdMap";
import SanFranciscoMarker from "./SanFranciscoMarker";

interface Props {
  topology: object;
  triedSet: ReadonlySet<string>;
  selectedSlug: string | null;
  selectedCentroid: [number, number] | null;
  /** Country slugs with SF restaurants. Used for color/count/tried state. */
  seededSlugs: readonly string[];
  /** Country slugs with cuisine/dish data. Used for hover/click panels. */
  knownSlugs: readonly string[];
  /** Resolve a slug to its centroid for pin/label placement. */
  centroidForSlug: (slug: string) => [number, number] | undefined;
  /** Display name lookup for known countries. */
  nameForSlug: (slug: string) => string | undefined;
  /** Flag emoji lookup for known countries. */
  flagForSlug: (slug: string) => string | undefined;
  /**
   * Called on country click. If the country has cuisine/dish data, `slug` is
   * set and unseeded fields are null. Otherwise, `slug` is null and unseeded
   * fields describe the country for the empty panel state.
   */
  onSelect: (
    slug: string | null,
    unseededName: string | null,
    unseededFlag: string | null,
  ) => void;
}

// SVG viewBox sized to the world's projected width at scale 170:
// 2·π·170·0.8707 ≈ 930. With width=930, the world fits the viewBox
// edge-to-edge (no blue Pacific margins inside the map area).
const MAP_WIDTH = 930;
const MAP_HEIGHT = 500;
const MIN_ZOOM = 1;
const MAX_ZOOM = 10;

// Starting view: framed wide enough to include SF on the left and the
// seeded countries in Europe/Asia, so the "home city" marker is visible
// on first load alongside the destinations.
const HOME_CENTER: [number, number] = [0, 22];
const HOME_ZOOM = 1.15;

// Geographic bounds for the visible viewport. As the user pans, we clamp the
// center so the viewport's edges never wander far past these limits — that's
// where the land actually is. Past them you'd just see empty ocean / sky.
const PAN_BOUNDS = {
  lngWest: -125,
  lngEast: 150,
  latNorth: 66,
  latSouth: -45,
} as const;

// Approximate visible half-extents at zoom 1 (degrees). The viewport at
// zoom k sees half this much, so we compute clamp limits as
//   center ∈ [bound_low + half/k, bound_high - half/k]
// When bounds collapse (viewport wider than bounds) we just center the world.
const HALF_LNG_AT_Z1 = 180;
const HALF_LAT_AT_Z1 = 75;
const SELECTED_ZOOM = 3.2;
const FLAG_MARKER_MIN_ZOOM = 2.4;
const FLAG_MARKER_SIZE = 24;
const FLAG_MARKER_GAP = 4;

// Cursor avatar size. Aspect comes from /public/avatar.svg viewBox (88.5 × 209.45).
const CURSOR_AVATAR_HEIGHT = 56;
const CURSOR_AVATAR_WIDTH = CURSOR_AVATAR_HEIGHT * (88.5 / 209.45);

const COUNTRY_LABEL_COORDINATE_OVERRIDES: Record<string, [number, number]> = {
  usa: [-97, 39],
};

const UNMAPPED_PIN_OFFSETS: Record<string, [number, number]> = {
  antigua_and_barbuda: [-18, -10],
  barbados: [25, 8],
  dominica: [28, -18],
  grenada: [40, -28],
  saint_lucia: [8, -6],
};

const OCEAN_LABELS: Array<{
  name: string;
  coordinates: [number, number];
  size: number;
  kind: "ocean";
  lines?: string[];
}> = [
  {
    name: "Pacific Ocean",
    coordinates: [-155, 5],
    size: 17,
    kind: "ocean",
    lines: ["Pacific", "Ocean"],
  },
  {
    name: "Pacific Ocean",
    coordinates: [172, -4],
    size: 17,
    kind: "ocean",
    lines: ["Pacific", "Ocean"],
  },
  {
    name: "Atlantic Ocean",
    coordinates: [-34, 17],
    size: 16,
    kind: "ocean",
    lines: ["Atlantic", "Ocean"],
  },
  {
    name: "Atlantic Ocean",
    coordinates: [-18, -28],
    size: 16,
    kind: "ocean",
    lines: ["Atlantic", "Ocean"],
  },
  {
    name: "Indian Ocean",
    coordinates: [76, -22],
    size: 16,
    kind: "ocean",
    lines: ["Indian", "Ocean"],
  },
  {
    name: "Arctic Ocean",
    coordinates: [-28, 76],
    size: 13,
    kind: "ocean",
    lines: ["Arctic", "Ocean"],
  },
  {
    name: "Southern Ocean",
    coordinates: [-18, -61],
    size: 13,
    kind: "ocean",
    lines: ["Southern", "Ocean"],
  },
];

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

// Mirrors react-simple-maps' projection setup (geoNaturalEarth1 at scale 170,
// translated to MAP_WIDTH/2, MAP_HEIGHT/2). Used to position the HTML-img
// centroid avatar in container CSS pixels.
const BASE_PROJECTION = geoNaturalEarth1()
  .scale(170)
  .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]);

// Project a lng/lat to container CSS pixels, accounting for ZoomableGroup's
// current transform and the SVG's xMidYMid meet scaling inside the container.
function projectCentroidToContainer(
  centroid: [number, number],
  center: [number, number],
  zoom: number,
  container: { width: number; height: number },
): { x: number; y: number } | null {
  const base = BASE_PROJECTION(centroid);
  const baseCenter = BASE_PROJECTION(center);
  if (!base || !baseCenter) return null;
  const svgX = MAP_WIDTH / 2 + (base[0] - baseCenter[0]) * zoom;
  const svgY = MAP_HEIGHT / 2 + (base[1] - baseCenter[1]) * zoom;
  const scale = Math.min(
    container.width / MAP_WIDTH,
    container.height / MAP_HEIGHT,
  );
  const offsetX = (container.width - MAP_WIDTH * scale) / 2;
  const offsetY = (container.height - MAP_HEIGHT * scale) / 2;
  return { x: offsetX + svgX * scale, y: offsetY + svgY * scale };
}

function boxesOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) {
  return !(
    a.x + a.width + FLAG_MARKER_GAP < b.x ||
    b.x + b.width + FLAG_MARKER_GAP < a.x ||
    a.y + a.height + FLAG_MARKER_GAP < b.y ||
    b.y + b.height + FLAG_MARKER_GAP < a.y
  );
}

function flagOffsetCandidates(): Array<{ x: number; y: number }> {
  const candidates = [{ x: 0, y: 0 }];
  for (const radius of [18, 32, 46, 60]) {
    candidates.push(
      { x: 0, y: -radius },
      { x: radius, y: 0 },
      { x: 0, y: radius },
      { x: -radius, y: 0 },
      { x: radius, y: -radius },
      { x: radius, y: radius },
      { x: -radius, y: radius },
      { x: -radius, y: -radius },
    );
  }
  return candidates;
}

function placeFlagMarkers(
  markers: Array<{
    slug: string;
    flag: string;
    anchor: { x: number; y: number };
  }>,
  container: { width: number; height: number },
) {
  const candidates = flagOffsetCandidates();
  const occupied: Array<{ x: number; y: number; width: number; height: number }> =
    [];

  return markers
    .sort((a, b) => a.anchor.y - b.anchor.y || a.anchor.x - b.anchor.x)
    .map((marker) => {
      let chosen = candidates[candidates.length - 1];

      for (const candidate of candidates) {
        const box = {
          x: marker.anchor.x + candidate.x - FLAG_MARKER_SIZE / 2,
          y: marker.anchor.y + candidate.y - FLAG_MARKER_SIZE / 2,
          width: FLAG_MARKER_SIZE,
          height: FLAG_MARKER_SIZE,
        };
        const fitsContainer =
          box.x >= 0 &&
          box.y >= 0 &&
          box.x + box.width <= container.width &&
          box.y + box.height <= container.height;
        if (fitsContainer && !occupied.some((box2) => boxesOverlap(box, box2))) {
          chosen = candidate;
          occupied.push(box);
          break;
        }
      }

      return {
        ...marker,
        x: marker.anchor.x + chosen.x,
        y: marker.anchor.y + chosen.y,
        offsetX: chosen.x,
        offsetY: chosen.y,
      };
    });
}

// Clamp the pan center so the viewport's edges stay within PAN_BOUNDS.
// (translateExtent on ZoomableGroup is unreliable here — d3-zoom mixes
// viewBox units with the SVG's CSS pixel size, so we enforce the limits
// against the controlled center instead.)
function clampCenter(
  lng: number,
  lat: number,
  zoom: number,
): [number, number] {
  const halfLng = HALF_LNG_AT_Z1 / zoom;
  const halfLat = HALF_LAT_AT_Z1 / zoom;
  const lngMin = PAN_BOUNDS.lngWest + halfLng;
  const lngMax = PAN_BOUNDS.lngEast - halfLng;
  const latMin = PAN_BOUNDS.latSouth + halfLat;
  const latMax = PAN_BOUNDS.latNorth - halfLat;
  const lngFallback = (PAN_BOUNDS.lngWest + PAN_BOUNDS.lngEast) / 2;
  const latFallback = (PAN_BOUNDS.latSouth + PAN_BOUNDS.latNorth) / 2;
  return [
    lngMin > lngMax ? lngFallback : clamp(lng, lngMin, lngMax),
    latMin > latMax ? latFallback : clamp(lat, latMin, latMax),
  ];
}

export default function WorldMap({
  topology,
  triedSet,
  selectedSlug,
  selectedCentroid,
  seededSlugs,
  knownSlugs,
  centroidForSlug,
  nameForSlug,
  flagForSlug,
  onSelect,
}: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [position, setPosition] = useState<{
    coordinates: [number, number];
    zoom: number;
  }>({ coordinates: HOME_CENTER, zoom: HOME_ZOOM });
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const seededSlugSet = useMemo(() => new Set(seededSlugs), [seededSlugs]);
  const knownSlugSet = useMemo(() => new Set(knownSlugs), [knownSlugs]);

  // Track container size so we can project lat/lng to CSS pixels (for the
  // HTML-img centroid avatar — keeps it the same size as the cursor avatar
  // regardless of map zoom).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () =>
      setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!selectedCentroid || !selectedSlug) return;

    setPosition((p) => {
      const zoom = Math.max(p.zoom, SELECTED_ZOOM);
      return {
        coordinates: clampCenter(
          selectedCentroid[0],
          selectedCentroid[1],
          zoom,
        ),
        zoom,
      };
    });
  }, [selectedCentroid, selectedSlug]);

  // Wheel-zoom handler attached non-passively so we can preventDefault on
  // ctrl+wheel (Mac trackpad pinch). Without this the browser does an OS
  // pinch-zoom that pushes fixed overlays off the visual viewport. Plain
  // wheel scroll over the map also zooms.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.005);
      setPosition((p) => {
        const zoom = clamp(p.zoom * factor, MIN_ZOOM, MAX_ZOOM);
        return {
          coordinates: clampCenter(p.coordinates[0], p.coordinates[1], zoom),
          zoom,
        };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const handleMouseLeave = () => setCursorPos(null);

  const flagMarkers = useMemo(() => {
    if (!containerSize || position.zoom < FLAG_MARKER_MIN_ZOOM) return [];

    const markers = Array.from(triedSet).flatMap((slug) => {
      if (!seededSlugSet.has(slug)) return [];
      // Unmapped microstates carry their tried state on the pin itself
      // (it recolors), so skip the HTML flag overlay to avoid stacking a
      // 24px flag on top of the pin.
      if (KNOWN_UNMAPPED_SLUGS.has(slug)) return [];
      const coord = centroidForSlug(slug);
      const flag = flagForSlug(slug);
      if (!coord || !flag) return [];
      const anchor = projectCentroidToContainer(
        coord,
        position.coordinates,
        position.zoom,
        containerSize,
      );
      if (!anchor) return [];
      return [{ slug, flag, anchor }];
    });

    return placeFlagMarkers(markers, containerSize);
  }, [
    centroidForSlug,
    containerSize,
    flagForSlug,
    position.coordinates,
    position.zoom,
    seededSlugSet,
    triedSet,
  ]);

  // One copy of the map's contents: country shapes, ocean labels, country
  // labels, pins, centroid avatar. Called three times (once per wrap copy).
  const renderWorldContent = () => (
    <>
      <Geographies geography={topology}>
        {({ geographies }) =>
          geographies.map(
            (geo: {
              rsmKey: string;
              id?: string | number;
              properties: { name: string };
            }) => {
              const slug = slugForGeoId(geo.id ?? "");
              const isKnown = slug !== undefined && knownSlugSet.has(slug);
              const hasRestaurants =
                slug !== undefined && seededSlugSet.has(slug);
              const isTried = hasRestaurants && triedSet.has(slug);
              const isSelected = isKnown && slug === selectedSlug;
              const isHovered = isKnown && slug === hovered;

              // Fill carries the semantic state. Hover/selection only changes
              // the outline so color meaning stays stable.
              let fill: string;
              const isEmphasized = isSelected || isHovered;
              const stroke = isEmphasized ? c.chromeText : c.landLine;
              const strokeWidth = isEmphasized ? 1.2 : 0.6;

              if (!hasRestaurants) {
                fill = c.unseededLand;
              } else if (isTried) {
                fill = c.visited;
              } else {
                fill = c.land;
              }

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => {
                    const geoId = geo.id ?? "";
                    onSelect(
                      isKnown ? slug : null,
                      isKnown ? null : geo.properties.name,
                      isKnown ? null : (flagForGeoId(geoId) ?? null),
                    );
                  }}
                  onMouseEnter={() => isKnown && setHovered(slug)}
                  onMouseLeave={() => setHovered(null)}
                  aria-label={geo.properties.name}
                  style={{
                    default: {
                      fill,
                      stroke,
                      strokeWidth,
                      strokeLinejoin: "round",
                      vectorEffect: "non-scaling-stroke",
                      outline: "none",
                      cursor: isKnown ? "pointer" : "inherit",
                      transition: "fill 220ms cubic-bezier(.2,.7,.3,1)",
                    },
                    hover: {
                      fill,
                      stroke,
                      strokeWidth,
                      strokeLinejoin: "round",
                      vectorEffect: "non-scaling-stroke",
                      outline: "none",
                      cursor: isKnown ? "pointer" : "inherit",
                    },
                    pressed: {
                      fill,
                      stroke,
                      strokeWidth,
                      strokeLinejoin: "round",
                      vectorEffect: "non-scaling-stroke",
                      outline: "none",
                    },
                  }}
                />
              );
            },
          )
        }
      </Geographies>

      {/* Draw tried country outlines above neighboring borders. Otherwise
          shared borders can be partially overwritten by later countries in the
          TopoJSON render order. */}
      <Geographies geography={topology}>
        {({ geographies }) =>
          geographies.map(
            (geo: {
              rsmKey: string;
              id?: string | number;
              properties: { name: string };
            }) => {
              const slug = slugForGeoId(geo.id ?? "");
              if (!slug || !seededSlugSet.has(slug) || !triedSet.has(slug)) {
                return null;
              }

              return (
                <Geography
                  key={`tried-outline-${geo.rsmKey}`}
                  geography={geo}
                  aria-hidden="true"
                  style={{
                    default: {
                      fill: "transparent",
                      stroke: c.visitedInk,
                      strokeWidth: 0.6,
                      strokeLinejoin: "round",
                      vectorEffect: "non-scaling-stroke",
                      outline: "none",
                      pointerEvents: "none",
                    },
                    hover: {
                      fill: "transparent",
                      stroke: c.visitedInk,
                      strokeWidth: 0.6,
                      strokeLinejoin: "round",
                      vectorEffect: "non-scaling-stroke",
                      outline: "none",
                      pointerEvents: "none",
                    },
                    pressed: {
                      fill: "transparent",
                      stroke: c.visitedInk,
                      strokeWidth: 0.6,
                      strokeLinejoin: "round",
                      vectorEffect: "non-scaling-stroke",
                      outline: "none",
                      pointerEvents: "none",
                    },
                  }}
                />
              );
            },
          )
        }
      </Geographies>

      {/* Draw the selected country's full outline last. Shared land borders can
          otherwise be visually overwritten by neighboring country strokes. */}
      {selectedSlug && (
        <Geographies geography={topology}>
          {({ geographies }) =>
            geographies.map(
              (geo: {
                rsmKey: string;
                id?: string | number;
                properties: { name: string };
              }) => {
                const slug = slugForGeoId(geo.id ?? "");
                if (
                  slug !== selectedSlug ||
                  !slug ||
                  !knownSlugSet.has(slug)
                ) {
                  return null;
                }

                return (
                  <Geography
                    key={`selected-outline-${geo.rsmKey}`}
                    geography={geo}
                    aria-hidden="true"
                    style={{
                      default: {
                        fill: "transparent",
                        stroke: c.chromeText,
                        strokeWidth: 1.2,
                        strokeLinejoin: "round",
                        vectorEffect: "non-scaling-stroke",
                        outline: "none",
                        pointerEvents: "none",
                      },
                      hover: {
                        fill: "transparent",
                        stroke: c.chromeText,
                        strokeWidth: 1.2,
                        strokeLinejoin: "round",
                        vectorEffect: "non-scaling-stroke",
                        outline: "none",
                        pointerEvents: "none",
                      },
                      pressed: {
                        fill: "transparent",
                        stroke: c.chromeText,
                        strokeWidth: 1.2,
                        strokeLinejoin: "round",
                        vectorEffect: "non-scaling-stroke",
                        outline: "none",
                        pointerEvents: "none",
                      },
                    }}
                  />
                );
              },
            )
          }
        </Geographies>
      )}

      {/* Major ocean labels only. Smaller sea labels tend to collide with
          nearby land at this zoom level, so we omit them. */}
      {OCEAN_LABELS.map((o, i) => {
        return (
          <Marker
            key={`ocean-${i}`}
            coordinates={o.coordinates}
            style={{ default: { pointerEvents: "none" } }}
          >
            <text
              textAnchor="middle"
              fontFamily="var(--font-body)"
              fontSize={Math.max(8, o.size - 7)}
              fontWeight={600}
              letterSpacing="0.18em"
              fill={c.oceanMajor}
              opacity={0.9}
            >
              {(o.lines ?? [o.name]).map((line, lineIndex, lines) => (
                <tspan
                  key={line}
                  x={0}
                  dy={
                    lineIndex === 0
                      ? lines.length > 1
                        ? `${-(lines.length - 1) * 0.55}em`
                        : 0
                      : "1.1em"
                  }
                >
                  {line.toUpperCase()}
                </tspan>
              ))}
            </text>
          </Marker>
        );
      })}

      {/* Country labels appear only on hover to keep neighboring names from
          colliding in dense regions. */}
      {knownSlugs.map((slug) => {
        if (slug !== hovered) return null;
        // Unmapped microstates draw their own label above their pin.
        if (KNOWN_UNMAPPED_SLUGS.has(slug)) return null;
        const coord =
          COUNTRY_LABEL_COORDINATE_OVERRIDES[slug] ?? centroidForSlug(slug);
        if (!coord) return null;
        const name = nameForSlug(slug);
        if (!name) return null;
        return (
          <Marker
            key={`lbl-${slug}`}
            coordinates={coord}
            style={{ default: { pointerEvents: "none" } }}
          >
            <text
              y={3}
              textAnchor="middle"
              fontFamily="var(--font-map-sans)"
              fontSize={12}
              fontWeight={600}
              fill={c.labelHover}
              style={{ transition: "fill 160ms, font-weight 160ms" }}
            >
              {name}
            </text>
          </Marker>
        );
      })}

      {/* Destination pins for microstates the 110m TopoJSON omits (Singapore,
          Malta, Maldives, …). They have no polygon to click, so a fixed pin
          stands in — tip anchored at the country's coordinates, recolored by
          seeded/tried state, with its name shown on hover or selection. */}
      {knownSlugs.map((slug) => {
        if (!KNOWN_UNMAPPED_SLUGS.has(slug)) return null;
        const coord = centroidForSlug(slug);
        if (!coord) return null;

        const hasRestaurants = seededSlugSet.has(slug);
        const isTried = hasRestaurants && triedSet.has(slug);
        const isSelected = slug === selectedSlug;
        const isHovered = slug === hovered;
        const emphasized = isSelected || isHovered;
        const [offsetX, offsetY] = UNMAPPED_PIN_OFFSETS[slug] ?? [0, 0];
        const hasOffset = offsetX !== 0 || offsetY !== 0;
        const fill = isTried
          ? "url(#visitedCountryGrad)"
          : hasRestaurants
            ? "url(#activeCountryGrad)"
            : c.unseededLand;
        const name = nameForSlug(slug);

        return (
          <Marker
            key={`pin-${slug}`}
            coordinates={coord}
            onClick={() => onSelect(slug, null, null)}
            onMouseEnter={() => setHovered(slug)}
            onMouseLeave={() => setHovered(null)}
            style={{
              default: { cursor: "pointer" },
              hover: { cursor: "pointer" },
              pressed: { cursor: "pointer" },
            }}
          >
            {hasOffset && (
              <line
                x1={0}
                y1={0}
                x2={offsetX}
                y2={offsetY}
                stroke={c.oceanMajor}
                strokeOpacity={1}
                strokeWidth={1.3}
                strokeDasharray="0.1 3.2"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                style={{ pointerEvents: "none" }}
              />
            )}
            <g transform={`translate(${offsetX} ${offsetY})`}>
              {/* Enlarged transparent hit target so the tiny pin stays easy
                  to click. */}
              <circle cx={0} cy={-6} r={11} fill="transparent" />
              <g
                transform={emphasized ? "scale(0.57)" : "scale(0.5)"}
                style={{
                  transition: "transform 140ms cubic-bezier(.2,.7,.3,1)",
                }}
              >
                <path
                  d="M 0 0 C -4 -7 -7.5 -10 -7.5 -15 A 7.5 7.5 0 1 1 7.5 -15 C 7.5 -10 4 -7 0 0 Z"
                  fill={fill}
                  stroke="#ffffff"
                  strokeWidth={emphasized ? 2 : 1.5}
                  filter="url(#pinShadow)"
                />
                <circle cx={0} cy={-15} r={3} fill="#ffffff" opacity={0.95} />
              </g>
            </g>
            {(isHovered || isSelected) && name && (
              <text
                x={offsetX}
                y={offsetY - 15}
                textAnchor="middle"
                fontFamily="var(--font-map-sans)"
                fontSize={12}
                fontWeight={600}
                fill={c.labelHover}
                style={{
                  pointerEvents: "none",
                  textShadow:
                    "0 1px 3px rgba(255,255,255,0.9), 0 0 8px rgba(255,255,255,0.7)",
                }}
              >
                {name}
              </text>
            )}
          </Marker>
        );
      })}

      {/* San Francisco — the app's home city. */}
      <Marker coordinates={[-122.4194, 37.7749]}>
        <SanFranciscoMarker />
      </Marker>
    </>
  );

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      style={{ background: c.bg }}
    >
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 170 }}
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          cursor: "none",
        }}
      >
        <defs>
          <linearGradient id="activeCountryGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="visitedCountryGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="sfMarkerGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <filter
            id="pinShadow"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation="1.2"
              floodColor="#000"
              floodOpacity="0.28"
            />
          </filter>
          <filter id="sfGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ocean background — sits outside the zoom group so it always fills */}
        <rect
          x={0}
          y={0}
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          fill={c.bg}
        />

        <ZoomableGroup
          center={position.coordinates}
          zoom={position.zoom}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          translateExtent={[
            [0, 0],
            [MAP_WIDTH, MAP_HEIGHT],
          ]}
          onMoveEnd={(pos) =>
            setPosition({
              coordinates: clampCenter(
                pos.coordinates[0],
                pos.coordinates[1],
                pos.zoom,
              ),
              zoom: pos.zoom,
            })
          }
        >
          {renderWorldContent()}
        </ZoomableGroup>
      </ComposableMap>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 35%, transparent 50%, rgba(255,255,255,0.25) 100%)",
          zIndex: 1,
        }}
      />

      {flagMarkers.length > 0 && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: 2 }}
        >
          {flagMarkers.map((marker) => {
            if (marker.offsetX === 0 && marker.offsetY === 0) return null;
            return (
              <line
                key={`flag-line-${marker.slug}`}
                x1={marker.anchor.x}
                y1={marker.anchor.y}
                x2={marker.x}
                y2={marker.y}
                stroke={c.visitedInk}
                strokeWidth={1}
                strokeLinecap="round"
                opacity={0.45}
              />
            );
          })}
        </svg>
      )}

      {flagMarkers.map((marker) => (
        <span
          key={`flag-${marker.slug}`}
          aria-hidden="true"
          className="pointer-events-none absolute grid place-items-center rounded-full bg-white/85 shadow-sm ring-1 ring-black/10"
          style={{
            left: marker.x - FLAG_MARKER_SIZE / 2,
            top: marker.y - FLAG_MARKER_SIZE / 2,
            width: FLAG_MARKER_SIZE,
            height: FLAG_MARKER_SIZE,
            fontFamily:
              "Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif",
            fontSize: 16,
            lineHeight: 1,
            zIndex: 3,
          }}
        >
          {marker.flag}
        </span>
      ))}

      {/* Cursor avatar — the traveler IS the pointer on the map. Feet land
          at the cursor; pointer-events disabled so it never blocks clicks. */}
      {cursorPos && (
        <img
          src="/avatar.svg"
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            position: "absolute",
            left: cursorPos.x - CURSOR_AVATAR_WIDTH / 2,
            top: cursorPos.y - CURSOR_AVATAR_HEIGHT,
            width: CURSOR_AVATAR_WIDTH,
            height: CURSOR_AVATAR_HEIGHT,
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 4,
          }}
        />
      )}

      {/* Centroid avatar — "you were here" marker on the selected country
          when the cursor isn't on the map. Rendered as an HTML img (not an
          SVG element) so its CSS-pixel size matches the cursor avatar
          exactly, regardless of zoom or viewport size. */}
      {cursorPos === null &&
        selectedCentroid &&
        selectedSlug &&
        containerSize &&
        (() => {
          const pt = projectCentroidToContainer(
            selectedCentroid,
            position.coordinates,
            position.zoom,
            containerSize,
          );
          if (!pt) return null;
          return (
            <img
              src="/avatar.svg"
              alt=""
              aria-hidden="true"
              draggable={false}
              style={{
                position: "absolute",
                left: pt.x - CURSOR_AVATAR_WIDTH / 2,
                top: pt.y - CURSOR_AVATAR_HEIGHT,
                width: CURSOR_AVATAR_WIDTH,
                height: CURSOR_AVATAR_HEIGHT,
                pointerEvents: "none",
                userSelect: "none",
                zIndex: 4,
              }}
            />
          );
        })()}
    </div>
  );
}
