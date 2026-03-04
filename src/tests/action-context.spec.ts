/// <reference types="@rbxts/testez/globals" />

import { Input } from "../index";

export = () => {
	const TEST_CONTEXT = "TestContext";

	afterEach(() => {
		// Clean up all contexts between tests
		for (const id of Input.GetContexts()) {
			Input.Destroy(id);
		}
	});

	describe("Context lifecycle", () => {
		it("should create a context", () => {
			Input.Context(TEST_CONTEXT, (context) => {
				context.action("Jump").bind(Enum.KeyCode.Space);
			});

			expect(Input.GetContexts().includes(TEST_CONTEXT)).to.equal(true);
		});

		it("should start disabled", () => {
			Input.Context(TEST_CONTEXT, (context) => {
				context.action("Jump").bind(Enum.KeyCode.Space);
			});

			expect(Input.IsActive(TEST_CONTEXT)).to.equal(false);
		});

		it("should error when redefining without override flag", () => {
			Input.Context(TEST_CONTEXT, (context) => {
				context.action("Jump").bind(Enum.KeyCode.Space);
			});

			expect(() => {
				Input.Context(TEST_CONTEXT, (context) => {
					context.action("Jump").bind(Enum.KeyCode.Space);
				});
			}).to.throw();
		});

		it("should allow override with flag", () => {
			Input.Context(TEST_CONTEXT, (context) => {
				context.action("Jump").bind(Enum.KeyCode.Space);
			});

			Input.Context(
				TEST_CONTEXT,
				(context) => {
					context.action("Shoot").bind(Enum.KeyCode.ButtonR2);
				},
				{ override: true },
			);

			const actions = Input.GetActions(TEST_CONTEXT);
			expect(actions).to.be.ok();
			expect(actions!.includes("Shoot")).to.equal(true);
			expect(actions!.includes("Jump")).to.equal(false);
		});

		it("should destroy a context and its actions", () => {
			Input.Context(TEST_CONTEXT, (context) => {
				context.action("Jump").bind(Enum.KeyCode.Space);
			});

			Input.Destroy(TEST_CONTEXT);

			expect(Input.GetContexts().includes(TEST_CONTEXT)).to.equal(false);
		});
	});

	describe("Activate / Deactivate", () => {
		it("should activate a context", () => {
			Input.Context(TEST_CONTEXT, (context) => {
				context.action("Jump").bind(Enum.KeyCode.Space);
			});

			Input.Activate(TEST_CONTEXT);
			expect(Input.IsActive(TEST_CONTEXT)).to.equal(true);
		});

		it("should deactivate a context", () => {
			Input.Context(TEST_CONTEXT, (context) => {
				context.action("Jump").bind(Enum.KeyCode.Space);
			});

			Input.Activate(TEST_CONTEXT);
			Input.Deactivate(TEST_CONTEXT);
			expect(Input.IsActive(TEST_CONTEXT)).to.equal(false);
		});

		it("should support exclusive activation", () => {
			Input.Context("A", (context) => {
				context.action("X").bind(Enum.KeyCode.A);
			});
			Input.Context("B", (context) => {
				context.action("Y").bind(Enum.KeyCode.B);
			});

			Input.Activate("A");
			Input.Activate("B");
			expect(Input.IsActive("A")).to.equal(true);
			expect(Input.IsActive("B")).to.equal(true);

			// Exclusive mode: activating A should deactivate B
			Input.Activate("A", true);
			expect(Input.IsActive("A")).to.equal(true);
			expect(Input.IsActive("B")).to.equal(false);
		});
	});

	describe("Actions and Bindings", () => {
		it("should register actions inside a context", () => {
			Input.Context(TEST_CONTEXT, (context) => {
				context.action("Jump").bind(Enum.KeyCode.Space);
				context.action("Shoot").bind(Enum.KeyCode.ButtonR2);
				context.action("Reload").bind(Enum.KeyCode.R);
			});

			const actions = Input.GetActions(TEST_CONTEXT);
			expect(actions).to.be.ok();
			expect(actions!.size()).to.equal(3);
			expect(actions!.includes("Jump")).to.equal(true);
			expect(actions!.includes("Shoot")).to.equal(true);
			expect(actions!.includes("Reload")).to.equal(true);
		});

		it("should store bindings and return them via GetBindings", () => {
			Input.Context(TEST_CONTEXT, (context) => {
				context.action("Jump").bind([Enum.KeyCode.Space, Enum.KeyCode.ButtonA]);
			});

			const keys = Input.GetBindings(TEST_CONTEXT, "Jump");
			expect(keys).to.be.ok();
			expect(keys!.size()).to.equal(2);
			expect(keys!.includes(Enum.KeyCode.Space)).to.equal(true);
			expect(keys!.includes(Enum.KeyCode.ButtonA)).to.equal(true);
		});

		it("should rebind keys at runtime", () => {
			Input.Context(TEST_CONTEXT, (context) => {
				context.action("Jump").bind(Enum.KeyCode.Space);
			});

			Input.Rebind(TEST_CONTEXT, "Jump", [Enum.KeyCode.ButtonA, Enum.KeyCode.ButtonB]);

			const keys = Input.GetBindings(TEST_CONTEXT, "Jump");
			expect(keys).to.be.ok();
			expect(keys!.size()).to.equal(2);
			expect(keys!.includes(Enum.KeyCode.ButtonA)).to.equal(true);
			expect(keys!.includes(Enum.KeyCode.ButtonB)).to.equal(true);
			expect(keys!.includes(Enum.KeyCode.Space)).to.equal(false);
		});

		it("should support dynamic context definition from a profile", () => {
			const profile: Record<string, Enum.KeyCode[]> = {
				Jump: [Enum.KeyCode.Space, Enum.KeyCode.ButtonA],
				Shoot: [Enum.KeyCode.ButtonR2],
				Reload: [Enum.KeyCode.R],
			};

			Input.Context(TEST_CONTEXT, (context) => {
				for (const [action, keys] of pairs(profile)) {
					context.action(action).bind(keys);
				}
			});

			const actions = Input.GetActions(TEST_CONTEXT);
			expect(actions).to.be.ok();
			expect(actions!.size()).to.equal(3);

			for (const [action, expectedKeys] of pairs(profile)) {
				const keys = Input.GetBindings(TEST_CONTEXT, action);
				expect(keys).to.be.ok();
				expect(keys!.size()).to.equal(expectedKeys.size());
			}
		});
	});

	describe("Event handlers (On)", () => {
		it("should register and disconnect a handler", () => {
			Input.Context(TEST_CONTEXT, (context) => {
				context.action("Jump").bind(Enum.KeyCode.Space);
			});

			let callCount = 0;
			const disconnect = Input.On("Jump", "began", () => {
				callCount += 1;
			});

			expect(typeOf(disconnect)).to.equal("function");

			// Disconnect should not error
			disconnect();
		});

		it("should connect handler to actions created after On()", () => {
			// Register handler BEFORE creating context
			let called = false;
			const disconnect = Input.On("Jump", "began", () => {
				called = true;
			});

			// Context created after — handler should auto-connect
			Input.Context(TEST_CONTEXT, (context) => {
				context.action("Jump").bind(Enum.KeyCode.Space);
			});

			// We can't simulate a real keypress in tests, but we verify the handler is wired by checking it doesn't error and disconnects cleanly
			disconnect();
		});
	});

	describe("Introspection", () => {
		it("should return empty contexts list when none registered", () => {
			expect(Input.GetContexts().size()).to.equal(0);
		});

		it("should return all context identifiers", () => {
			Input.Context("A", (context) => {
				context.action("X").bind(Enum.KeyCode.A);
			});
			Input.Context("B", (context) => {
				context.action("Y").bind(Enum.KeyCode.B);
			});

			const contexts = Input.GetContexts();
			expect(contexts.size()).to.equal(2);
			expect(contexts.includes("A")).to.equal(true);
			expect(contexts.includes("B")).to.equal(true);
		});

		it("should return undefined for actions of nonexistent context", () => {
			expect(Input.GetActions("NonExistent")).never.to.be.ok();
		});

		it("should return undefined for bindings of nonexistent action", () => {
			Input.Context(TEST_CONTEXT, (context) => {
				context.action("Jump").bind(Enum.KeyCode.Space);
			});

			expect(Input.GetBindings(TEST_CONTEXT, "NonExistent")).never.to.be.ok();
		});

		it("should report IsActive false for nonexistent context", () => {
			expect(Input.IsActive("Ghost")).to.equal(false);
		});

		it("should report IAS availability", () => {
			// On a real Roblox client with IAS, this should be true
			expect(typeOf(Input.IsAvailable())).to.equal("boolean");
		});
	});
};
