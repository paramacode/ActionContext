import { _setSuppressionCheck, type Action } from "../action/action";
import { registry } from "../core/registry";

import type { Context } from "./context";

const _stack: string[] = [];

let _blocked = new Set<string>();

export function rebalanceStack(): void {
	const enabled: Context[] = [];
	for (const [, context] of registry.contexts) if (context.enabled) enabled.push(context);
	enabled.sort((a, b) => {
		if (a.priority !== b.priority) return a.priority > b.priority;
		return a.id < b.id;
	});

	const blocked = new Set<string>();
	for (let i = 0; i < enabled.size(); i++) {
		const context = enabled[i];
		if (blocked.has(context.id)) {
			for (const [, action] of context.actions) if (action.isHeld()) action.interrupt();
			continue;
		}
		if (context.blocks === true) {
			for (let j = i + 1; j < enabled.size(); j++) blocked.add(enabled[j].id);
		} else if (context.blocks !== false) {
			for (const id of context.blocks as ReadonlySet<string>) blocked.add(id);
		}
	}

	_blocked = blocked;
}

_setSuppressionCheck((action: Action): boolean => _blocked.has(action.contextId));

export function push(id: string): void {
	const context = registry.contexts.get(id);
	if (!context) error(`context '${id}' not found`);

	_stack.push(id);
	context.enable();
}

export function pop(id?: string): string | undefined {
	if (id !== undefined) {
		for (let i = _stack.size() - 1; i >= 0; i--) {
			if (_stack[i] === id) {
				_stack.remove(i);
				registry.contexts.get(id)?.disable();
				return id;
			}
		}
		return undefined;
	}

	const top = _stack.pop();
	if (top !== undefined) registry.contexts.get(top)?.disable();
	return top;
}
