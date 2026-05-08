import { Action } from "../action/action";
import { registry } from "../core/registry";
import { rebalanceStack } from "../context/stack";

import type { Context } from "../context/context";
import type { BindingConflict } from "../types";

function _normalize(
	keys: Enum.KeyCode | ReadonlyArray<Enum.KeyCode>,
): ReadonlyArray<Enum.KeyCode> {
	return typeIs(keys, "table") ? (keys as ReadonlyArray<Enum.KeyCode>) : [keys];
}

function _same(a: ReadonlyArray<Enum.KeyCode>, b: ReadonlyArray<Enum.KeyCode>): boolean {
	if (a.size() !== b.size()) return false;
	for (let i = 0; i < a.size(); i++) if (a[i] !== b[i]) return false;
	return true;
}

export function rebind(
	action: Action,
	keys: Enum.KeyCode | ReadonlyArray<Enum.KeyCode>,
): boolean {
	if (action._destroyed) return false;

	const list = _normalize(keys);

	if (_same(action.keys, list)) return true;

	action._setKeys(list);

	rebalanceStack();

	return true;
}

export function resetBindings(action: Action): boolean {
	if (action._destroyed || !action.defaultKeys) return false;
	action._setKeys(action.defaultKeys);

	rebalanceStack();
	
	return true;
}

export function resetAllBindings(context: Context): void {
	for (const [, action] of context.actions) {
		if (action.defaultKeys) action._setKeys(action.defaultKeys);
	}
	rebalanceStack();
}

export function findConflicts(
	target: Action | Context,
	keys: Enum.KeyCode | ReadonlyArray<Enum.KeyCode>,
): BindingConflict[] {
	const list = _normalize(keys);
	const out: BindingConflict[] = [];

	if (target instanceof Action) {
		const context = registry.contexts.get(target.contextId);
		if (!context) return out;
		
		_walk(context, list, target.name, out);
	} else {
		_walk(target, list, undefined, out);
	}

	return out;
}

function _walk(
	context: Context,
	keys: ReadonlyArray<Enum.KeyCode>,
	exclude: string | undefined,
	out: BindingConflict[],
): void {
	for (const [name, other] of context.actions) {
		if (name === exclude) continue;

		for (const key of keys) {
			if (other.keys.includes(key)) out.push({ contextId: context.id, actionName: name, key: key });
		}
	}
}
