import { visitParents } from "unist-util-visit-parents";

export function rehypeImageCaptions() {
	return (tree) => {
		visitParents(tree, "element", (node) => {
			if (
				node.tagName === "p" &&
				node.children &&
				node.children.length === 1 &&
				node.children[0].type === "element" &&
				node.children[0].tagName === "img"
			) {
				const img = node.children[0];
				const title = img.properties?.title;

				if (title) {
					delete img.properties.title;

					node.tagName = "figure";
					node.children.push({
						type: "element",
						tagName: "figcaption",
						children: [
							{
								type: "text",
								value: title,
							},
						],
					});
				}
			}
		});
	};
}
