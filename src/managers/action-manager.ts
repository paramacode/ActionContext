import { GetRegistry } from "../core/registry";
import type { ActionInstance, EventHandler, Registry, TriggerType } from "../types";

function getSignal(action: InputAction, trigger: TriggerType) {
	if (trigger === "began") return action.Pressed;
	if (trigger === "ended") return action.Released;
	return action.StateChanged;
}

function connectHandler(handler: EventHandler, actionEntry: ActionInstance): void {
	const signal = getSignal(actionEntry.instance, handler.type);
	const connection = signal.Connect(handler.callback as () => void);
	actionEntry.connections.push(connection);
	handler.connections.push(connection);
}

function connectPendingHandlers(
	registry: Registry,
	actionName: string,
	actionEntry: ActionInstance,
): void {
	const handlers = registry.handlers.get(actionName);
	if (!handlers) return;

	for (const handler of handlers) {
		connectHandler(handler, actionEntry);
	}
}

export function CreateAction(contextId: string, actionName: string): InputAction | undefined {
	const registry = GetRegistry();
	const contextEntry = registry.contexts.get(contextId);

	if (!contextEntry) {
		warn(`Context '${contextId}' not found`);
		return undefined;
	}

	// Destroy existing action with same name in this context
	const existing = contextEntry.actions.get(actionName);
	if (existing) {
		existing.connections.forEach((c) => c.Disconnect());
		existing.instance.Destroy();
	}

	const action = new Instance("InputAction");
	action.Name = actionName;
	action.Enabled = true;
	action.Parent = contextEntry.instance;

	const actionEntry: ActionInstance = {
		instance: action,
		connections: [],
		keys: [],
	};

	contextEntry.actions.set(actionName, actionEntry);
	connectPendingHandlers(registry, actionName, actionEntry);

	return action;
}

export function On(
	actionName: string,
	triggerType: TriggerType,
	callback: () => void,
): () => void {
	const registry = GetRegistry();

	if (!registry.handlers.has(actionName)) {
		registry.handlers.set(actionName, []);
	}

	const handler: EventHandler = { type: triggerType, callback, connections: [] };
	registry.handlers.get(actionName)!.push(handler);

	// Connect to all existing action instances with this name across all contexts
	for (const [, contextEntry] of registry.contexts) {
		const actionEntry = contextEntry.actions.get(actionName);
		if (actionEntry) {
			connectHandler(handler, actionEntry);
		}
	}

	return () => {
		for (const connection of handler.connections) {
			connection.Disconnect();
		}
		handler.connections = [];

		const handlers = registry.handlers.get(actionName);
		if (handlers) {
			const index = handlers.indexOf(handler);
			if (index !== -1) {
				handlers.remove(index);
			}
			if (handlers.isEmpty()) {
				registry.handlers.delete(actionName);
			}
		}
	};
}