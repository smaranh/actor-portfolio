/**
 * This script generates optimized AVIF and WebP variants of source images.
 * Since this site uses Next.js static export (output: "export"), the runtime image
 * optimization is disabled. Committing these optimized variants ensures the
 * static builds are predictable and correctly optimized.
 */
import sharp from "sharp";
import { readdir } from "node:fs/promises";
import path from "node:path";

const SRC = "public/images";
const FORMATS = ["avif", "webp"] as const;

const VARIANT_RULES: Record<string, number[]> = {
  default: [1280, 1920, 2560],
  "headshot-": [640, 1024, 1280],
  about: [800, 1280, 1920],
};

export function widthsFor(filename: string): number[] {
  for (const [prefix, widths] of Object.entries(VARIANT_RULES)) {
    if (prefix !== "default" && filename.startsWith(prefix)) return widths;
  }
  return VARIANT_RULES.default;
}

async function main() {
  const files = await readdir(SRC);

  for (const file of files) {
    if (!/\.(jpe?g|png)$/i.test(file)) continue;

    const base = path.parse(file).name;
    const input = path.join(SRC, file);

    console.log(`Optimizing ${file}...`);

    for (const fmt of FORMATS) {
      // Create responsive variants
      for (const w of widthsFor(file)) {
        const outputPath = path.join(SRC, `${base}-${w}.${fmt}`);
        await sharp(input)
          .resize({ width: w, withoutEnlargement: true })
          .toFormat(fmt, { quality: fmt === "avif" ? 60 : 80 })
          .toFile(outputPath);
      }

      // Create full-res variant
      const fullResPath = path.join(SRC, `${base}.${fmt}`);
      await sharp(input)
        .toFormat(fmt, { quality: fmt === "avif" ? 60 : 80 })
        .toFile(fullResPath);
    }
  }

  console.log("Image optimization complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
