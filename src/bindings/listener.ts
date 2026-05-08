import { UserInputService } from "@rbxts/services";

import type { InputListenerOptions } from "../types";

const _defaultTypes: ReadonlyArray<Enum.UserInputType> = [
	Enum.UserInputType.Keyboard,
	Enum.UserInputType.Gamepad1,
];

export function listenForInput(
	callback: (key: Enum.KeyCode) => void,
	options?: InputListenerOptions,
): () => void {
	let done = false;

	const types = options?.inputTypes ?? _defaultTypes;
	const ignore = options?.ignore;

	const connection = UserInputService.InputBegan.Connect((input: InputObject, gameProcessed: boolean) => {
		if (done) return;
		if (gameProcessed && !options?.allowGameProcessed) return;

		let valid = false;

		for (const thisType of types) if (input.UserInputType === thisType) {
			valid = true;
			break;
		}

		if (!valid) return;
		if (ignore !== undefined && ignore.includes(input.KeyCode)) return;

		done = true;
		connection.Disconnect();

		callback(input.KeyCode);
	});

	return () => {
		if (done) return;
		done = true;

		connection.Disconnect();
	};
}
