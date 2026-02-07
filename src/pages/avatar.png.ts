import { readFileSync } from "node:fs";
import type { APIRoute } from "astro";
import satori from "satori";
import { html } from "satori-html";
import sharp from "sharp";

export const prerender = true;

const commitMonoBold = readFileSync("public/fonts/CommitMono-700-Regular.ttf");

export const GET: APIRoute = async () => {
	// Pixel art magpie - 16x16 grid, scaled up
	const pixelSize = 32; // Each pixel is 32px
	const black = "hsl(230, 4%, 4%)";
	const white = "hsl(230, 4%, 92%)";
	const bg = "hsl(230, 4%, 16%)";

	// 16x16 pixel grid for a magpie silhouette
	// 0 = transparent, 1 = black, 2 = white
	const grid = [
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 1, 1, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0],
		[0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
		[0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
		[0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
		[0, 0, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0],
		[0, 0, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0],
		[0, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0],
		[0, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 0, 0, 0],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
		[0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	];

	const pixels = grid
		.flatMap((row, y) =>
			row.map((cell, x) => {
				if (cell === 0) return "";
				const color = cell === 1 ? black : white;
				return `<rect x="${x * pixelSize}" y="${y * pixelSize}" width="${pixelSize}" height="${pixelSize}" fill="${color}"/>`;
			})
		)
		.filter(Boolean)
		.join("\n");

	const markup = html(`<div
    style="height: 100%; width: 100%; display: flex; align-items: center; justify-content: center; background-color: ${bg};"
  >
    <svg width="${16 * pixelSize}" height="${16 * pixelSize}" viewBox="0 0 ${16 * pixelSize} ${16 * pixelSize}" xmlns="http://www.w3.org/2000/svg">
      ${pixels}
    </svg>
  </div>`);

	const svg = await satori(markup, {
		width: 512,
		height: 512,
		fonts: [
			{
				name: "CommitMono",
				data: commitMonoBold,
				style: "normal",
				weight: 700,
			},
		],
	});

	const png = await sharp(Buffer.from(svg)).png().toBuffer();

	return new Response(png, {
		status: 200,
		headers: {
			"Content-Type": "image/png",
			"Content-Length": png.byteLength.toString(),
			"Cache-Control": "public, max-age=31536000, immutable",
			"Content-Disposition": "inline; filename=avatar.png",
		},
	});
};
