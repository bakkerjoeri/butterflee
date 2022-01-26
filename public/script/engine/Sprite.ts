import { multiplyByComponents } from "dotspace";
import { Position, Size } from "../types";
import { getImage } from "../utilities/images";

export interface SpriteFrame {
	origin: [x: number, y: number];
	size: [width: number, height: number];
}

export class Sprite {
	private looping: boolean = true;
	private isPlaying: boolean = true;
	private framesPerSecond: number;
	private currentFrameIndex: number = 0;
	private image: HTMLImageElement;
	private frames: SpriteFrame[] = [];
	private offset: Size;

	constructor(
		path: string,
		frameSize: Size,
		amountOfFrames: number = 1,
		framesPerSecond: number = 1,
		offset: Size = [0, 0]
	) {
		this.image = getImage(path);
		this.framesPerSecond = framesPerSecond;
		this.offset = offset;

		for (let f = 0; f < amountOfFrames; f += 1) {
			this.frames.push({
				origin: multiplyByComponents(frameSize, [f, 0]) as Position,
				size: frameSize,
			});
		}
	}

	public update(time: number) {
		if (
			this.framesPerSecond === 0 ||
			this.frames.length <= 1 ||
			!this.isPlaying
		) {
			return;
		}

		this.currentFrameIndex = calculateNewFrameIndex(
			this.frames.length,
			this.framesPerSecond,
			time,
			this.looping
		);
	}

	public draw(context: CanvasRenderingContext2D, position: Position) {
		if (!this.frames[this.currentFrameIndex]) {
			throw new Error(
				`Sprite does not have frame with index ${this.currentFrameIndex}`
			);
		}

		const frame = this.frames[this.currentFrameIndex];

		context.drawImage(
			this.image,
			Math.round(frame.origin[0]),
			Math.round(frame.origin[1]),
			Math.round(frame.size[0]),
			Math.round(frame.size[1]),
			Math.round(position[0] + this.offset[0]),
			Math.round(position[1] + this.offset[1]),
			Math.round(frame.size[0]),
			Math.round(frame.size[1])
		);
	}
}

function calculateNewFrameIndex(
	amountOfFrames: number,
	framesPerSecond: number,
	elapsedTime: number,
	isLooping: boolean
): number {
	if (isLooping) {
		return (
			Math.round(elapsedTime / (1000 / framesPerSecond)) % amountOfFrames
		);
	}

	return Math.min(
		Math.round(elapsedTime / 1000) / framesPerSecond,
		amountOfFrames - 1
	);
}
