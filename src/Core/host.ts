import { Players } from "@rbxts/services";

let _host: Folder | undefined;

export function getHost(): Folder {
	if (_host) return _host;

	const localPlayer = Players.LocalPlayer;
	if (!localPlayer) error("[InputIntent]: requires LocalPlayer (client only)");

	const playerScripts = localPlayer.WaitForChild("PlayerScripts") as PlayerScripts;

	let host = playerScripts.FindFirstChild("InputIntent") as Folder | undefined;
	if (!host) {
		host = new Instance("Folder");
		host.Name = "InputIntent";
		host.Parent = playerScripts;
	}

	_host = host;
	return host;
}
