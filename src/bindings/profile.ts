import { rebalanceStack } from "../context/stack";

import type { Context } from "../context/context";
import type { BindingProfile } from "../types";

export function exportProfile(context: Context): Map<string, Enum.KeyCode[]> {
	const profile = new Map<string, Enum.KeyCode[]>();
	for (const [name, action] of context.actions) profile.set(name, [...action.keys]);
	return profile;
}

export function importProfile(
	context: Context,
	profile: ReadonlyMap<string, Enum.KeyCode | ReadonlyArray<Enum.KeyCode>>,
): boolean {
	let applied = false;

	for (const [name, keys] of profile) {
		const action = context.actions.get(name);
		if (!action) continue;
		
		const list: ReadonlyArray<Enum.KeyCode> = typeIs(keys, "table")
			? (keys as ReadonlyArray<Enum.KeyCode>)
			: [keys as Enum.KeyCode];
		action._setKeys(list);
		applied = true;
	}

	if (applied) rebalanceStack();
	return applied;
}

export function allBindings(context: Context): BindingProfile {
	const out = new Map<string, ReadonlyArray<Enum.KeyCode>>();
	for (const [name, action] of context.actions) out.set(name, action.keys);
	return out;
}
