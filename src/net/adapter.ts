import { registry } from "../core/registry";

import type { Action } from "../action/action";
import type { ClientToServer, ServerToClient } from "../types";

interface NetAttachOptions {
	reconcileSeconds?: number;
}

const _pending = new Map<number, { action: Action; timer?: thread }>();

let _send: ((message: ClientToServer) => void) | undefined;
let _sequenceId = 0;

export function setTransport(send: (message: ClientToServer) => void): void {
	_send = send;
}

export function attach(action: Action, options?: NetAttachOptions): void {
	const reconcile = options?.reconcileSeconds ?? 0;

	action._net = {
		start: (action: Action) => {
			const sequence = ++_sequenceId;
			_dispatch({ event: "start", id: action.id, sequence: sequence, at: action.pressedAt });
			if (reconcile > 0) _schedule(sequence, action, reconcile);
		},

		release: (action: Action) => {
			const sequence = ++_sequenceId;
			_dispatch({ event: "release", id: action.id, sequence: sequence, at: action.releasedAt, held: action.holdDuration });
		},

		cancel: (action: Action, reason?: string) => {
			const sequence = ++_sequenceId;
			_dispatch({ event: "cancel", id: action.id, sequence: sequence, reason });
		},
	};
}

export function detach(action: Action): void {
	action._net = undefined;
}

export function receive(message: ServerToClient): void {
	if (message.event === "ack") {
		_clear(message.sequence);
	} else if (message.event === "deny") {
		const pendingId = _pending.get(message.sequence);
		if (!pendingId) return;

		_clear(message.sequence);

		pendingId.action.cancel(message.reason);
	} else if (message.event === "interrupt") {
		registry.actionsById.get(message.id)?.interrupt();
	} else if (message.event === "complete") {
		registry.actionsById.get(message.id)?.complete();
	}
}

function _dispatch(message: ClientToServer): void {
	if (_send === undefined) error("[InputIntent]: no net transport registered");
	_send(message);
}

function _schedule(sequence: number, action: Action, seconds: number): void {
	const timer = task.delay(seconds, () => {
		if (!_pending.has(sequence)) return;
		_pending.delete(sequence);
		if (action.isHeld()) action.cancel("net:timeout");
	});
	_pending.set(sequence, { action, timer });
}

function _clear(sequence: number): void {
	const pendingId = _pending.get(sequence);
	if (!pendingId) return;
	if (pendingId.timer !== undefined) task.cancel(pendingId.timer);

	_pending.delete(sequence);
}
