export default function (p: any, container: HTMLElement) {
	let agents: Agent[] = [];
	let attractors: Attractor[] = [];
	let hueOffset = 0;

	class Agent {
		pos: any;
		vel: any;
		acc: any;
		maxSpeed = 4;
		maxForce = 0.3;
		radius: number;
		hue: number;
		wobble: number;

		constructor(x: number, y: number) {
			this.pos = p.createVector(x, y);
			this.vel = p.constructor.Vector.random2D();
			this.vel.mult(p.random(1, 3));
			this.acc = p.createVector();
			this.radius = p.random(8, 20);
			this.hue = p.random(360);
			this.wobble = p.random(p.TWO_PI);
		}

		seek(target: any) {
			let desired = p.constructor.Vector.sub(target, this.pos);
			let d = desired.mag();

			if (d < 100) {
				let m = p.map(d, 0, 100, 0, this.maxSpeed);
				desired.setMag(m);
			} else {
				desired.setMag(this.maxSpeed);
			}

			let steer = p.constructor.Vector.sub(desired, this.vel);
			steer.limit(this.maxForce);
			return steer;
		}

		flee(target: any) {
			let desired = p.constructor.Vector.sub(this.pos, target);
			let d = desired.mag();

			if (d < 150) {
				desired.setMag(this.maxSpeed);
				let steer = p.constructor.Vector.sub(desired, this.vel);
				steer.limit(this.maxForce);
				return steer;
			}
			return p.createVector(0, 0);
		}

		separate(agents: Agent[]) {
			let desiredSep = this.radius * 3;
			let steer = p.createVector();
			let count = 0;

			for (let other of agents) {
				let d = p.constructor.Vector.dist(this.pos, other.pos);
				if (other !== this && d < desiredSep) {
					let diff = p.constructor.Vector.sub(this.pos, other.pos);
					diff.normalize();
					diff.div(d);
					steer.add(diff);
					count++;
				}
			}

			if (count > 0) {
				steer.div(count);
				steer.setMag(this.maxSpeed);
				steer.sub(this.vel);
				steer.limit(this.maxForce);
			}
			return steer;
		}

		update() {
			this.vel.add(this.acc);
			this.vel.limit(this.maxSpeed);
			this.pos.add(this.vel);
			this.acc.mult(0);
			this.wobble += 0.05;
		}

		edges() {
			if (this.pos.x > p.width) this.pos.x = 0;
			else if (this.pos.x < 0) this.pos.x = p.width;
			if (this.pos.y > p.height) this.pos.y = 0;
			else if (this.pos.y < 0) this.pos.y = p.height;
		}

		applyBehaviors(agents: Agent[], attractors: Attractor[]) {
			let separate = this.separate(agents);
			separate.mult(2);
			this.acc.add(separate);

			if (attractors.length > 0) {
				let closest = attractors[0];
				let closestDist = p.constructor.Vector.dist(
					this.pos,
					closest.pos,
				);

				for (let attractor of attractors) {
					let d = p.constructor.Vector.dist(this.pos, attractor.pos);
					if (d < closestDist) {
						closest = attractor;
						closestDist = d;
					}
				}

				if (closest.repel) {
					let flee = this.flee(closest.pos);
					flee.mult(1.5);
					this.acc.add(flee);
				} else {
					let seek = this.seek(closest.pos);
					seek.mult(0.8);
					this.acc.add(seek);
				}
			}

			// gentle drift
			let drift = p.constructor.Vector.fromAngle(
				p.noise(this.pos.x * 0.01, this.pos.y * 0.01) * p.TWO_PI,
			);
			drift.mult(0.1);
			this.acc.add(drift);
		}

		show() {
			p.colorMode(p.HSB, 360, 100, 100, 100);

			// outer glow
			for (let r = this.radius * 2; r > this.radius; r -= 2) {
				let alpha = p.map(r, this.radius, this.radius * 2, 60, 0);
				p.fill((this.hue + hueOffset) % 360, 80, 90, alpha);
				p.noStroke();
				let wobbleSize = p.sin(this.wobble) * 2;
				p.ellipse(
					this.pos.x,
					this.pos.y,
					r + wobbleSize,
					r + wobbleSize,
				);
			}

			// core
			p.fill((this.hue + hueOffset) % 360, 90, 95, 80);
			p.noStroke();
			let wobbleSize = p.sin(this.wobble) * 3;
			p.ellipse(
				this.pos.x,
				this.pos.y,
				this.radius + wobbleSize,
				this.radius + wobbleSize,
			);

			p.colorMode(p.RGB, 255);
		}
	}

	class Attractor {
		pos: any;
		repel: boolean;
		life = 200;

		constructor(x: number, y: number, repel: boolean = false) {
			this.pos = p.createVector(x, y);
			this.repel = repel;
		}

		update() {
			this.life--;
		}

		isDead() {
			return this.life <= 0;
		}

		show() {
			p.push();
			p.translate(this.pos.x, this.pos.y);
			p.rotate(p.frameCount * 0.02);

			p.colorMode(p.HSB, 360, 100, 100, 100);
			let alpha = p.map(this.life, 0, 200, 0, 50);

			if (this.repel) {
				// repeller - sharp triangles pointing out
				p.fill(0, 80, 90, alpha);
				p.noStroke();
				for (let i = 0; i < 6; i++) {
					p.rotate(p.TWO_PI / 6);
					p.triangle(0, -5, 15, 0, 0, 5);
				}
			} else {
				// attractor - soft circle
				p.fill(200, 70, 90, alpha);
				p.noStroke();
				p.ellipse(0, 0, 30, 30);
			}

			p.colorMode(p.RGB, 255);
			p.pop();
		}
	}

	p.setup = () => {
		const canvas = p.createCanvas(
			container.offsetWidth,
			container.offsetHeight,
		);
		canvas.parent(container);
		p.colorMode(p.HSB, 360, 100, 100, 100);

		// spawn initial agents
		for (let i = 0; i < 40; i++) {
			agents.push(new Agent(p.random(p.width), p.random(p.height)));
		}

		// initial attractors
		attractors.push(new Attractor(p.width / 2, p.height / 2, false));
	};

	p.windowResized = () => {
		p.resizeCanvas(container.offsetWidth, container.offsetHeight);
	};

	p.draw = () => {
		p.background(20, 15, 10);

		hueOffset += 0.3;

		// update and draw attractors
		for (let i = attractors.length - 1; i >= 0; i--) {
			attractors[i].update();
			attractors[i].show();
			if (attractors[i].isDead()) {
				attractors.splice(i, 1);
			}
		}

		// update and draw agents
		for (let agent of agents) {
			agent.applyBehaviors(agents, attractors);
			agent.update();
			agent.edges();
			agent.show();
		}

		// info text
		p.fill(255, 0, 100, 60);
		p.noStroke();
		p.textSize(12);
		p.textFont("monospace");
		p.colorMode(p.RGB, 255);
		p.text(
			`AGENTS: ${agents.length} | ATTRACTORS: ${attractors.length}`,
			20,
			30,
		);
		p.text(`[CLICK: attract] [SHIFT+CLICK: repel]`, 20, 50);
	};

	p.mousePressed = () => {
		if (
			p.mouseX >= 0 &&
			p.mouseX <= p.width &&
			p.mouseY >= 0 &&
			p.mouseY <= p.height
		) {
			let repel = p.keyIsDown(p.SHIFT);
			attractors.push(new Attractor(p.mouseX, p.mouseY, repel));

			// occasionally spawn new agents
			if (p.random(1) < 0.3 && agents.length < 80) {
				agents.push(new Agent(p.mouseX, p.mouseY));
			}
		}
	};
}
