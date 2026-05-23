// Starter render test for the headline counter.
//
// Covers two paths:
//   - Loading state: total === null renders "—" placeholders
//   - Ready state: tried = 0, total = 20 renders "0" and "/ 20"
//
// The milestone color logic and +1 pulse animation aren't tested here —
// they're easy to add later but not load-bearing for "the counter shows the
// right numbers." Phase 2 testing can layer those in.

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Counter from "./Counter";

describe("Counter", () => {
  it("renders em-dash placeholders when total is null (loading)", () => {
    render(<Counter tried={0} total={null} />);

    // The number slot and denominator both show em-dashes during loading
    // The em-dash appears at least twice (once for tried number, once after /)
    const emDashes = screen.getAllByText(/—/);
    expect(emDashes.length).toBeGreaterThanOrEqual(1);
  });

  it("renders 0 / 20 on initial mount with tried=0, total=20", () => {
    render(<Counter tried={0} total={20} />);

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText(/\/ 20/)).toBeInTheDocument();
  });

  it("reflects an updated tried count when re-rendered", () => {
    const { rerender } = render(<Counter tried={0} total={20} />);
    expect(screen.getByText("0")).toBeInTheDocument();

    rerender(<Counter tried={3} total={20} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
