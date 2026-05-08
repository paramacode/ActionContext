export type ClientToServer =
	| { event: "start"; id: string; sequence: number; at: number }
	| { event: "release"; id: string; sequence: number; at: number; held: number }
	| { event: "cancel"; id: string; sequence: number; reason?: string };

export type ServerToClient =
	| { event: "ack"; sequence: number }
	| { event: "deny"; sequence: number; reason?: string }
	| { event: "interrupt"; id: string; reason?: string }
	| { event: "complete"; id: string };

export type ActionState =
	| "idle"
	| "buffered"
	| "started"
	| "holding"
	| "released"
	| "completed"
	| "cancelled"
	| "interrupted";

export interface ActionConfig {
	bindings?: ReadonlyArray<Enum.KeyCode>;
	buffer?: number;
	interruptible?: boolean;
	cooldownTag?: string;
}

export interface ContextConfig {
	priority?: number;
	blocks?: boolean | ReadonlyArray<string>;
}

export interface BindingConflict {
	contextId: string;
	actionName: string;
	key: Enum.KeyCode;
}

export interface IasAction {
	bind(keys: ReadonlyArray<Enum.KeyCode>): void;
	destroy(): void;

	readonly pressed: RBXScriptSignal;
	readonly released: RBXScriptSignal;
}

export interface IasContext {
	setEnabled(enabled: boolean): void;
	createAction(name: string): IasAction;
	destroy(): void;
}


export interface InputListenerOptions {
	allowGameProcessed?: boolean;
	ignore?: ReadonlyArray<Enum.KeyCode>;
	inputTypes?: ReadonlyArray<Enum.UserInputType>;
}

export type BindingProfile = ReadonlyMap<string, ReadonlyArray<Enum.KeyCode>>;
