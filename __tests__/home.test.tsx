import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "@/app/page";

describe("Home page", () => {
  it("affiche le titre principal", () => {
    render(<Home />);
    expect(screen.getByText("Mon App")).toBeInTheDocument();
  });

  it("affiche la description de la stack", () => {
    render(<Home />);
    const elements = screen.getAllByText("Next.js + Supabase + Vercel");
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });
});
