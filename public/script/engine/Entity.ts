export class Entity {
	public position: [x: number, y: number];
	public entities: Entity[] = [];

	constructor(position: Entity["position"] = [0, 0]) {
		this.position = position;
	}

	public update(time: number, elapsed: number) {}

	public updateChildren(time: number, elapsed: number) {
		this.entities.forEach((entity) => {
			if (typeof entity.update === "undefined") {
				return;
			}

			entity.update(time, elapsed);
			entity.updateChildren(time, elapsed);
		});
	}

	public draw(
		time: number,
		elapsed: number,
		canvas: HTMLCanvasElement,
		context: CanvasRenderingContext2D
	) {}

	public drawChildren(
		time: number,
		elapsed: number,
		canvas: HTMLCanvasElement,
		context: CanvasRenderingContext2D
	) {
		this.entities.forEach((entity) => {
			if (typeof entity.draw === "undefined") {
				return;
			}

			entity.draw(time, elapsed, canvas, context);
			entity.drawChildren(time, elapsed, canvas, context);
		});
	}
}
