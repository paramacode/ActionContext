export type TriggerType = "began" | "ended" | "changed";

export interface ActionInstance {
	instance: InputAction;
	connections: RBXScriptConnection[];
	keys: Enum.KeyCode[];
}

export interface ContextEntry {
	instance: InputContext;
	actions: Map<string, ActionInstance>;
}

export interface EventHandler {
	type: TriggerType;
	callback: () => void;
	connections: RBXScriptConnection[];
}

export interface ContextOptions {
	override?: boolean;
}

export interface Registry {
	contexts: Map<string, ContextEntry>;
	handlers: Map<string, EventHandler[]>;
	iasAvailable: boolean;
}

export interface ActionBuilder {
	bind(keys: Enum.KeyCode | Enum.KeyCode[]): ActionBuilder;
}

export interface ContextBuilder {
	action(name: string): ActionBuilder;
}

export type ActionProfile = ReadonlyMap<string, Enum.KeyCode | Enum.KeyCode[]>;