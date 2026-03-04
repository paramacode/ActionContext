import { GetRegistry } from "../Core/Registry";
import type { ActionInstance } from "../Types";

function resolveActionEntry(contextId: string, actionName: string): ActionInstance | undefined {
	const contextEntry = GetRegistry().contexts.get(contextId);

	if (!contextEntry) {
		warn(`Context '${contextId}' not found`);
		return undefined;
	}

	const actionEntry = contextEntry.actions.get(actionName);

	if (!actionEntry) {
		warn(`Action '${actionName}' not found in context '${contextId}'`);
		return undefined;
	}

	return actionEntry;
}

export function SetBindings(
	contextId: string,
	actionName: string,
	keyCodes: Enum.KeyCode | Enum.KeyCode[],
): boolean {
	const actionEntry = resolveActionEntry(contextId, actionName);
	if (!actionEntry) return false;

	const action = actionEntry.instance;

	// Remove old bindings
	for (const child of action.GetChildren()) {
		if (child.IsA("InputBinding")) {
			child.Destroy();
		}
	}

	const keys = typeIs(keyCodes, "table") ? (keyCodes as Enum.KeyCode[]) : [keyCodes];
	for (const key of keys) {
		const binding = new Instance("InputBinding");
		binding.KeyCode = key;
		binding.Parent = action;
	}
	// Store keys for serialization/query
	actionEntry.keys = keys;

	return true;
}

export function Rebind(
	contextId: string,
	actionName: string,
	newKeys: Enum.KeyCode | Enum.KeyCode[],
): boolean {
	return SetBindings(contextId, actionName, newKeys);
}

export function GetBindings(
	contextId: string,
	actionName: string,
): ReadonlyArray<Enum.KeyCode> | undefined {
	const actionEntry = resolveActionEntry(contextId, actionName);
	if (!actionEntry) return undefined;

	return actionEntry.keys;
}