import { GetRegistry } from "./registry";

export function IsAvailable(): boolean {
	const registry = GetRegistry();
	if (!registry.iasAvailable) {
		warn("Input Action System (IAS) is not available on this platform.");
		return false;
	}
	return true;
}