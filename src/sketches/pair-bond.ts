// Pixel art pair bonding animation
export default function sketch(p: any, container: HTMLElement, dataset: any) {
	const SIZE = 64; // native pixel resolution
	let buffer: any;
	let isAnimating = false;
	let animationFrame = 0;
	const ANIMATION_FRAMES = 12;
	const FRAME_DELAY = 6;
	let tick = 0;

	// Monochrome palette with iridescent accent
	const PALETTE = {
		bg: "#0f1419",
		crow: "#1a1a1a",
		detail: "#2d2d2d",
		eye: "#ffcc00",
		highlight: "#4a9eff",
		ground: "#2a2419",
	};

	function drawBird(x: number, y: number, facing: 'left' | 'right', animFrame: number) {
		buffer.push();
		
		if (facing === 'left') {
			buffer.translate(x + 6, y);
			buffer.scale(-1, 1);
			buffer.translate(-6, 0);
		} else {
			buffer.translate(x, y);
		}

		// Body positions based on animation frame
		const bob = animFrame < 4 ? Math.floor(animFrame / 2) : 
					animFrame < 8 ? 2 - Math.floor((animFrame - 4) / 2) : 0;
		const wingSpread = animFrame >= 8 && animFrame < 12;

		// Body (6x8 pixels)
		buffer.fill(PALETTE.crow);
		buffer.noStroke();
		buffer.rect(2, 2 + bob, 6, 6);

		// Head (4x4 pixels)
		buffer.rect(1, 0 + bob, 4, 4);

		// Beak
		buffer.fill(PALETTE.detail);
		buffer.rect(0, 1 + bob, 1, 2);

		// Eye
		buffer.fill(PALETTE.eye);
		buffer.rect(1, 1 + bob, 1, 1);

		// Wing
		if (wingSpread) {
			buffer.fill(PALETTE.crow);
			buffer.rect(7, 3 + bob, 3, 4);
			// Iridescent highlight on wing
			buffer.fill(PALETTE.highlight);
			buffer.rect(8, 4 + bob, 1, 1);
		} else {
			buffer.fill(PALETTE.detail);
			buffer.rect(6, 4 + bob, 2, 3);
		}

		// Tail
		buffer.fill(PALETTE.crow);
		buffer.rect(7, 7 + bob, 2, 2);

		// Legs
		buffer.fill(PALETTE.detail);
		buffer.rect(3, 8 + bob, 1, 2);
		buffer.rect(5, 8 + bob, 1, 2);

		buffer.pop();
	}

	function drawScene(animFrame: number) {
		// Background
		buffer.background(PALETTE.bg);

		// Ground line
		buffer.fill(PALETTE.ground);
		buffer.noStroke();
		buffer.rect(0, 45, SIZE, 19);

		// Draw both birds facing each other
		drawBird(16, 32, 'right', animFrame);
		drawBird(38, 32, 'left', animFrame);

		// Hearts appear during wing display
		if (animFrame >= 8 && animFrame < 12) {
			buffer.fill(PALETTE.highlight);
			buffer.noStroke();
			// Simple heart shape (3x3)
			buffer.rect(30, 20, 1, 1);
			buffer.rect(32, 20, 1, 1);
			buffer.rect(29, 21, 4, 2);
			buffer.rect(30, 23, 2, 1);
		}
	}

	p.setup = () => {
		const canvas = p.createCanvas(SIZE * 8, SIZE * 8);
		canvas.parent(container);
		p.noSmooth(); // nearest-neighbor scaling

		// Create offscreen buffer at native resolution
		buffer = p.createGraphics(SIZE, SIZE);
		buffer.noSmooth();
		buffer.pixelDensity(1);

		// Initial draw
		drawScene(0);
	};

	p.draw = () => {
		if (isAnimating) {
			tick++;
			if (tick >= FRAME_DELAY) {
				tick = 0;
				animationFrame++;
				if (animationFrame >= ANIMATION_FRAMES) {
					animationFrame = 0;
					isAnimating = false;
				}
			}
			drawScene(animationFrame);
		}

		// Scale up buffer to canvas
		p.image(buffer, 0, 0, p.width, p.height);
	};

	p.mousePressed = () => {
		if (!isAnimating && p.mouseX >= 0 && p.mouseX < p.width && p.mouseY >= 0 && p.mouseY < p.height) {
			isAnimating = true;
			animationFrame = 0;
			tick = 0;
		}
	};
}
