import { Players } from "@rbxts/services";
import { GetRegistry } from "../Core/Registry";
import { IsAvailable } from "../Core/Validator";
import type { ContextBuilder, ContextEntry, ContextOptions } from "../Types";
import { CreateAction } from "./ActionManager";
import { SetBindings } from "./BindingManager";

const player = Players.LocalPlayer;
let cachedPlayerGui: PlayerGui | undefined;

function getPlayerGui(): PlayerGui {
	if (!cachedPlayerGui) {
		cachedPlayerGui = player.WaitForChild("PlayerGui") as PlayerGui;
	}
	return cachedPlayerGui;
}

export function Context(
	identifier: string,
	builder: (context: ContextBuilder) => void,
	options?: ContextOptions,
): void {
	if (!IsAvailable()) return;

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
	instance.Enabled = false; // Starts disabled - user activates explicitly
	instance.Parent = playerGui;

	const entry: ContextEntry = {
		instance: instance as InputContext,
		actions: new Map(),
	};

	registry.contexts.set(identifier, entry);

	// Execute builder callback
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

	builder(context);
}

export function Activate(identifier: string, exclusive?: boolean): void {
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

	for (const [, actionEntry] of entry.actions) {
		actionEntry.connections.forEach((connection) => connection.Disconnect());
		actionEntry.instance.Destroy();
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