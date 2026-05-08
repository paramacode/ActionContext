import { Action } from "../action/action";
import { registry } from "../core/registry";
import { getHost } from "../core/host";
import { createIasContext } from "../internal/ias";
import { rebalanceStack } from "./stack";

import type { ActionConfig, ContextConfig, IasContext } from "../types";

export class Context {
	readonly id: string;
	readonly blocks: boolean | ReadonlySet<string>;
	readonly actions = new Map<string, Action>();

	priority: number;
	enabled = false;

	_ias: IasContext;
	_destroyed = false;

	constructor(id: string, config?: ContextConfig) {
		this.id = id;
		this.priority = config?.priority ?? 0;

		const blocks = config?.blocks;
		if (blocks === undefined || typeIs(blocks, "boolean")) {
			this.blocks = blocks ?? false;
		} else {
			const set = new Set<string>();
			for (const block of blocks) set.add(block);
			this.blocks = set;
		}

		this._ias = createIasContext(id, getHost());
	}

	action(name: string, config?: ActionConfig): Action {
		const existing = this.actions.get(name);
		if (existing) {
			if (config) {
				existing.config = { ...existing.config, ...config };
				if (config.bindings) existing._setKeys(config.bindings);
			}
			return existing;
		}

		const ias = this._ias.createAction(name);
		const action = new Action(this.id, name, config ?? {}, ias);

		this.actions.set(name, action);

		registry.actionsById.set(action.id, action);

		return action;
	}

	enable(): this {
		if (this._destroyed) return this;

		this.enabled = true;
		this._ias.setEnabled(true);

		rebalanceStack();

		return this;
	}

	disable(): this {
		if (this._destroyed) return this;

		this.enabled = false;
		this._ias.setEnabled(false);

		for (const [, action] of this.actions) if (action.isHeld()) action.interrupt();

		rebalanceStack();

		return this;
	}

	destroy(): void {
		if (this._destroyed) return;
		this._destroyed = true;

		for (const [, action] of this.actions) action._destroy();

		this.actions.clear();
		this._ias.destroy();

		registry.contexts.delete(this.id);

		rebalanceStack();
	}
}

export function getOrCreateContext(id: string, config?: ContextConfig): Context {
	const existing = registry.contexts.get(id);
	if (existing) {
		if (config?.priority !== undefined && existing.priority !== config.priority) {
			existing.priority = config.priority;
			rebalanceStack();
		}
		return existing;
	}

	const context = new Context(id, config);
	registry.contexts.set(id, context);
	return context;
}
