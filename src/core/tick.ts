import { RunService } from "@rbxts/services";
import { registry } from "./registry";

let _started = false;

export function startTick(): void {
	if (_started) return;
	_started = true;

	RunService.Heartbeat.Connect((deltaTime: number) => {
		registry.frame++;

		const now = os.clock();
		
		for (const action of registry.activeHolds) action._tickHold(deltaTime, now);
		for (const action of registry.buffered) action._tryFlushBuffer(now);
		for (const action of registry.transient) action._advanceTransient();
	});
}
