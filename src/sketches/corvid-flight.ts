export default function (p: any, container: HTMLElement) {
	let flock: Bird[] = [];
	const numBirds = 60;

	class Bird {
		pos: any;
		vel: any;
		acc: any;
		maxForce = 0.2;
		maxSpeed = 4;
		perceptionRadius = 80;

		constructor() {
			this.pos = p.createVector(p.random(p.width), p.random(p.height));
			this.vel = p.constructor.Vector.random2D();
			this.vel.setMag(p.random(2, 4));
			this.acc = p.createVector();
		}

		edges() {
			if (this.pos.x > p.width) this.pos.x = 0;
			else if (this.pos.x < 0) this.pos.x = p.width;
			if (this.pos.y > p.height) this.pos.y = 0;
			else if (this.pos.y < 0) this.pos.y = p.height;
		}

		align(birds: Bird[]) {
			let steering = p.createVector();
			let total = 0;
			for (let other of birds) {
				let d = p.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
				if (other !== this && d < this.perceptionRadius) {
					steering.add(other.vel);
					total++;
				}
			}
			if (total > 0) {
				steering.div(total);
				steering.setMag(this.maxSpeed);
				steering.sub(this.vel);
				steering.limit(this.maxForce);
			}
			return steering;
		}

		cohesion(birds: Bird[]) {
			let steering = p.createVector();
			let total = 0;
			for (let other of birds) {
				let d = p.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
				if (other !== this && d < this.perceptionRadius) {
					steering.add(other.pos);
					total++;
				}
			}
			if (total > 0) {
				steering.div(total);
				steering.sub(this.pos);
				steering.setMag(this.maxSpeed);
				steering.sub(this.vel);
				steering.limit(this.maxForce);
			}
			return steering;
		}

		separation(birds: Bird[]) {
			let steering = p.createVector();
			let total = 0;
			for (let other of birds) {
				let d = p.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
				if (other !== this && d < this.perceptionRadius / 2) {
					let diff = p.constructor.Vector.sub(this.pos, other.pos);
					diff.div(d * d);
					steering.add(diff);
					total++;
				}
			}
			if (total > 0) {
				steering.div(total);
				steering.setMag(this.maxSpeed);
				steering.sub(this.vel);
				steering.limit(this.maxForce);
			}
			return steering;
		}

		flock(birds: Bird[]) {
			let alignment = this.align(birds);
			let cohesion = this.cohesion(birds);
			let separation = this.separation(birds);

			alignment.mult(1.0);
			cohesion.mult(1.0);
			separation.mult(1.5);

			this.acc.add(alignment);
			this.acc.add(cohesion);
			this.acc.add(separation);
		}

		update() {
			this.pos.add(this.vel);
			this.vel.add(this.acc);
			this.vel.limit(this.maxSpeed);
			this.acc.mult(0);
		}

		show() {
			let angle = this.vel.heading();
			p.push();
			p.translate(this.pos.x, this.pos.y);
			p.rotate(angle);

			// corvid silhouette
			p.fill(20);
			p.noStroke();

			// body
			p.ellipse(0, 0, 12, 6);

			// wings
			let wingAngle = p.sin(p.frameCount * 0.15 + this.pos.x) * 0.3;
			p.push();
			p.rotate(wingAngle);
			p.ellipse(-8, 0, 10, 3);
			p.pop();
			p.push();
			p.rotate(-wingAngle);
			p.ellipse(8, 0, 10, 3);
			p.pop();

			// beak
			p.triangle(10, 0, 14, -2, 14, 2);

			p.pop();
		}
	}

	p.setup = () => {
		const canvas = p.createCanvas(
			container.offsetWidth,
			container.offsetHeight,
		);
		canvas.parent(container);

		for (let i = 0; i < numBirds; i++) {
			flock.push(new Bird());
		}
	};

	p.windowResized = () => {
		p.resizeCanvas(container.offsetWidth, container.offsetHeight);
	};

	p.draw = () => {
		p.background(245, 242, 235);

		for (let bird of flock) {
			bird.edges();
			bird.flock(flock);
			bird.update();
			bird.show();
		}
	};
}
