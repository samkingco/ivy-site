import sharp from "sharp";

const pixelSize = 32;
const black = [10, 10, 11, 255]; // hsl(230, 4%, 4%) as RGBA
const white = [235, 234, 234, 255]; // hsl(230, 4%, 92%) as RGBA
const bg = [41, 41, 43, 255]; // hsl(230, 4%, 16%) as RGBA

// 16x16 pixel grid for a magpie silhouette
// 0 = bg, 1 = black, 2 = white
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

// Create raw pixel buffer
const size = 16 * pixelSize;
const buffer = Buffer.alloc(size * size * 4);

for (let y = 0; y < 16; y++) {
	for (let x = 0; x < 16; x++) {
		const cell = grid[y][x];
		const color = cell === 0 ? bg : cell === 1 ? black : white;

		// Fill the pixelSize x pixelSize block
		for (let py = 0; py < pixelSize; py++) {
			for (let px = 0; px < pixelSize; px++) {
				const pixelY = y * pixelSize + py;
				const pixelX = x * pixelSize + px;
				const idx = (pixelY * size + pixelX) * 4;

				buffer[idx] = color[0]; // R
				buffer[idx + 1] = color[1]; // G
				buffer[idx + 2] = color[2]; // B
				buffer[idx + 3] = color[3]; // A
			}
		}
	}
}

// Create image from raw buffer and save
await sharp(buffer, {
	raw: {
		width: size,
		height: size,
		channels: 4,
	},
})
	.png()
	.toFile("public/avatar.png");

console.log("✓ Generated public/avatar.png");
