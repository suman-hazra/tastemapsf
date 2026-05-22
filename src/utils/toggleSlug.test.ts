// Starter unit test. State logic only — no React, no DOM.
//
// Covers the App.tsx tried-set update path: clicking "Tried this" toggles
// the country slug in/out of the set. Future Phase 2 tests can layer on
// integration tests through the UI; this gives us a coverage floor that
// runs in <10ms.

import { describe, expect, it } from "vitest";
import { toggleSlug } from "./toggleSlug";

describe("toggleSlug", () => {
  it("adds a slug when absent", () => {
    const result = toggleSlug(new Set<string>(), "france");
    expect(result.has("france")).toBe(true);
    expect(result.size).toBe(1);
  });

  it("removes a slug when present", () => {
    const result = toggleSlug(new Set(["france"]), "france");
    expect(result.has("france")).toBe(false);
    expect(result.size).toBe(0);
  });

  it("toggles two different slugs independently", () => {
    const s1 = toggleSlug(new Set<string>(), "france");
    const s2 = toggleSlug(s1, "japan");
    expect(s2.has("france")).toBe(true);
    expect(s2.has("japan")).toBe(true);
    expect(s2.size).toBe(2);
  });

  it("returns a new Set without mutating the input", () => {
    const input = new Set<string>(["france"]);
    const result = toggleSlug(input, "japan");
    expect(input.has("japan")).toBe(false); // input untouched
    expect(input.size).toBe(1);
    expect(result).not.toBe(input); // reference inequality
  });
});
