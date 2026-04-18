import { Players } from "@rbxts/services";
import { GetRegistry } from "../core/registry";
import { IsAvailable, ValidateIdentifier } from "../core/validator";
import { CreateAction } from "./action-manager";
import { SetBindings } from "./binding-manager";

import type { ActionProfile, ContextBuilder, ContextEntry, ContextOptions } from "../types";

const LOCAL_PLAYER = Players.LocalPlayer;

let cachedPlayerGui: PlayerGui | undefined;

function getPlayerGui(): PlayerGui {
	if (!cachedPlayerGui) {
		cachedPlayerGui = LOCAL_PLAYER.WaitForChild("PlayerGui") as PlayerGui;
	}
	return cachedPlayerGui;
}

export function Context(
	identifier: string,
	builderOrProfile: ((context: ContextBuilder) => void) | ActionProfile,
	options?: ContextOptions,
): void {
	if (!IsAvailable()) return;
	ValidateIdentifier(identifier, "Context identifier");

	const registry = GetRegistry();
	if (registry.contexts.has(identifier)) {
		if (!options?.override) {
			error(`Context '${identifier}' already exists. Pass { override: true } to replace it.`);
		}
		DestroyContext(identifier);
	}

	const playerGui = getPlayerGui();

	const instance = new Instance("InputContext");
	instance.Name = identifier;
	instance.Enabled = false;
	instance.Parent = playerGui;

	const entry: ContextEntry = {
		instance: instance,
		actions: new Map(),
	};

	registry.contexts.set(identifier, entry);

	const context: ContextBuilder = {
		action(actionName: string) {
			const actionInstance = CreateAction(identifier, actionName);

			const actionBuilder = {
				bind(keys: Enum.KeyCode | Enum.KeyCode[]) {
					if (actionInstance) {
						SetBindings(identifier, actionName, keys);
					}
					return actionBuilder;
				},
			};

			return actionBuilder;
		},
	};

	if (typeIs(builderOrProfile, "function")) {
		builderOrProfile(context);
	} else {
		for (const [actionName, keys] of builderOrProfile) {
			context.action(actionName).bind(keys);
		}
	}
}

export function Activate(identifier: string, exclusive?: boolean): void {
	ValidateIdentifier(identifier, "Context identifier");
	const registry = GetRegistry();

	const entry = registry.contexts.get(identifier);
	if (!entry) {
		warn(`Context '${identifier}' not found`);
		return;
	}

	if (exclusive) {
		for (const [id, context] of registry.contexts) {
			if (id !== identifier) {
				context.instance.Enabled = false;
			}
		}
	}

	entry.instance.Enabled = true;
}

export function Deactivate(identifier: string): void {
	ValidateIdentifier(identifier, "Context identifier");
	const registry = GetRegistry();

	const entry = registry.contexts.get(identifier);
	if (!entry) {
		warn(`Context '${identifier}' not found`);
		return;
	}
	entry.instance.Enabled = false;
}

export function DestroyContext(identifier: string): void {
	const registry = GetRegistry();

	const entry = registry.contexts.get(identifier);
	if (!entry) return;

	for (const [actionName, actionEntry] of entry.actions) {
		actionEntry.connections.forEach((connection) => connection.Disconnect());
		actionEntry.instance.Destroy();

		const handlers = registry.handlers.get(actionName);
		if (handlers) {
			for (const handler of handlers) {
				handler.connections = handler.connections.filter((conn) => conn.Connected);
			}
		}
	}

	entry.instance.Destroy();
	registry.contexts.delete(identifier);
}

export function GetContexts(): ReadonlyArray<string> {
	const result: string[] = [];
	for (const [id] of GetRegistry().contexts) {
		result.push(id);
	}
	return result;
}

export function GetActions(contextId: string): ReadonlyArray<string> | undefined {
	const entry = GetRegistry().contexts.get(contextId);
	if (!entry) return undefined;

	const result: string[] = [];
	for (const [name] of entry.actions) {
		result.push(name);
	}
	return result;
}

export function IsActive(identifier: string): boolean {
	const entry = GetRegistry().contexts.get(identifier);
	if (!entry) return false;
	return entry.instance.Enabled;
}

export function DestroyAll(): void {
	const registry = GetRegistry();

	for (const [, entry] of registry.contexts) {
		for (const [, actionEntry] of entry.actions) {
			actionEntry.connections.forEach((connection) => connection.Disconnect());
			actionEntry.instance.Destroy();
		}
		entry.instance.Destroy();
	}

	registry.contexts.clear();

	for (const [, handlers] of registry.handlers) {
		for (const handler of handlers) {
			for (const connection of handler.connections) {
				connection.Disconnect();
			}
			handler.connections = [];
		}
	}
	registry.handlers.clear();
}