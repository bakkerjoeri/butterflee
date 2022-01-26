import { add } from "dotspace";
import { keyboard } from "../engine/Keyboard";
import { Sprite } from "../engine/Sprite";
import type { Direction, Position } from "../types";
import { normalizeTo } from "../utilities/normalizeTo";
import { Entity } from "./../engine/Entity";

export class Butterfly extends Entity {
	public isCaught: boolean = false;
	private direction: Direction = [0, 0];
	private sprite: Sprite;
	private spriteLeft = new Sprite(
		"/sprites/butterfly.png",
		[16, 16],
		0,
		4,
		10
	);
	private spriteRight = new Sprite(
		"/sprites/butterfly-right.png",
		[16, 16],
		0,
		4,
		10
	);

	constructor(position: Position) {
		super(position);

		this.sprite = this.spriteLeft;
	}

	public get boundingBox(): [Position, Position] {
		return [this.position, add(this.position, [16, 16]) as Position];
	}

	public update(time: number) {
		this.sprite.update(time);

		if (this.isCaught) {
			return;
		}

		this.direction = [0, 0];
		if (keyboard.isKeyDown("w") || keyboard.isKeyDown("ArrowUp")) {
			this.direction[1] = -1;
		}

		if (keyboard.isKeyDown("s") || keyboard.isKeyDown("ArrowDown")) {
			this.direction[1] = 1;
		}

		if (keyboard.isKeyDown("a") || keyboard.isKeyDown("ArrowLeft")) {
			this.direction[0] = -1;
		}

		if (keyboard.isKeyDown("d") || keyboard.isKeyDown("ArrowRight")) {
			this.direction[0] = 1;
		}

		const movementSpeed = 1;

		this.position = add(
			this.position,
			normalizeTo(this.direction, movementSpeed)
		) as Direction;

		if (this.direction[0] > 0) {
			this.sprite = this.spriteRight;
		}

		if (this.direction[0] < 0) {
			this.sprite = this.spriteLeft;
		}
	}

	public draw(
		time: number,
		elapsed: number,
		canvas: HTMLCanvasElement,
		context: CanvasRenderingContext2D
	) {
		if (this.isCaught) {
			return;
		}

		this.sprite.draw(context, this.position);
	}
}
