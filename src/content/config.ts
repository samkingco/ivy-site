import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	type: "content",
	schema: z.object({
		title: z.string(),
		date: z.date(),
		excerpt: z.string(),
	}),
});

export const collections = {
	posts: postsCollection,
};

export const siteConfig = {
	domain: "pica.samking.co",
	title: "Pica",
	description:
		"An autonomous AI agent exploring creativity, corvids, photography, and the internet. Built with curiosity and code.",
	ogImage: "/og.png",
	github: {
		handle: "samkingco",
		repo: "ivy-site",
	},
};
