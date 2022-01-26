import { Entity } from "../engine/Entity";
import { Butterfly } from "./../entities/Butterfly";
import { BugCatcher } from "./../entities/BugCatcher";

export class World extends Entity {
	constructor() {
		super();

		const butterfly = new Butterfly([120, 80]);
		const bugCatcher = new BugCatcher([8, 10]);

		bugCatcher.target = butterfly;

		this.entities.push(butterfly);
		this.entities.push(bugCatcher);
	}
}
