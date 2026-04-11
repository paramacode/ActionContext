import { GetRegistry } from "./registry";

import type { TriggerType } from "../types";

export function IsAvailable(): boolean {
	const registry = GetRegistry();
	if (!registry.iasAvailable) {
		warn("Input Action System (IAS) is not available on this platform.");
		return false;
	}
	return true;
}

export function ValidateIdentifier(value: string, label: string): void {
	if (!typeIs(value, "string") || value.size() === 0) {
		error(`${label} must be a non-empty string.`);
	}
}

export function ValidateTriggerType(trigger: string): void {
	if (trigger !== "began" && trigger !== "ended" && trigger !== "changed") {
		error(`Invalid trigger type '${trigger}'. Expected 'began', 'ended', or 'changed'.`);
	}
}