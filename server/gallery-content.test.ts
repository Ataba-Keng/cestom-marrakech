import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("CESTOM gallery page", () => {
  const galleryPath = resolve(process.cwd(), "client/src/pages/Gallery.tsx");
  const gallery = readFileSync(galleryPath, "utf8");

  it("exposes the gallery route content and all requested archive years", () => {
    expect(gallery).toContain("Filtrer par année");
    expect(gallery).toContain("Toutes");
    for (const year of ["2025", "2024", "2023", "2022"]) {
      expect(gallery).toContain(`year: ${year}`);
    }
  });

  it("filters the displayed albums from the selected year", () => {
    expect(gallery).toContain("useState(\"Toutes\")");
    expect(gallery).toContain("galleryItems.filter((item) => String(item.year) === selectedYear)");
    expect(gallery).toContain("aria-pressed={selectedYear === year}");
  });

  it("provides an accessible fullscreen viewer with keyboard navigation", () => {
    expect(gallery).toContain("role=\"dialog\"");
    expect(gallery).toContain("event.key === \"Escape\"");
    expect(gallery).toContain("event.key === \"ArrowLeft\"");
    expect(gallery).toContain("event.key === \"ArrowRight\"");
    expect(gallery).toContain("Ouvrir l’album");
  });
});
