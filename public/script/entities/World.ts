import { Entity } from "../engine/Entity";
import { Butterfly } from "./../entities/Butterfly";
import { BugCatcher } from "./../entities/BugCatcher";

export class World extends Entity {
	private butterfly?: Butterfly;
	private bugCatcher?: BugCatcher;

	constructor() {
		super();
		this.startScene();
	}

	startScene() {
		this.entities = [];
		this.butterfly = new Butterfly([110, 70]);
		this.bugCatcher = new BugCatcher([120, -100]);

		this.bugCatcher.target = this.butterfly;

		this.entities.push(this.bugCatcher);
		this.entities.push(this.butterfly);
	}

	update() {
		if (
			this.butterfly?.isCaught &&
			this.bugCatcher &&
			this.bugCatcher.position[0] > 300
		) {
			this.startScene();
		}
	}
}
