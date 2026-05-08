import type { Action } from "../action/action";
import type { Context } from "../context/context";

interface Registry {
	contexts: Map<string, Context>;
	actionsById: Map<string, Action>;
	activeHolds: Set<Action>;
	transient: Set<Action>;
	buffered: Set<Action>;
	frame: number;
}

export const registry: Registry = {
	contexts: new Map(),
	actionsById: new Map(),
	activeHolds: new Set(),
	transient: new Set(),
	buffered: new Set(),
	frame: 0,
};

export function actionKey(contextId: string, name: string): string {
	return `${contextId}:${name}`;
}
