// Visualization of vocal convergence in mated corvid pairs
export default function sketch(p: any, container: HTMLElement, dataset: any) {
	const W = 800;
	const H = 600;
	let t = 0;
	const CONVERGENCE_DURATION = 600; // frames to full convergence

	// Wave parameters for two "individuals"
	const wave1Initial = {
		freq: 0.015,
		amp: 60,
		phase: 0,
		noise: 0.3,
	};

	const wave2Initial = {
		freq: 0.022,
		amp: 45,
		phase: Math.PI * 0.7,
		noise: 0.25,
	};

	// Target convergence point (average of initial states)
	const target = {
		freq: (wave1Initial.freq + wave2Initial.freq) / 2,
		amp: (wave1Initial.amp + wave2Initial.amp) / 2,
		phase: (wave1Initial.phase + wave2Initial.phase) / 2,
		noise: (wave1Initial.noise + wave2Initial.noise) / 2,
	};

	function easeInOutCubic(x: number): number {
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	}

	function drawWave(
		params: { freq: number; amp: number; phase: number; noise: number },
		centerY: number,
		col: any,
		alpha: number
	) {
		// Main stroke
		p.noFill();
		p.stroke(
			p.red(col),
			p.green(col),
			p.blue(col),
			200 * (1 - alpha * 0.3)
		);
		p.strokeWeight(2);

		p.beginShape();
		for (let x = 0; x < W; x += 2) {
			const timeOffset = t * 0.02;
			const baseY =
				Math.sin(x * params.freq + timeOffset + params.phase) * params.amp;
			const noiseY =
				(p.noise(x * 0.01, t * 0.01) - 0.5) * params.noise * 40;
			const y = centerY + baseY + noiseY;
			p.vertex(x, y);
		}
		p.endShape();

		// Glow effect
		p.stroke(
			p.red(col),
			p.green(col),
			p.blue(col),
			80 * (1 - alpha * 0.3)
		);
		p.strokeWeight(6);
		p.beginShape();
		for (let x = 0; x < W; x += 4) {
			const timeOffset = t * 0.02;
			const baseY =
				Math.sin(x * params.freq + timeOffset + params.phase) * params.amp;
			const noiseY =
				(p.noise(x * 0.01, t * 0.01) - 0.5) * params.noise * 40;
			const y = centerY + baseY + noiseY;
			p.vertex(x, y);
		}
		p.endShape();
	}

	p.setup = () => {
		p.createCanvas(W, H);
	};

	p.draw = () => {
		p.background(10, 12, 16);

		// Convergence factor (0 = distinct, 1 = merged)
		const convergence = p.constrain(t / CONVERGENCE_DURATION, 0, 1);
		const eased = easeInOutCubic(convergence);

		// Interpolate toward target
		const current1 = {
			freq: p.lerp(wave1Initial.freq, target.freq, eased),
			amp: p.lerp(wave1Initial.amp, target.amp, eased),
			phase: p.lerp(wave1Initial.phase, target.phase, eased),
			noise: p.lerp(wave1Initial.noise, target.noise, eased),
		};

		const current2 = {
			freq: p.lerp(wave2Initial.freq, target.freq, eased),
			amp: p.lerp(wave2Initial.amp, target.amp, eased),
			phase: p.lerp(wave2Initial.phase, target.phase, eased),
			noise: p.lerp(wave2Initial.noise, target.noise, eased),
		};

		// Draw both waveforms
		drawWave(current1, H / 2 - 80, p.color(34, 211, 238), eased);
		drawWave(current2, H / 2 + 80, p.color(59, 130, 246), eased);

		// Show convergence progress
		p.fill(255, 100);
		p.noStroke();
		p.textSize(12);
		p.textAlign(p.LEFT, p.TOP);
		p.text(`convergence: ${Math.floor(convergence * 100)}%`, 20, H - 30);
		p.text(`time: ${Math.floor(t / 60)} seconds`, 20, H - 50);

		t++;
	};

	p.mousePressed = () => {
		if (
			p.mouseX > 0 &&
			p.mouseX < W &&
			p.mouseY > 0 &&
			p.mouseY < H
		) {
			t = 0; // restart
		}
	};
}
