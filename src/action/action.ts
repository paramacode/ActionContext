import { registry, actionKey } from "../core/registry";
import * as cooldown from "./cooldown";

import type { IasAction, ActionConfig, ActionState } from "../types";

type Listener = (action: Action) => void;
type HoldListener = (action: Action, deltaTime: number) => void;

export interface NetHooks {
	start?: (action: Action) => void;
	release?: (action: Action) => void;
	cancel?: (action: Action, reason?: string) => void;
}

export class Action {
	readonly id: string;

	state: ActionState = "idle";
	pressedAt = 0;
	releasedAt = 0;
	holdDuration = 0;
	keys: ReadonlyArray<Enum.KeyCode> = [];
	defaultKeys?: ReadonlyArray<Enum.KeyCode>;
	config: ActionConfig;

	_ias: IasAction;
	_destroyed = false;
	_net?: NetHooks;
	_bufferUntil = 0;
	_pressedFrame = -1;
	_releasedFrame = -1;
	_consumed = false;
	_bufferedTap = false;

	_startHandlers?: Listener[];
	_holdHandlers?: HoldListener[];
	_releaseHandlers?: Listener[];
	_cancelHandlers?: Listener[];
	_interruptHandlers?: Listener[];
	_bufferHandlers?: Listener[];
	_completeHandlers?: Listener[];
	_connections: RBXScriptConnection[] = [];

	constructor(
		readonly contextId: string,
		readonly name: string,

		config: ActionConfig,
		ias: IasAction,
	) {
		this.id = actionKey(contextId, name);

		this.config = config;
		this._ias = ias;

		this._connections.push(ias.pressed.Connect(() => this._handlePressed()));
		this._connections.push(ias.released.Connect(() => this._handleReleased()));

		if (config.bindings) {
			this.keys = [...config.bindings];
			this.defaultKeys = [...config.bindings];

			ias.bind(config.bindings);
		}
	}

	isHeld(): boolean {
		return this.state === "started" || this.state === "holding";
	}

	justPressed(): boolean {
		return this._pressedFrame === registry.frame && !this._consumed;
	}

	justReleased(): boolean {
		return this._releasedFrame === registry.frame && !this._consumed;
	}

	consume(): void {
		this._consumed = true;
	}

	cancel(reason?: string): void {
		if (this._destroyed) return;

		const stateIs = this.state;
		if (stateIs !== "started" && stateIs !== "holding" && stateIs !== "buffered") return;

		registry.activeHolds.delete(this);
		registry.buffered.delete(this);

		this.state = "cancelled";
		this._bufferedTap = false;

		registry.transient.add(this);

		this._fire(this._cancelHandlers);
		this._net?.cancel?.(this, reason);
	}

	complete(): void {
		if (this._destroyed) return;

		const stateIs = this.state;
		if (stateIs !== "started" && stateIs !== "holding") return;

		registry.activeHolds.delete(this);

		this.state = "completed";

		registry.transient.add(this);

		this._fire(this._completeHandlers);
	}

	interrupt(): void {
		if (this._destroyed || !this.config.interruptible) return;

		const stateIs = this.state;
		if (stateIs !== "started" && stateIs !== "holding" && stateIs !== "buffered") return;

		registry.activeHolds.delete(this);
		registry.buffered.delete(this);

		this.state = "interrupted";
		this._bufferedTap = false;

		registry.transient.add(this);

		this._fire(this._interruptHandlers);
	}

	onStart(handler: Listener): this {
		(this._startHandlers ??= []).push(handler);
		return this;
	}

	onHold(handler: HoldListener): this {
		(this._holdHandlers ??= []).push(handler);
		return this;
	}

	onRelease(handler: Listener): this {
		(this._releaseHandlers ??= []).push(handler);
		return this;
	}

	onCancel(handler: Listener): this {
		(this._cancelHandlers ??= []).push(handler);
		return this;
	}

	onInterrupt(handler: Listener): this {
		(this._interruptHandlers ??= []).push(handler);
		return this;
	}

	onBuffer(handler: Listener): this {
		(this._bufferHandlers ??= []).push(handler);
		return this;
	}

	onComplete(handler: Listener): this {
		(this._completeHandlers ??= []).push(handler);
		return this;
	}

	_setKeys(keys: ReadonlyArray<Enum.KeyCode>): void {
		this.keys = [...keys];
		this._ias.bind(keys);
	}

	_handlePressed(): void {
		if (this._destroyed) return;

		const isState = this.state;
		if (isState === "started" || isState === "holding" || isState === "buffered") return;

		if (_isSuppressed(this)) return;

		this._tryStart();
	}

	_handleReleased(): void {
		if (this._destroyed) return;

		const isState = this.state;
		if (isState === "buffered") {
			this._bufferedTap = true;
			return;
		}
		if (isState !== "started" && isState !== "holding") return;

		this.releasedAt = os.clock();
		this._releasedFrame = registry.frame;
		this.holdDuration = this.releasedAt - this.pressedAt;

		registry.activeHolds.delete(this);

		this.state = "released";

		registry.transient.add(this);

		this._fire(this._releaseHandlers);
		this._net?.release?.(this);
	}

	_tryStart(): void {
		if (cooldown.remaining(this.config.cooldownTag) > 0) {
			const window = this.config.buffer ?? 0;
			if (window <= 0) return;

			this.state = "buffered";
			this._bufferUntil = os.clock() + window;
			this._bufferedTap = false;

			registry.buffered.add(this);

			this._fire(this._bufferHandlers);
			return;
		}

		this.pressedAt = os.clock();
		this._pressedFrame = registry.frame;
		this._releasedFrame = -1;
		this.holdDuration = 0;
		this._consumed = false;
		this.state = "started";

		registry.activeHolds.add(this);
		registry.transient.add(this);

		this._fire(this._startHandlers);
		this._net?.start?.(this);
	}

	_tickHold(deltaTime: number, now: number): void {
		this.holdDuration = now - this.pressedAt;

		const handlers = this._holdHandlers;
		if (!handlers) return;

		for (const handler of handlers) {
			const [ok, err] = pcall(handler, this, deltaTime);
			if (!ok) warn(`[InputIntent] hold handler error in ${this.id}: ${err}`);
		}
	}

	_advanceTransient(): void {
		const isState = this.state;
		if (isState === "started") this.state = "holding";
		else if (
			isState === "released" ||
			isState === "cancelled" ||
			isState === "completed" ||
			isState === "interrupted"
		) {
			this.state = "idle";
		}
		registry.transient.delete(this);
	}

	_tryFlushBuffer(now: number): void {
		if (cooldown.remaining(this.config.cooldownTag) <= 0) {
			registry.buffered.delete(this);
			const tap = this._bufferedTap;
			this._bufferedTap = false;
			this._tryStart();
			if (tap && this.state === "started") this._handleReleased();
		} else if (now > this._bufferUntil) {
			registry.buffered.delete(this);
			this._bufferedTap = false;
			this.state = "idle";
		}
	}

	_destroy(): void {
		if (this._destroyed) return;
		this._destroyed = true;

		registry.activeHolds.delete(this);
		registry.buffered.delete(this);
		registry.transient.delete(this);
		registry.actionsById.delete(this.id);

		for (const connection of this._connections) connection.Disconnect();

		this._connections = [];
		this._ias.destroy();
		this._startHandlers = undefined;
		this._holdHandlers = undefined;
		this._releaseHandlers = undefined;
		this._cancelHandlers = undefined;
		this._interruptHandlers = undefined;
		this._bufferHandlers = undefined;
		this._completeHandlers = undefined;
		this._net = undefined;
	}

	_fire(handlers: Listener[] | undefined): void {
		if (!handlers) return;
		for (const handler of handlers) {
			const [ok, err] = pcall(handler, this);
			if (!ok) warn(`[InputIntent] handler error in ${this.id}: ${err}`);
		}
	}
}

let _suppressionCheck: (action: Action) => boolean = () => false;

export function _setSuppressionCheck(handler: (action: Action) => boolean): void {
	_suppressionCheck = handler;
}

function _isSuppressed(action: Action): boolean {
	return _suppressionCheck(action);
}
