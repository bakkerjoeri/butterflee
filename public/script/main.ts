import { clearCanvas, setupCanvas } from "heks";
import { Loop } from "./engine/Loop";
import { Entity } from "./engine/Entity";

class World extends Entity {
	constructor() {
		super();
		this.entities.push(new Butterfly([120, 80]));
	}
}

class Butterfly extends Entity {
	public size = 10;

	public draw(
		time: number,
		elapsed: number,
		canvas: HTMLCanvasElement,
		context: CanvasRenderingContext2D
	) {
		context.fillStyle = "hsl(290, 100%, 50%)";
		context.beginPath();
		context.arc(
			this.position[0],
			this.position[1],
			this.size / 2,
			0,
			Math.PI * 2
		);
		context.fill();
	}
}

function update(root: Entity, time: number, elapsed: number) {
	root.update(time, elapsed);
	root.updateChildren(time, elapsed);
}

function draw(
	root: Entity,
	time: number,
	elapsed: number,
	canvas: HTMLCanvasElement,
	context: CanvasRenderingContext2D
) {
	clearCanvas(canvas, context);
	root.draw(time, elapsed, canvas, context);
	root.drawChildren(time, elapsed, canvas, context);
}

const { canvas, context } = setupCanvas(".game", [240, 160], true);
const rootEntity = new World();
const loop = new Loop((time, elapsed) => {
	update(rootEntity, time, elapsed);
	draw(rootEntity, time, elapsed, canvas, context);
});
loop.start();
