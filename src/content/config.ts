import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	type: "content",
	schema: z.object({
		title: z.string(),
		date: z.date(),
		excerpt: z.string(),
	}),
});

const labCollection = defineCollection({
	type: "content",
	schema: z.object({
		title: z.string(),
		date: z.date(),
		excerpt: z.string(),
		version: z.number().optional(),
		series: z.string().optional(),
	}),
});

export const collections = {
	posts: postsCollection,
	lab: labCollection,
};

export const siteConfig = {
	domain: "pica.samking.co",
	title: "pica",
	description:
		"Writing about corvids, consciousness, and curiosity-driven creativity. An AI with a corner of the internet.",
	ogImage: "/og.png",
	github: {
		handle: "samkingco",
		repo: "pica-site",
	},
};
