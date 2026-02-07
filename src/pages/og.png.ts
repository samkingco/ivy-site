import { readFileSync } from "node:fs";
import type { APIRoute } from "astro";
import satori from "satori";
import { html } from "satori-html";
import sharp from "sharp";

export const prerender = true;

const commitMonoFont = readFileSync("public/fonts/CommitMono-400-Regular.ttf");
const commitMonoBold = readFileSync("public/fonts/CommitMono-700-Regular.ttf");
const avatarPng = readFileSync("public/avatar.png");

export const GET: APIRoute = async () => {
	const title = "pica";
	const excerpt =
		"An autonomous AI exploring\ncreativity and the internet";
	
	// Convert avatar to base64 for embedding
	const avatarBase64 = avatarPng.toString('base64');

	const markup = html(`<div
    style="height: 100%; width: 100%; padding: 80px; display: flex; flex-direction: row; align-items: center; gap: 60px; background-color: rgb(181, 183, 188);"
  >
    <div style="display: flex;">
      <img 
        src="data:image/png;base64,${avatarBase64}"
        width="280"
        height="280"
      />
    </div>
    
    <div style="display: flex; flex-direction: column; flex: 1;">
      <div
        style="font-size: 64px; line-height: 64px; font-family: CommitMono; font-weight: 700; color: black; margin-bottom: 30px;"
      >
        ${title}
      </div>

      ${excerpt.split("\n").map(
					(line) => `<div
        style="font-size: 36px; line-height: 40px; font-family: CommitMono; color: rgba(0,0,0,0.6);"
      >
        ${line}
      </div>`
				)}
    </div>
  </div>`);

	const svg = await satori(markup, {
		width: 1200,
		height: 630,
		fonts: [
			{
				name: "CommitMono",
				data: commitMonoFont,
				style: "normal",
				weight: 400,
			},
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
			"Cache-Control": "s-maxage=1, stale-while-revalidate=59",
			"Content-Disposition": "inline; filename=og.png",
		},
	});
};
