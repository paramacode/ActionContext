import type { Registry } from "../Types";

const registry: Registry = {
	contexts: new Map(),
	handlers: new Map(),
	iasAvailable: false,
};

export function Initialize(): boolean {
	const [success] = pcall(() => {
		const test = new Instance("InputContext");
		test.Destroy();
	});
	registry.iasAvailable = success;
	return success;
}

export function GetRegistry(): Registry {
	return registry;
}
