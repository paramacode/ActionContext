import type { IasContext } from "../types";

export function createIasContext(name: string, parent: Instance): IasContext {
	const context = new Instance("InputContext");
	context.Name = name;
	context.Enabled = false;
	context.Parent = parent;

	return {
		setEnabled(enabled: boolean) {
			context.Enabled = enabled;
		},

		createAction(actionName) {
			const action = new Instance("InputAction");
			action.Name = actionName;
			action.Enabled = true;
			action.Parent = context;

			return {
				pressed: action.Pressed,
				released: action.Released,

				bind(keys: ReadonlyArray<Enum.KeyCode>) {
					for (const child of action.GetChildren()) {
						if (child.IsA("InputBinding")) child.Destroy();
					}

					for (const key of keys) {
						const binding = new Instance("InputBinding");
						binding.KeyCode = key;
						binding.Parent = action;
					}
				},

				destroy() {
					action.Destroy();
				},
			};
		},

		destroy() {
			context.Destroy();
		},
	};
}

export function isIasAvailable(): boolean {
	const [success] = pcall(() => {
		const probe = new Instance("InputContext");
		probe.Destroy();
	});
	return success;
}
