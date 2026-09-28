import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("CESTOM public home", () => {
  const homePath = resolve(process.cwd(), "client/src/pages/Home.tsx");
  const home = readFileSync(homePath, "utf8");

  it("contains the CESTOM identity and primary sections", () => {
    expect(home).toContain("Une communauté qui avance ensemble.");
    expect(home).toContain("id=\"association\"");
    expect(home).toContain("id=\"activites\"");
    expect(home).toContain("id=\"galerie\"");
    expect(home).toContain("id=\"contact\"");
  });

  it("uses the hosted logo and multiple slideshow images", () => {
    expect(home).toContain("/manus-storage/LogoPNG_521127359406369_4ff019bb.webp");
    expect(home.match(/image:\s+\"\/manus-storage\//g)?.length).toBe(3);
  });
});
