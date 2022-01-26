import { clearCanvas, setupCanvas } from "heks";
import { Loop } from "./engine/Loop";
import { Entity } from "./engine/Entity";
import { keyboard } from "./engine/Keyboard";
import { World } from "./entities/World";
import { registerFont } from "./engine/text";
import metrics from "../fonts/Birdseed/metrics";

registerFont("Birdseed", metrics, "/fonts/Birdseed/atlas.png");

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
	clearCanvas(canvas, context, "#b9ffaa");
	root.draw(time, elapsed, canvas, context);
	root.drawChildren(time, elapsed, canvas, context);
}

const { canvas, context } = setupCanvas(".game", [240, 160], true);
const rootEntity = new World();
const loop = new Loop((time, elapsed) => {
	update(rootEntity, time, elapsed);
	keyboard.afterUpdate();
	draw(rootEntity, time, elapsed, canvas, context);
});
loop.start();
