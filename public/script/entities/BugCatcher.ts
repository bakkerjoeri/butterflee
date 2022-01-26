import { add, magnitude, subtract } from "dotspace";
import { isRectangleInRectangle } from "heks";
import { Entity } from "../engine/Entity";
import { Sprite } from "../engine/Sprite";
import { drawText } from "../engine/text";
import { Direction, Position, Size } from "../types";
import { normalizeTo } from "../utilities/normalizeTo";
import { Butterfly } from "./Butterfly";

const idleSpriteLeft = new Sprite(
	"sprites/bugcatcher-left.png",
	[16, 32],
	0,
	1,
	1
);
const idleSpriteRight = new Sprite(
	"sprites/bugcatcher-right.png",
	[16, 32],
	0,
	1,
	1
);
const huntingSpriteLeft = new Sprite(
	"sprites/bugcatcher-left.png",
	[16, 32],
	1,
	3,
	10
);
const huntingSpriteRight = new Sprite(
	"sprites/bugcatcher-right.png",
	[16, 32],
	1,
	3,
	10
);
const prepareForLungingSpriteLeft = new Sprite(
	"sprites/bugcatcher-left.png",
	[16, 32],
	4
);
const prepareForLungingSpriteRight = new Sprite(
	"sprites/bugcatcher-right.png",
	[16, 32],
	4
);
const lungingSpriteLeft = new Sprite(
	"sprites/bugcatcher-left.png",
	[16, 32],
	7
);
const lungingSpriteRight = new Sprite(
	"sprites/bugcatcher-right.png",
	[16, 32],
	7
);
const catchingSpriteLeft = new Sprite(
	"sprites/bugcatcher-left.png",
	[16, 32],
	4,
	3,
	10,
	false
);
const catchingSpriteRight = new Sprite(
	"sprites/bugcatcher-right.png",
	[16, 32],
	4,
	3,
	10,
	false
);

export class BugCatcher extends Entity {
	private readonly size: Size = [10, 10];
	private readonly movementSpeed = 0.6;
	private readonly lungeSpeed = 2;

	public target: Butterfly | null = null;
	public direction: Direction = [0, 0];
	public currentSpeed: number = 0;
	public canSwingNet: boolean = false;

	private message: string = "";
	private overallTimer: number = 15000;
	private sprite: Sprite = idleSpriteLeft;

	private state:
		| "idle"
		| "hunting"
		| "prepareForLunge"
		| "lunging"
		| "catching"
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
		this.sprite.update(time);

		if (
			this.overallTimer <= 0 &&
			this.state !== "giveUp" &&
			this.state !== "catching" &&
			this.state !== "targetCaught"
		) {
			this.state = "giveUp";
			delete this.stateData.countdown;
		} else if (
			this.canSwingNet &&
			this.isCollidingWithTarget &&
			this.state !== "catching" &&
			this.state !== "targetCaught"
		) {
			this.state = "catching";
			delete this.stateData.countdown;
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
			case "catching":
				this.catching(elapsed);
				break;
			case "targetCaught":
				this.targetCaught();
				break;
			case "giveUp":
				this.giveUp(elapsed);
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
		this.sprite.draw(context, this.position);

		if (this.message) {
			drawText(
				this.message,
				add(this.position, [this.size[0] / 2, -10]) as Position,
				"Birdseed",
				context,
				{ align: "center" }
			);
		}
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
			this.stateData.countdown = 1500;
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
		this.sprite =
			this.direction[0] > 0 ? huntingSpriteRight : huntingSpriteLeft;

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
		this.sprite =
			this.direction[0] > 0
				? prepareForLungingSpriteRight
				: prepareForLungingSpriteLeft;

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
		this.sprite =
			this.direction[0] > 0 ? lungingSpriteRight : lungingSpriteLeft;

		if (magnitude(subtract(this.stateData.lungeTo, this.position)) < 2) {
			delete this.stateData.lungeTo;
			this.state = "hunting";
		}
	}

	private giveUp(elapsed: number) {
		if (this.stateData.countup === undefined) {
			this.stateData.countup = 0;
		}

		const restingSpot = [100, 70];

		this.canSwingNet = false;
		this.direction = subtract(restingSpot, this.position) as Direction;

		if (magnitude(subtract(restingSpot, this.position)) > 2) {
			this.currentSpeed = 0.4;
			this.sprite =
				this.direction[0] > 0 ? huntingSpriteRight : huntingSpriteLeft;
		} else {
			this.currentSpeed = 0;
			this.direction = subtract(
				this.target!.position,
				this.position
			) as Direction;
			this.sprite =
				this.direction[0] > 0 ? idleSpriteRight : idleSpriteLeft;
		}

		this.message = "";

		if (this.stateData.countup > 1000 && this.stateData.countup < 4000) {
			this.message = "Oof, okay, you win.";
		} else if (
			this.stateData.countup > 5000 &&
			this.stateData.countup < 8000
		) {
			this.message = "You're quite fast!";
		} else if (
			this.stateData.countup > 9000 &&
			this.stateData.countup < 12000
		) {
			this.message = "And also really beautiful...";
		} else if (
			this.stateData.countup > 16000 &&
			this.stateData.countup < 19000
		) {
			this.message = "...look, I'm sorry I chased you.";
		} else if (
			this.stateData.countup > 20000 &&
			this.stateData.countup < 23000
		) {
			this.message = "That must have been really stressful.";
		} else if (
			this.stateData.countup > 24000 &&
			this.stateData.countup < 26000
		) {
			this.message = "I'll leave you be.";
		} else if (
			this.stateData.countup > 27000 &&
			this.stateData.countup < 31000
		) {
			this.message = "Goodbye!";
		}

		if (this.stateData.countup > 28000) {
			this.direction = [1, 0];
			this.currentSpeed = 0.4;
		}

		if (this.currentSpeed > 0) {
			this.sprite =
				this.direction[0] > 0 ? huntingSpriteRight : huntingSpriteLeft;
		} else {
			this.sprite =
				this.direction[0] > 0 ? idleSpriteRight : idleSpriteLeft;
		}

		this.stateData.countup += elapsed;
	}

	private catching(elapsed: number) {
		if (this.stateData.countdown === undefined) {
			this.stateData.countdown = 1000;
		}

		if (this.stateData.countdown <= 0) {
			delete this.stateData.countdown;
			this.state = "targetCaught";
			return;
		}

		this.currentSpeed = 0;
		this.sprite =
			this.direction[0] > 0 ? catchingSpriteRight : catchingSpriteLeft;

		if (this.stateData.countdown < 900) {
			this.target!.isCaught = true;
		}

		this.stateData.countdown -= elapsed;
	}

	private targetCaught() {
		this.direction = [1, 0];
		this.currentSpeed = 0.3;
		this.sprite =
			this.direction[0] > 0 ? huntingSpriteRight : huntingSpriteLeft;
	}
}
