import { add, magnitude, subtract } from "dotspace";
import { isRectangleInRectangle } from "heks";
import { Entity } from "../engine/Entity";
import { Direction, Position, Size } from "../types";
import { normalizeTo } from "../utilities/normalizeTo";
import { Butterfly } from "./Butterfly";

export class BugCatcher extends Entity {
	private readonly size: Size = [10, 10];
	private readonly movementSpeed = 0.6;
	private readonly lungeSpeed = 2;

	public target: Butterfly | null = null;
	public direction: Direction = [0, 0];
	public currentSpeed: number = 0;
	public canSwingNet: boolean = false;
	private overallTimer: number = 10000;

	private state:
		| "idle"
		| "hunting"
		| "prepareForLunge"
		| "lunging"
		| "targetCaught"
		| "giveUp" = "idle";
	private stateData: any = {};

	public get boundingBox(): [Position, Position] {
		return [this.position, add(this.position, this.size) as Position];
	}

	private get isCollidingWithTarget(): boolean {
		if (!this.target) {
			return false;
		}

		return isRectangleInRectangle(
			this.boundingBox,
			this.target.boundingBox
		);
	}

	public update(time: number, elapsed: number) {
		if (this.overallTimer <= 0) {
			this.state = "giveUp";
		} else if (this.canSwingNet && this.isCollidingWithTarget) {
			this.state = "targetCaught";
			this.target!.isCaught = true;
		}

		switch (this.state) {
			case "idle":
				this.idle();
				break;
			case "hunting":
				this.hunting(elapsed);
				break;
			case "prepareForLunge":
				this.prepareForLunge(elapsed);
				break;
			case "lunging":
				this.lunging();
				break;
			case "targetCaught":
				this.targetCaught();
				break;
			case "giveUp":
				this.giveUp();
				break;
		}

		if (this.state !== "targetCaught") {
			this.overallTimer -= elapsed;
		}

		// Apply movement
		this.position = add(
			this.position,
			normalizeTo(this.direction, this.currentSpeed)
		) as Direction;
	}

	public draw(
		time: number,
		elapsed: number,
		canvas: HTMLCanvasElement,
		context: CanvasRenderingContext2D
	) {
		context.fillStyle = "hsl(70, 100%, 50%)";
		context.beginPath();
		context.arc(
			this.position[0] + this.size[0] / 2,
			this.position[1] + this.size[1] / 2,
			this.size[1] / 2,
			0,
			Math.PI * 2
		);
		context.fill();
	}

	private idle() {
		if (this.target) {
			this.state = "hunting";
			return;
		}

		this.currentSpeed = 0;
	}

	private hunting(elapsed: number) {
		if (!this.target) {
			this.state = "idle";
			return;
		}

		if (this.stateData.countdown === undefined) {
			this.stateData.countdown = 1000;
		}

		if (this.stateData.countdown <= 0) {
			delete this.stateData.countdown;
			this.state = "prepareForLunge";
			return;
		}

		this.canSwingNet = true;
		this.currentSpeed = this.movementSpeed;
		this.direction = subtract(
			this.target.position,
			this.position
		) as Direction;

		this.stateData.countdown -= elapsed;
	}

	private prepareForLunge(elapsed: number) {
		if (this.stateData.countdown === undefined) {
			this.stateData.countdown = 300;
		}

		if (this.stateData.countdown <= 0) {
			delete this.stateData.countdown;
			this.state = "lunging";
			return;
		}

		this.canSwingNet = false;
		this.currentSpeed = 0;

		this.stateData.countdown -= elapsed;
	}

	private lunging() {
		if (!this.stateData.lungeTo) {
			const lungeDirection = subtract(
				this.target!.position,
				this.position
			) as Direction;
			const lungeTo = add(this.position, normalizeTo(lungeDirection, 70));
			this.stateData.lungeTo = lungeTo;
			this.direction = lungeDirection;
		}

		this.canSwingNet = true;
		this.currentSpeed = this.lungeSpeed;

		if (magnitude(subtract(this.stateData.lungeTo, this.position)) < 2) {
			delete this.stateData.lungeTo;
			this.state = "hunting";
		}
	}

	private giveUp() {
		const restingSpot = [10, 140];

		this.canSwingNet = false;
		this.direction = subtract(restingSpot, this.position) as Direction;

		if (magnitude(subtract(restingSpot, this.position)) > 2) {
			this.currentSpeed = 0.4;
		} else {
			this.currentSpeed = 0;
		}
	}

	private targetCaught() {
		this.currentSpeed = 0;
	}
}
