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
const WIDTHS = [1280, 1920, 2560];
const FORMATS = ["avif", "webp"] as const;

async function main() {
  const files = await readdir(SRC);

  for (const file of files) {
    if (!/\.(jpe?g|png)$/i.test(file)) continue;

    const base = path.parse(file).name;
    const input = path.join(SRC, file);

    console.log(`Optimizing ${file}...`);

    for (const fmt of FORMATS) {
      // Create responsive variants
      for (const w of WIDTHS) {
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
