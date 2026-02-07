export default function (p: any, container: HTMLElement) {
	let particles: Particle[] = [];
	let flowField: any[] = [];
	let cols: number, rows: number;
	let resolution = 20;
	let zoff = 0;
	let maxParticles = 2000;

	class Particle {
		pos: any;
		vel: any;
		acc: any;
		maxSpeed = 2;
		prevPos: any;
		alpha = 255;
		lifetime = 0;
		maxLifetime: number;

		constructor(x?: number, y?: number) {
			this.pos = p.createVector(
				x || p.random(p.width),
				y || p.random(p.height),
			);
			this.vel = p.createVector(0, 0);
			this.acc = p.createVector(0, 0);
			this.prevPos = this.pos.copy();
			this.maxLifetime = p.random(200, 400);
		}

		follow(flowField: any[]) {
			let x = p.floor(this.pos.x / resolution);
			let y = p.floor(this.pos.y / resolution);
			let index = x + y * cols;

			if (flowField[index]) {
				let force = flowField[index];
				this.applyForce(force);
			}
		}

		applyForce(force: any) {
			this.acc.add(force);
		}

		update() {
			this.vel.add(this.acc);
			this.vel.limit(this.maxSpeed);
			this.pos.add(this.vel);
			this.acc.mult(0);

			this.lifetime++;

			// fade out near end of life
			if (this.lifetime > this.maxLifetime * 0.8) {
				this.alpha = p.map(
					this.lifetime,
					this.maxLifetime * 0.8,
					this.maxLifetime,
					255,
					0,
				);
			}
		}

		edges() {
			if (this.pos.x > p.width) {
				this.pos.x = 0;
				this.updatePrev();
			}
			if (this.pos.x < 0) {
				this.pos.x = p.width;
				this.updatePrev();
			}
			if (this.pos.y > p.height) {
				this.pos.y = 0;
				this.updatePrev();
			}
			if (this.pos.y < 0) {
				this.pos.y = p.height;
				this.updatePrev();
			}
		}

		updatePrev() {
			this.prevPos = this.pos.copy();
		}

		show() {
			p.stroke(20, 20, 20, this.alpha * 0.15);
			p.strokeWeight(1.5);
			p.line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
			this.updatePrev();
		}

		isDead() {
			return this.lifetime >= this.maxLifetime;
		}
	}

	p.setup = () => {
		const canvas = p.createCanvas(
			container.offsetWidth,
			container.offsetHeight,
		);
		canvas.parent(container);

		cols = p.floor(p.width / resolution);
		rows = p.floor(p.height / resolution);

		flowField = new Array(cols * rows);

		// initialize with some particles
		for (let i = 0; i < 300; i++) {
			particles.push(new Particle());
		}
	};

	p.windowResized = () => {
		p.resizeCanvas(container.offsetWidth, container.offsetHeight);
		cols = p.floor(p.width / resolution);
		rows = p.floor(p.height / resolution);
		flowField = new Array(cols * rows);
	};

	p.draw = () => {
		// very subtle fade instead of full clear for trail effect
		p.background(245, 242, 235, 10);

		// update flow field
		let yoff = 0;
		for (let y = 0; y < rows; y++) {
			let xoff = 0;
			for (let x = 0; x < cols; x++) {
				let index = x + y * cols;
				let angle = p.noise(xoff, yoff, zoff) * p.TWO_PI * 2;
				let v = p.constructor.Vector.fromAngle(angle);
				v.setMag(0.1);
				flowField[index] = v;
				xoff += 0.1;
			}
			yoff += 0.1;
		}
		zoff += 0.002;

		// update and draw particles
		for (let i = particles.length - 1; i >= 0; i--) {
			let particle = particles[i];
			particle.follow(flowField);
			particle.update();
			particle.edges();
			particle.show();

			if (particle.isDead()) {
				particles.splice(i, 1);
			}
		}

		// add new particles occasionally
		if (particles.length < maxParticles && p.frameCount % 3 === 0) {
			particles.push(new Particle());
		}

		// particle count display
		p.fill(20, 100);
		p.noStroke();
		p.textSize(12);
		p.textFont("monospace");
		p.text(`PARTICLES: ${particles.length}`, 20, 30);
	};

	p.mouseDragged = () => {
		if (particles.length < maxParticles) {
			particles.push(new Particle(p.mouseX, p.mouseY));
		}
	};

	p.mousePressed = () => {
		if (
			p.mouseX >= 0 &&
			p.mouseX <= p.width &&
			p.mouseY >= 0 &&
			p.mouseY <= p.height
		) {
			particles.push(new Particle(p.mouseX, p.mouseY));
		}
	};
}
