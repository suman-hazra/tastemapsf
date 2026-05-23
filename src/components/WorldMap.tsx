// Passport-style world map. Michelin / Google Maps aesthetic:
//   • Ocean-blue background, white land, hairline gray borders
//   • Warm hover wash on seeded countries (cursor: pointer)
//   • Red accent stroke on the selected country
//   • Tried countries fill with warm muted clay and get a flag marker
//   • Country labels for seeded countries (DM Sans, gray)
//   • Italic Newsreader ocean / sea labels float over the water
//
// Bounded panning (no globe wrap): the SVG viewBox is sized to the world's
// projected width at scale 170 (~930px), so there's no empty Pacific margin
// inside the map area. ZoomableGroup's translateExtent clamps panning to
// those bounds — the user can't pan into blank ocean past the world's edges.
//
// Zoom/pan: react-simple-maps' ZoomableGroup, controlled by parent state so
// the +/−/RESET widget can drive it. Country strokes use vector-effect to
// stay 1px regardless of zoom.

import { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { map as c } from "../styles/tokens";
import { slugForGeoId } from "../data/countryIdMap";
import Avatar from "./Avatar";
import FlagMarker from "./FlagMarker";
import PanControls from "./PanControls";
import ZoomControls from "./ZoomControls";

interface Props {
  topology: object;
  triedSet: ReadonlySet<string>;
  selectedSlug: string | null;
  selectedCentroid: [number, number] | null;
  /** All seeded country slugs in display order. Used to render labels. */
  seededSlugs: readonly string[];
  /** Resolve a slug to its centroid for pin/label placement. */
  centroidForSlug: (slug: string) => [number, number] | undefined;
  /** Display name lookup for seeded countries. */
  nameForSlug: (slug: string) => string | undefined;
  /** Flag emoji lookup for seeded countries. */
  flagForSlug: (slug: string) => string | undefined;
  /**
   * Called on country click. If the country is in our seed (has a slug),
   * `slug` is set and `unseededName` is null. If the clicked country is not
   * seeded, `slug` is null and `unseededName` is the country's display name
   * (so the panel can show the "No data yet — got a tip?" state).
   */
  onSelect: (slug: string | null, unseededName: string | null) => void;
}

// SVG viewBox sized to the world's projected width at scale 170:
// 2·π·170·0.8707 ≈ 930. With width=930, the world fits the viewBox
// edge-to-edge (no blue Pacific margins inside the map area).
const MAP_WIDTH = 930;
const MAP_HEIGHT = 500;
const MIN_ZOOM = 1;
const MAX_ZOOM = 10;

// Starting view: framed around the countries we actually have SF restaurant
// data for. This keeps the first screen dense instead of opening on a mostly
// oceanic slice of the globe.
const HOME_CENTER: [number, number] = [32, 18];
const HOME_ZOOM = 1.9;

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

// Cursor avatar size. Aspect comes from /public/avatar.svg viewBox (88.5 × 209.45).
const CURSOR_AVATAR_HEIGHT = 56;
const CURSOR_AVATAR_WIDTH = CURSOR_AVATAR_HEIGHT * (88.5 / 209.45);

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

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const handleMouseLeave = () => setCursorPos(null);

  const zoomTo = (factor: number) =>
    setPosition((p) => {
      const zoom = clamp(p.zoom * factor, MIN_ZOOM, MAX_ZOOM);
      return {
        coordinates: clampCenter(p.coordinates[0], p.coordinates[1], zoom),
        zoom,
      };
    });
  const resetZoom = () =>
    setPosition({ coordinates: HOME_CENTER, zoom: HOME_ZOOM });

  // Pan in degrees of lng/lat, scaled inversely by zoom so each button click
  // moves roughly the same fraction of the visible viewport at any zoom level.
  const PAN_STEP_LNG = 60;
  const PAN_STEP_LAT = 30;
  const panBy = (dLng: number, dLat: number) =>
    setPosition((p) => ({
      ...p,
      coordinates: clampCenter(
        p.coordinates[0] + dLng / p.zoom,
        p.coordinates[1] + dLat / p.zoom,
        p.zoom,
      ),
    }));

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
              const isSeeded = slug !== undefined;
              const isTried = isSeeded && triedSet.has(slug);
              const isSelected = isSeeded && slug === selectedSlug;
              const isHovered = isSeeded && slug === hovered;

              // Four fills, in order of "engagement" with the country:
              //   unseeded < seeded < selected < tried
              let fill: string;
              let stroke: string;
              let strokeWidth = 0.9;

              if (!isSeeded) {
                fill = c.unseededLand;
                stroke = c.unseededLine;
              } else if (isTried) {
                fill = c.visited;
                stroke = c.visitedInk;
              } else if (isSelected) {
                fill = c.selectedLand;
                stroke = c.chromeText;
              } else if (isHovered) {
                fill = c.landHover;
                stroke = c.landLine;
              } else {
                fill = c.land;
                stroke = c.landLine;
              }

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() =>
                    onSelect(slug ?? null, slug ? null : geo.properties.name)
                  }
                  onMouseEnter={() => isSeeded && setHovered(slug)}
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
                      cursor: isSeeded ? "pointer" : "inherit",
                      transition: "fill 220ms cubic-bezier(.2,.7,.3,1)",
                    },
                    hover: {
                      fill,
                      stroke,
                      strokeWidth,
                      strokeLinejoin: "round",
                      vectorEffect: "non-scaling-stroke",
                      outline: "none",
                      cursor: isSeeded ? "pointer" : "inherit",
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
                if (slug !== selectedSlug) return null;

                return (
                  <Geography
                    key={`selected-outline-${geo.rsmKey}`}
                    geography={geo}
                    aria-hidden="true"
                    style={{
                      default: {
                        fill: "transparent",
                        stroke: c.chromeText,
                        strokeWidth: 0.9,
                        strokeLinejoin: "round",
                        vectorEffect: "non-scaling-stroke",
                        outline: "none",
                        pointerEvents: "none",
                      },
                      hover: {
                        fill: "transparent",
                        stroke: c.chromeText,
                        strokeWidth: 0.9,
                        strokeLinejoin: "round",
                        vectorEffect: "non-scaling-stroke",
                        outline: "none",
                        pointerEvents: "none",
                      },
                      pressed: {
                        fill: "transparent",
                        stroke: c.chromeText,
                        strokeWidth: 0.9,
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
              fontFamily="var(--font-map-serif)"
              fontStyle="italic"
              fontSize={o.size}
              fontWeight={500}
              letterSpacing="0.14em"
              fill={c.oceanMajor}
              opacity={0.85}
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
                  {line}
                </tspan>
              ))}
            </text>
          </Marker>
        );
      })}

      {/* Country labels appear only on hover to keep neighboring names from
          colliding in dense regions. */}
      {seededSlugs.map((slug) => {
        if (slug !== hovered) return null;
        const coord = centroidForSlug(slug);
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

      {/* Flags on tried countries */}
      {Array.from(triedSet).map((slug) => {
        const coord = centroidForSlug(slug);
        const flag = flagForSlug(slug);
        if (!coord) return null;
        if (!flag) return null;
        return (
          <Marker key={`flag-${slug}`} coordinates={coord}>
            <FlagMarker flag={flag} />
          </Marker>
        );
      })}

      {/* Centroid avatar — only visible when the cursor avatar isn't
          active (mouse off the map). Keeps the "you were here" marker
          on the last-selected country when the panel is open. */}
      {cursorPos === null && selectedCentroid && selectedSlug && (
        <Marker coordinates={selectedCentroid}>
          <Avatar height={CURSOR_AVATAR_HEIGHT / position.zoom} />
        </Marker>
      )}
    </>
  );

  return (
    <div className="relative h-full w-full" style={{ background: c.bg }}>
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
            zIndex: 2,
          }}
        />
      )}

      <PanControls
        onPanUp={() => panBy(0, PAN_STEP_LAT)}
        onPanDown={() => panBy(0, -PAN_STEP_LAT)}
        onPanLeft={() => panBy(-PAN_STEP_LNG, 0)}
        onPanRight={() => panBy(PAN_STEP_LNG, 0)}
      />

      <ZoomControls
        canReset={
          Math.abs(position.zoom - HOME_ZOOM) > 0.05 ||
          Math.abs(position.coordinates[0] - HOME_CENTER[0]) > 0.5 ||
          Math.abs(position.coordinates[1] - HOME_CENTER[1]) > 0.5
        }
        onZoomIn={() => zoomTo(1.5)}
        onZoomOut={() => zoomTo(1 / 1.5)}
        onReset={resetZoom}
      />
    </div>
  );
}
