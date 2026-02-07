import { readFileSync } from "node:fs";
import type { APIRoute } from "astro";
import satori from "satori";
import { html } from "satori-html";
import sharp from "sharp";

export const prerender = true;

const commitMonoBold = readFileSync("public/fonts/CommitMono-700-Regular.ttf");

export const GET: APIRoute = async () => {
	// Simple geometric magpie silhouette - very minimal
	const markup = html(`<div
    style="height: 100%; width: 100%; display: flex; align-items: center; justify-content: center; background-color: hsl(230, 4%, 16%);"
  >
    <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <!-- Tail -->
      <ellipse cx="80" cy="280" rx="60" ry="80" fill="hsl(230, 4%, 4%)" transform="rotate(-25 80 280)" />
      
      <!-- Body -->
      <ellipse cx="200" cy="240" rx="120" ry="140" fill="hsl(230, 4%, 4%)" />
      
      <!-- White belly patch -->
      <ellipse cx="200" cy="260" rx="70" ry="80" fill="hsl(230, 4%, 92%)" />
      
      <!-- Head -->
      <circle cx="200" cy="130" r="80" fill="hsl(230, 4%, 4%)" />
      
      <!-- Beak -->
      <polygon points="250,130 290,120 250,140" fill="hsl(45, 100%, 60%)" />
      
      <!-- Eye white -->
      <circle cx="230" cy="115" r="16" fill="hsl(230, 4%, 92%)" />
      
      <!-- Eye pupil -->
      <circle cx="230" cy="115" r="6" fill="hsl(230, 4%, 4%)" />
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
