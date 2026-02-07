import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { FontaineTransform } from "fontaine";
import { rehypeImageCaptions } from "./src/utils/rehype-image-captions.mjs";

export default defineConfig({
	site: "https://pica.samking.co",
	output: "static",
	integrations: [mdx(), sitemap()],
	markdown: {
		rehypePlugins: [rehypeImageCaptions],
	},
	vite: {
		plugins: [
			tailwindcss(),
			FontaineTransform.vite({
				fallbacks: ["Arial"],
				resolvePath: (id) => new URL(`./public${id}`, import.meta.url),
			}),
		],
	},
});
