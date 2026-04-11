import { UserInputService } from "@rbxts/services";
import { GetRegistry } from "../core/registry";
import { ValidateIdentifier } from "../core/validator";

import type { ActionInstance, BindingConflict, InputListenerOptions } from "../types";

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

function normalizeKeys(keyCodes: Enum.KeyCode | Enum.KeyCode[]): Enum.KeyCode[] {
	return typeIs(keyCodes, "table") ? (keyCodes as Enum.KeyCode[]) : [keyCodes];
}

export function SetBindings(
	contextId: string,
	actionName: string,
	keyCodes: Enum.KeyCode | Enum.KeyCode[],
): boolean {
	const actionEntry = resolveActionEntry(contextId, actionName);
	if (!actionEntry) return false;

	const action = actionEntry.instance;

	for (const child of action.GetChildren()) {
		if (child.IsA("InputBinding")) {
			child.Destroy();
		}
	}

	const keys = normalizeKeys(keyCodes);
	for (const key of keys) {
		const binding = new Instance("InputBinding");
		binding.KeyCode = key;
		binding.Parent = action;
	}

	if (actionEntry.defaultKeys === undefined) {
		actionEntry.defaultKeys = [...keys];
	}

	actionEntry.keys = keys;

	return true;
}

export function Rebind(
	contextId: string,
	actionName: string,
	newKeys: Enum.KeyCode | Enum.KeyCode[],
): boolean {
	ValidateIdentifier(contextId, "Context identifier");
	ValidateIdentifier(actionName, "Action name");
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

export function GetDefaultBindings(
	contextId: string,
	actionName: string,
): ReadonlyArray<Enum.KeyCode> | undefined {
	const actionEntry = resolveActionEntry(contextId, actionName);
	if (!actionEntry || actionEntry.defaultKeys === undefined) return undefined;

	return actionEntry.defaultKeys;
}

export function ResetBindings(contextId: string, actionName: string): boolean {
	ValidateIdentifier(contextId, "Context identifier");
	ValidateIdentifier(actionName, "Action name");

	const actionEntry = resolveActionEntry(contextId, actionName);
	if (!actionEntry || actionEntry.defaultKeys === undefined) return false;

	return SetBindings(contextId, actionName, [...actionEntry.defaultKeys]);
}

export function ResetAllBindings(contextId: string): boolean {
	ValidateIdentifier(contextId, "Context identifier");

	const contextEntry = GetRegistry().contexts.get(contextId);
	if (!contextEntry) {
		warn(`Context '${contextId}' not found`);
		return false;
	}

	for (const [actionName, actionEntry] of contextEntry.actions) {
		if (actionEntry.defaultKeys !== undefined) {
			SetBindings(contextId, actionName, [...actionEntry.defaultKeys]);
		}
	}

	return true;
}

export function GetAllBindings(
	contextId: string,
): ReadonlyMap<string, ReadonlyArray<Enum.KeyCode>> | undefined {
	const contextEntry = GetRegistry().contexts.get(contextId);
	if (!contextEntry) return undefined;

	const result = new Map<string, ReadonlyArray<Enum.KeyCode>>();
	for (const [actionName, actionEntry] of contextEntry.actions) {
		result.set(actionName, actionEntry.keys);
	}
	return result;
}

export function ExportBindings(
	contextId: string,
): Map<string, Enum.KeyCode[]> | undefined {
	ValidateIdentifier(contextId, "Context identifier");

	const contextEntry = GetRegistry().contexts.get(contextId);
	if (!contextEntry) return undefined;

	const profile = new Map<string, Enum.KeyCode[]>();
	for (const [actionName, actionEntry] of contextEntry.actions) {
		profile.set(actionName, [...actionEntry.keys]);
	}
	return profile;
}

export function ImportBindings(
	contextId: string,
	profile: ReadonlyMap<string, Enum.KeyCode | Enum.KeyCode[]>,
): boolean {
	ValidateIdentifier(contextId, "Context identifier");

	const contextEntry = GetRegistry().contexts.get(contextId);
	if (!contextEntry) {
		warn(`Context '${contextId}' not found`);
		return false;
	}

	let applied = false;
	for (const [actionName, keys] of profile) {
		if (contextEntry.actions.has(actionName)) {
			if (SetBindings(contextId, actionName, keys)) {
				applied = true;
			}
		}
	}

	return applied;
}

export function FindConflicts(
	contextId: string,
	actionName: string,
	keys: Enum.KeyCode | Enum.KeyCode[],
): BindingConflict[] {
	const contextEntry = GetRegistry().contexts.get(contextId);
	if (!contextEntry) return [];

	const normalizedKeys = normalizeKeys(keys);
	const conflicts: BindingConflict[] = [];

	for (const [otherAction, actionEntry] of contextEntry.actions) {
		if (otherAction === actionName) continue;
		for (const key of normalizedKeys) {
			if (actionEntry.keys.includes(key)) {
				conflicts.push({ actionName: otherAction, key });
			}
		}
	}

	return conflicts;
}

export function ListenForInput(
	callback: (key: Enum.KeyCode) => void,
	options?: InputListenerOptions,
): () => void {
	let disconnected = false;

	const validInputTypes = options?.inputTypes ?? [
		Enum.UserInputType.Keyboard,
		Enum.UserInputType.Gamepad1,
	];

	const ignoreKeys = options?.ignoreKeys;

	const connection = UserInputService.InputBegan.Connect((input, gameProcessed) => {
		if (disconnected) return;
		if (gameProcessed && !options?.allowGameProcessed) return;

		let validType = false;
		for (const inputType of validInputTypes) {
			if (input.UserInputType === inputType) {
				validType = true;
				break;
			}
		}
		if (!validType) return;

		if (ignoreKeys && ignoreKeys.includes(input.KeyCode)) {
			return;
		}

		disconnected = true;
		connection.Disconnect();
		callback(input.KeyCode);
	});

	return () => {
		if (!disconnected) {
			disconnected = true;
			connection.Disconnect();
		}
	};
}