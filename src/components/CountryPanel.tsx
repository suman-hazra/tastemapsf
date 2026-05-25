import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Country, Dish, Restaurant } from "../data/types";

interface UnseededCountry {
  displayName: string;
  flag?: string;
}

interface SuggestionCountry {
  name: string;
  flag?: string;
}

interface Props {
  country: Country | UnseededCountry | null;
  onClose: () => void;
  triedSet?: ReadonlySet<string>;
  onSetTried?: (countryId: string, tried: boolean) => void;
}

const TIP_EMAIL = "tastemapsf@gmail.com";

function buildTipEmail(country: SuggestionCountry, restaurantName: string) {
  const countryLabel = [country.flag, country.name].filter(Boolean).join(" ");
  return {
    subject: `Tastemap SF restaurant suggestion for ${country.name}`,
    body: [
      `Country: ${countryLabel}`,
      `Restaurant name/details: ${restaurantName}`,
      "",
      "Sent from Tastemap SF.",
    ].join("\n"),
  };
}

function buildTipMailto(country: SuggestionCountry, restaurantName: string) {
  const email = buildTipEmail(country, restaurantName);
  const params = new URLSearchParams({
    subject: email.subject,
    body: email.body,
  });
  return `mailto:${TIP_EMAIL}?${params.toString()}`;
}

function buildGmailComposeUrl(
  country: SuggestionCountry,
  restaurantName: string,
) {
  const email = buildTipEmail(country, restaurantName);
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: TIP_EMAIL,
    su: email.subject,
    body: email.body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function googleMapsUrl(restaurant: Restaurant): string {
  const query = `${restaurant.name} ${restaurant.neighborhood} San Francisco`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function twemojiFlagUrl(flag?: string) {
  if (!flag) return null;
  const codepoints = [...flag]
    .map((char) => char.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join("-");
  if (!codepoints) return null;
  return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${codepoints}.svg`;
}

export default function CountryPanel({
  country,
  onClose,
  triedSet,
  onSetTried,
}: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const [suggestionCountry, setSuggestionCountry] =
    useState<SuggestionCountry | null>(null);

  useEffect(() => {
    if (!country) return;
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab") return;

      const drawer = drawerRef.current;
      if (!drawer) return;
      const focusable = Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [country, onClose]);

  if (!country) return null;

  const isUnseeded = !("id" in country);
  const displayName = isUnseeded ? country.displayName : country.name;
  const displayFlag = country.flag;
  const flagUrl = twemojiFlagUrl(displayFlag);
  const showMobileTriedControl =
    !isUnseeded &&
    country.restaurants.length > 0 &&
    onSetTried !== undefined;
  const isTried = !isUnseeded && triedSet?.has(country.id) === true;

  return (
    <div className="absolute inset-0 z-30" onMouseDown={onClose}>
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="absolute inset-x-0 bottom-0 flex max-h-[82dvh] flex-col overflow-hidden rounded-t-[20px] border border-black/[0.08] bg-white/[0.88] shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_20px_60px_rgba(124,58,237,0.15)] backdrop-blur-[28px] animate-[drawer-enter_280ms_cubic-bezier(0.22,1,0.36,1)_forwards] md:bottom-4 md:left-auto md:right-4 md:top-4 md:w-[420px] md:max-h-none md:rounded-2xl"
      >
        <div
          aria-hidden="true"
          className="mx-auto mt-2 h-1 w-9 rounded-full bg-[#0f0f12]/15 md:hidden"
        />

        <header className="flex flex-shrink-0 items-start gap-4 px-6 pb-4 pt-6">
          {flagUrl ? (
            <img
              src={flagUrl}
              alt=""
              aria-hidden="true"
              className="block h-12 w-12 flex-shrink-0 rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.08)] md:h-14 md:w-14"
            />
          ) : displayFlag ? (
            <div
              aria-hidden="true"
              className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-white text-4xl shadow-[0_4px_14px_rgba(0,0,0,0.08)] md:h-14 md:w-14"
            >
              {displayFlag}
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b6b76]">
              {isUnseeded ? "Cuisine" : country.continent}
            </div>
            <h2
              id="panel-title"
              className="mt-1 text-[22px] font-bold leading-[1.05] tracking-normal text-[#0f0f12] md:text-[28px]"
            >
              {displayName}
            </h2>
            <div className="mt-2 h-0.5 w-12 rounded-full bg-[linear-gradient(90deg,#7c3aed,#06b6d4)]" />
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg text-[#6b6b76] transition-colors hover:bg-[#0f0f12]/[0.05]"
          >
            <span aria-hidden="true" className="text-[15px] leading-none">
              x
            </span>
          </button>
        </header>

        <div className="mx-6 h-px flex-shrink-0 bg-black/[0.08]" />

        <div
          className={`flex-1 space-y-7 overflow-y-auto px-6 py-5 [-webkit-overflow-scrolling:touch] ${
            showMobileTriedControl ? "pb-28" : ""
          }`}
          tabIndex={0}
        >
          {isUnseeded ? (
            <UnseededBody
              country={{ name: country.displayName, flag: country.flag }}
              onSuggest={setSuggestionCountry}
            />
          ) : (
            <SeededBody country={country} onSuggest={setSuggestionCountry} />
          )}
        </div>

        {showMobileTriedControl && (
          <div className="flex-shrink-0 border-t border-black/[0.08] bg-white/90 px-5 pb-5 pt-3 shadow-[0_-10px_24px_rgba(15,15,18,0.05)] backdrop-blur-[18px] md:hidden">
            <TriedBarControl
              countryName={country.name}
              isTried={isTried}
              onSetTried={(tried) => {
                onSetTried(country.id, tried);
                onClose();
              }}
            />
          </div>
        )}

        {suggestionCountry && (
          <SuggestionDialog
            country={suggestionCountry}
            onClose={() => setSuggestionCountry(null)}
          />
        )}
      </aside>
    </div>
  );
}

function TriedBarControl({
  countryName,
  isTried,
  onSetTried,
}: {
  countryName: string;
  isTried: boolean;
  onSetTried: (tried: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-[#0f0f12]">
          Tried {countryName}?
        </div>
        <div className="text-xs text-[#6b6b76]">
          {isTried ? "Marked as tasted" : "Mark this cuisine"}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onSetTried(false)}
          className="h-11 w-16 rounded-xl border border-black/[0.08] bg-white text-sm font-semibold text-[#0f0f12] transition-all active:scale-[0.98]"
        >
          No
        </button>
        <button
          type="button"
          onClick={() => onSetTried(true)}
          className="h-11 w-16 rounded-xl bg-[linear-gradient(135deg,#7c3aed_0%,#06b6d4_100%)] text-sm font-semibold text-white shadow-[0_8px_20px_rgba(124,58,237,0.24)] transition-all active:scale-[0.98]"
        >
          Yes
        </button>
      </div>
    </div>
  );
}

function SeededBody({
  country,
  onSuggest,
}: {
  country: Country;
  onSuggest: (country: SuggestionCountry) => void;
}) {
  const hasRestaurants = country.restaurants.length > 0;

  return (
    <>
      <p className="text-[13.5px] leading-[1.6] text-[#6b6b76]">
        {country.cuisine_summary}
      </p>

      <section>
        <SectionLabel>Order these first</SectionLabel>
        <ul className="space-y-4">
          {country.signature_dishes.map((dish) => (
            <DishEntry key={dish.name} dish={dish} />
          ))}
        </ul>
      </section>

      <section>
        <SectionLabel>Where to eat in SF</SectionLabel>
        {hasRestaurants ? (
          <ul className="space-y-2">
            {country.restaurants.map((restaurant) => (
              <RestaurantEntry key={restaurant.id} restaurant={restaurant} />
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-black/[0.08] bg-white/50 p-4 text-sm">
            <div className="font-semibold text-[#0f0f12]">
              Sorry, we could not find restaurants for {country.name} in San
              Francisco yet.
            </div>
            <button
              type="button"
              onClick={() =>
                onSuggest({ name: country.name, flag: country.flag })
              }
              className="mt-3 inline-flex h-11 items-center rounded-xl bg-[linear-gradient(135deg,#7c3aed_0%,#06b6d4_100%)] px-4 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(124,58,237,0.25),0_2px_6px_rgba(6,182,212,0.14)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Send me one →
            </button>
          </div>
        )}
      </section>
    </>
  );
}

function UnseededBody({
  country,
  onSuggest,
}: {
  country: SuggestionCountry;
  onSuggest: (country: SuggestionCountry) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-[13.5px] leading-[1.6] text-[#6b6b76]">
        Sorry, we could not find restaurants for {country.name} in San
        Francisco yet.
      </p>
      <button
        type="button"
        onClick={() => onSuggest(country)}
        className="inline-flex h-11 items-center rounded-xl bg-[linear-gradient(135deg,#7c3aed_0%,#06b6d4_100%)] px-4 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(124,58,237,0.25),0_2px_6px_rgba(6,182,212,0.14)] transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        Send me one →
      </button>
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h3 className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#6b6b76]">
      {children}
    </h3>
  );
}

function DishEntry({ dish }: { dish: Dish }) {
  return (
    <li>
      <span className="inline-block rounded-md border border-[#7c3aed]/[0.12] bg-[#7c3aed]/[0.07] px-2.5 py-1 text-[12.5px] font-semibold leading-tight text-[#7c3aed]">
        {dish.name}
      </span>
      <p className="mt-1.5 text-[13px] leading-[1.55] text-[#6b6b76]">
        {dish.description}
      </p>
    </li>
  );
}

function RestaurantEntry({ restaurant }: { restaurant: Restaurant }) {
  return (
    <li>
      <a
        href={googleMapsUrl(restaurant)}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl border border-black/[0.08] bg-white/50 px-4 py-3 transition-all hover:bg-white hover:shadow-[0_4px_14px_rgba(15,15,18,0.04)]"
      >
        <div className="text-[13.5px] font-semibold leading-tight text-[#0f0f12]">
          {restaurant.name}
        </div>
        <div className="mt-0.5 text-xs text-[#6b6b76]">
          {restaurant.neighborhood}
        </div>
        <div className="mt-1.5 inline-flex text-[11.5px] font-medium text-[#7c3aed] hover:opacity-80">
          Open in Google Maps →
        </div>
      </a>
    </li>
  );
}

function SuggestionDialog({
  country,
  onClose,
}: {
  country: SuggestionCountry;
  onClose: () => void;
}) {
  const [restaurantName, setRestaurantName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submitSuggestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = restaurantName.trim();
    if (!trimmedName) return;
    setSubmitted(true);
    const opened = window.open(
      buildGmailComposeUrl(country, trimmedName),
      "_blank",
      "noopener,noreferrer",
    );
    if (!opened) {
      window.location.href = buildTipMailto(country, trimmedName);
    }
  };

  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-black/20 px-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="suggestion-title"
        onSubmit={submitSuggestion}
        className="w-full max-w-sm rounded-2xl border border-black/[0.08] bg-white/[0.92] p-4 shadow-xl backdrop-blur-[28px] sm:p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="suggestion-title"
              className="text-lg font-bold leading-tight text-[#0f0f12] sm:text-xl"
            >
              Send me one
            </h2>
            <p className="mt-1 text-xs text-[#6b6b76] sm:text-sm">
              {[country.flag, country.name].filter(Boolean).join(" ")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close suggestion dialog"
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg text-[#6b6b76] hover:bg-black/5"
          >
            x
          </button>
        </div>

        <label
          className="mt-4 block text-xs font-medium sm:text-sm"
          htmlFor="restaurant-tip"
        >
          Restaurant name/details
        </label>
        <input
          ref={inputRef}
          id="restaurant-tip"
          value={restaurantName}
          onChange={(event) => {
            setRestaurantName(event.target.value);
            setSubmitted(false);
          }}
          required
          className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/30"
        />
        {submitted && (
          <p className="mt-3 text-sm leading-relaxed text-[#6b6b76]">
            Your email draft should open in a new tab. Please hit send there.
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-black/10 px-4 text-sm font-semibold hover:bg-black/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-11 rounded-xl bg-[linear-gradient(135deg,#7c3aed_0%,#06b6d4_100%)] px-4 text-sm font-semibold text-white"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
