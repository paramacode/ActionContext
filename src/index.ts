import { Action } from "./action/action";
import * as cooldown from "./action/cooldown";
import { getOrCreateContext, type Context } from "./context/context";
import { push, pop } from "./context/stack";
import { registry } from "./core/registry";
import { startTick } from "./core/tick";
import { rebind, resetBindings, resetAllBindings, findConflicts } from "./bindings/rebind";
import { exportProfile, importProfile, allBindings } from "./bindings/profile";
import { listenForInput } from "./bindings/listener";
import { isIasAvailable } from "./internal/ias";
import * as net from "./net/adapter";

import type {
	BindingConflict,
	BindingProfile,
	ContextConfig,
	InputListenerOptions,
} from "./types";

export type {
	ActionConfig,
	ActionState,
	BindingConflict,
	BindingProfile,
	ContextConfig,
	InputListenerOptions,
	ClientToServer,
	ServerToClient,
} from "./types";
export type { Action } from "./action/action";
export type { Context } from "./context/context";

export const Input = {
	context(id: string, config?: ContextConfig): Context {
		return getOrCreateContext(id, config);
	},

	action(id: string): Action | undefined {
		return registry.actionsById.get(id);
	},

	contexts(): ReadonlyArray<string> {
		const out: string[] = [];
		for (const [id] of registry.contexts) out.push(id);
		return out;
	},

	push(id: string): void {
		push(id);
	},

	pop(id?: string): string | undefined {
		return pop(id);
	},

	cooldown: {
		set: cooldown.set,
		clear: cooldown.clear,
		clearAll: cooldown.clearAll,
		remaining: cooldown.remaining,
	},

	rebind(action: Action, keys: Enum.KeyCode | ReadonlyArray<Enum.KeyCode>): boolean {
		return rebind(action, keys);
	},

	resetBindings(action: Action): boolean {
		return resetBindings(action);
	},

	resetAllBindings(context: Context): void {
		resetAllBindings(context);
	},

	findConflicts(
		target: Action | Context,
		keys: Enum.KeyCode | ReadonlyArray<Enum.KeyCode>,
	): BindingConflict[] {
		return findConflicts(target, keys);
	},

	exportProfile(context: Context): Map<string, Enum.KeyCode[]> {
		return exportProfile(context);
	},

	importProfile(
		context: Context,
		profile: ReadonlyMap<string, Enum.KeyCode | ReadonlyArray<Enum.KeyCode>>,
	): boolean {
		return importProfile(context, profile);
	},

	allBindings(context: Context): BindingProfile {
		return allBindings(context);
	},

	listen(
		callback: (key: Enum.KeyCode) => void,
		options?: InputListenerOptions,
	): () => void {
		return listenForInput(callback, options);
	},

	net: {
		attach: net.attach,
		detach: net.detach,
		receive: net.receive,
		setTransport: net.setTransport,
	},

	reset(): void {
		for (const [, context] of registry.contexts) context.destroy();

		registry.contexts.clear();
		cooldown.clearAll();
	},

	isAvailable(): boolean {
		return isIasAvailable();
	},
};

startTick();
