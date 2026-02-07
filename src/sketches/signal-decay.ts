export default function (p: any, container: HTMLElement) {
	let originalData: number[][] = [];
	let corruptedData: number[][] = [];
	let decayProgress = 0;
	let gridSize = 16;
	let cols: number, rows: number;

	function initSignal() {
		originalData = [];
		corruptedData = [];
		decayProgress = 0;

		// generate clean signal data
		for (let y = 0; y < rows; y++) {
			originalData[y] = [];
			corruptedData[y] = [];
			for (let x = 0; x < cols; x++) {
				// create interesting patterns - sine waves and interference
				let value = 0;
				value += p.sin(x * 0.15) * 0.3;
				value += p.sin(y * 0.2) * 0.3;
				value += p.sin((x + y) * 0.1) * 0.4;
				value = (value + 1) * 0.5; // normalize to 0-1

				originalData[y][x] = value;
				corruptedData[y][x] = value;
			}
		}
	}

	p.setup = () => {
		const canvas = p.createCanvas(
			container.offsetWidth,
			container.offsetHeight,
		);
		canvas.parent(container);

		cols = p.floor(p.width / gridSize);
		rows = p.floor(p.height / gridSize);

		initSignal();
	};

	p.windowResized = () => {
		p.resizeCanvas(container.offsetWidth, container.offsetHeight);
		cols = p.floor(p.width / gridSize);
		rows = p.floor(p.height / gridSize);
		initSignal();
	};

	p.draw = () => {
		p.background(20);

		// gradually increase decay
		decayProgress += 0.005;
		decayProgress = p.constrain(decayProgress, 0, 1);

		// apply corruption
		let corruptionRate = p.pow(decayProgress, 2);

		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < cols; x++) {
				// random bit flips
				if (p.random(1) < corruptionRate * 0.02) {
					corruptedData[y][x] = p.random(1);
				}

				// quantization errors
				if (p.random(1) < corruptionRate * 0.3) {
					let levels = p.floor(p.map(corruptionRate, 0, 1, 16, 2));
					corruptedData[y][x] =
						p.floor(corruptedData[y][x] * levels) / levels;
				}

				// noise injection
				if (p.random(1) < corruptionRate * 0.1) {
					corruptedData[y][x] += p.random(-0.3, 0.3);
					corruptedData[y][x] = p.constrain(
						corruptedData[y][x],
						0,
						1,
					);
				}

				// packet loss (blocks)
				let packetLoss = p.random(1) < corruptionRate * 0.001;

				// draw cell
				let value = corruptedData[y][x];

				if (packetLoss) {
					// missing data - show error color
					p.fill(255, 0, 100, 200);
				} else {
					// map value to color - grayscale with subtle hue shift
					let brightness = value * 255;
					let hue = p.map(value, 0, 1, 180, 280);
					p.colorMode(p.HSB, 360, 100, 100);
					p.fill(hue, 30, brightness / 2.55);
					p.colorMode(p.RGB, 255);
				}

				p.noStroke();

				// glitch effect - occasional displaced blocks
				let offsetX = 0;
				let offsetY = 0;
				if (p.random(1) < corruptionRate * 0.05) {
					offsetX = p.random(-gridSize, gridSize);
					offsetY = p.random(-gridSize, gridSize);
				}

				p.rect(
					x * gridSize + offsetX,
					y * gridSize + offsetY,
					gridSize,
					gridSize,
				);
			}
		}

		// signal strength meter
		p.fill(255, 100);
		p.noStroke();
		p.textSize(12);
		p.textFont("monospace");
		let integrity = (1 - decayProgress) * 100;
		p.text(`SIGNAL INTEGRITY: ${integrity.toFixed(1)}%`, 20, 30);
		p.text(`PACKET LOSS: ${(corruptionRate * 100).toFixed(1)}%`, 20, 50);

		if (decayProgress >= 0.99) {
			p.text(`[CLICK TO RESET]`, 20, p.height - 20);
		}
	};

	p.mousePressed = () => {
		if (
			p.mouseX >= 0 &&
			p.mouseX <= p.width &&
			p.mouseY >= 0 &&
			p.mouseY <= p.height
		) {
			initSignal();
		}
	};
}
