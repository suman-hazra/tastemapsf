// The clickable world map. Renders countries with one of three fills based
// on the user's passport state:
//   tried     →  warm green       (#7CC576)
//   seeded    →  light blue       (#E5F0FF)  has data, not yet tried
//   unseeded  →  neutral grey     (#EEEEEE)  no data — still clickable
//
// Clicking a country fires onSelect(slug | null). The slug is null for
// unseeded countries — we still want clicks to register so Phase D's panel
// can show the "Restaurants coming soon" empty state.
//
// Re-clicking the currently selected country closes the panel — handled by
// the parent via the toggle semantic in App.tsx.

import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { colors } from "../styles/tokens";
import { slugForGeoId } from "../data/countryIdMap";

interface Props {
  topology: object;
  triedSet: ReadonlySet<string>;
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
}

export default function WorldMap({
  topology,
  triedSet,
  selectedSlug,
  onSelect,
}: Props) {
  return (
    <div className="h-full w-full">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 160 }}
        width={980}
        height={500}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup center={[0, 20]} zoom={1} minZoom={1} maxZoom={4}>
          <Geographies geography={topology}>
            {({ geographies }) =>
              geographies.map((geo: { rsmKey: string; id?: string | number; properties: { name: string } }) => {
                const slug = slugForGeoId(geo.id ?? "");
                const isSeeded = slug !== undefined;
                const isTried = isSeeded && triedSet.has(slug);
                const isSelected = isSeeded && slug === selectedSlug;

                const baseFill = isTried
                  ? colors.tried
                  : isSeeded
                    ? colors.seeded
                    : colors.unseeded;

                const hoverFill = isTried
                  ? colors.tried
                  : isSeeded
                    ? colors.seededHover
                    : "#E0E0E0";

                const strokeColor = isSelected ? colors.ink : colors.border;
                const strokeWidth = isSelected ? 1.2 : 0.5;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => onSelect(slug ?? null)}
                    aria-label={geo.properties.name}
                    style={{
                      default: {
                        fill: baseFill,
                        stroke: strokeColor,
                        strokeWidth,
                        outline: "none",
                        cursor: "pointer",
                        transition: "fill 200ms ease-out",
                      },
                      hover: {
                        fill: hoverFill,
                        stroke: strokeColor,
                        strokeWidth,
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: baseFill,
                        stroke: strokeColor,
                        strokeWidth,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
