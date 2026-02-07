import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";

const input = "public/avatar.png";

// Generate different sizes
const sizes = [
	{ size: 16, output: "public/favicon-16x16.png" },
	{ size: 32, output: "public/favicon-32x32.png" },
	{ size: 48, output: "public/favicon-48x48.png" },
	{ size: 180, output: "public/apple-touch-icon.png" },
	{ size: 512, output: "public/icon-512.png" },
];

for (const { size, output } of sizes) {
	await sharp(input)
		.resize(size, size, { kernel: "nearest" }) // nearest neighbor for pixel art
		.png()
		.toFile(output);
	console.log(`✓ Generated ${output}`);
}

// Create a basic .ico file from 16, 32, 48 sizes
// Note: proper .ico generation requires a library, but we can just use the 32x32 PNG
// Modern browsers support PNG favicons anyway
const favicon32 = readFileSync("public/favicon-32x32.png");
writeFileSync("public/favicon.ico", favicon32);
console.log("✓ Generated public/favicon.ico (from 32x32)");
