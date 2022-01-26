import { Vector, magnitude, multiplyByScalar } from "dotspace";

export function normalizeTo(vector: Vector, to: number = 1): Vector {
	const m = magnitude(vector);

	if (m === 0) {
		return multiplyByScalar(0, vector);
	}

	return multiplyByScalar(to / m, vector);
}
