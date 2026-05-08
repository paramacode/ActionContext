/// <reference types="@rbxts/testez/globals" />

import { Input } from "../index";

export = () => {
	afterEach(() => Input.reset());

	describe("context", () => {
		it("creates and is idempotent", () => {
			const a = Input.context("combat");
			const b = Input.context("combat");
			expect(a).to.equal(b);
		});

		it("updates priority on repeat call", () => {
			Input.context("combat", { priority: 10 });
			Input.context("combat", { priority: 50 });
			expect(Input.context("combat").priority).to.equal(50);
		});

		it("starts disabled and toggles", () => {
			const ctx = Input.context("combat");
			expect(ctx.enabled).to.equal(false);
			ctx.enable();
			expect(ctx.enabled).to.equal(true);
			ctx.disable();
			expect(ctx.enabled).to.equal(false);
		});

		it("destroy removes the context", () => {
			Input.context("combat");
			Input.context("combat").destroy();
			expect(Input.contexts().includes("combat")).to.equal(false);
		});
	});

	describe("action", () => {
		it("returns a stable handle", () => {
			const ctx = Input.context("combat");
			const a = ctx.action("Barrage", { bindings: [Enum.KeyCode.E] });
			const b = ctx.action("Barrage");
			expect(a).to.equal(b);
		});

		it("exposes id, name, contextId, state, keys", () => {
			const a = Input.context("combat").action("Barrage", { bindings: [Enum.KeyCode.E] });
			expect(a.id).to.equal("combat:Barrage");
			expect(a.name).to.equal("Barrage");
			expect(a.contextId).to.equal("combat");
			expect(a.state).to.equal("idle");
			expect(a.isHeld()).to.equal(false);
			expect(a.keys[0]).to.equal(Enum.KeyCode.E);
		});

		it("chains subscriptions", () => {
			const a = Input.context("combat")
				.action("Barrage", { bindings: [Enum.KeyCode.E] })
				.onStart(() => {})
				.onHold(() => {})
				.onRelease(() => {});
			expect(a.name).to.equal("Barrage");
		});

		it("Input.action looks up by id", () => {
			const a = Input.context("combat").action("Barrage", { bindings: [Enum.KeyCode.E] });
			expect(Input.action("combat:Barrage")).to.equal(a);
			expect(Input.action("nope")).never.to.be.ok();
		});

		it("rebind updates keys", () => {
			const a = Input.context("combat").action("Barrage", { bindings: [Enum.KeyCode.E] });
			Input.rebind(a, [Enum.KeyCode.Q]);
			expect(a.keys[0]).to.equal(Enum.KeyCode.Q);
		});

		it("reset returns to defaults", () => {
			const a = Input.context("combat").action("Barrage", { bindings: [Enum.KeyCode.E] });
			Input.rebind(a, [Enum.KeyCode.Q]);
			Input.resetBindings(a);
			expect(a.keys[0]).to.equal(Enum.KeyCode.E);
		});

		it("findConflicts reports overlapping keys", () => {
			const ctx = Input.context("combat");
			ctx.action("A", { bindings: [Enum.KeyCode.E] });
			const b = ctx.action("B", { bindings: [Enum.KeyCode.Q] });
			const conflicts = Input.findConflicts(b, Enum.KeyCode.E);
			expect(conflicts.size()).to.equal(1);
			expect(conflicts[0].actionName).to.equal("A");
		});
	});

	describe("state machine", () => {
		it("starts and releases", () => {
			const a = Input.context("combat").action("Swing", { bindings: [Enum.KeyCode.E] });
			let started = 0;
			let released = 0;
			a.onStart(() => started++).onRelease(() => released++);
			a._tryStart();
			expect(a.state).to.equal("started");
			expect(a.isHeld()).to.equal(true);
			expect(started).to.equal(1);
			a._handleReleased();
			expect(a.state).to.equal("released");
			expect(released).to.equal(1);
		});

		it("cancel transitions to cancelled", () => {
			const a = Input.context("combat").action("Swing", { bindings: [Enum.KeyCode.E] });
			let cancelled = false;
			a.onCancel(() => (cancelled = true));
			a._tryStart();
			a.cancel();
			expect(a.state).to.equal("cancelled");
			expect(cancelled).to.equal(true);
		});

		it("complete is distinct from release", () => {
			const a = Input.context("combat").action("Swing", { bindings: [Enum.KeyCode.E] });
			let completed = false;
			a.onComplete(() => (completed = true));
			a._tryStart();
			a.complete();
			expect(a.state).to.equal("completed");
			expect(completed).to.equal(true);
		});

		it("buffers presses during cooldown when buffer > 0", () => {
			const a = Input.context("combat").action("Heavy", {
				bindings: [Enum.KeyCode.MouseLeftButton],
				cooldownTag: "combat:heavy",
				buffer: 0.2,
			});
			Input.cooldown.set("combat:heavy", 1);
			let buffered = false;
			a.onBuffer(() => (buffered = true));
			a._tryStart();
			expect(a.state).to.equal("buffered");
			expect(buffered).to.equal(true);
		});

		it("drops press during cooldown without buffer", () => {
			const a = Input.context("combat").action("Quick", {
				bindings: [Enum.KeyCode.Q],
				cooldownTag: "combat:q",
			});
			Input.cooldown.set("combat:q", 1);
			a._tryStart();
			expect(a.state).to.equal("idle");
		});

		it("starts immediately with no cooldown", () => {
			const a = Input.context("combat").action("Quick", { bindings: [Enum.KeyCode.Q] });
			a._tryStart();
			expect(a.state).to.equal("started");
		});

		it("interrupt only fires when interruptible", () => {
			const a = Input.context("combat").action("Hard", {
				bindings: [Enum.KeyCode.E],
				interruptible: false,
			});
			a._tryStart();
			a.interrupt();
			expect(a.state).to.equal("started");

			const b = Input.context("combat").action("Soft", {
				bindings: [Enum.KeyCode.Q],
				interruptible: true,
			});
			b._tryStart();
			b.interrupt();
			expect(b.state).to.equal("interrupted");
		});
	});

	describe("stack", () => {
		it("blocking context interrupts held actions", () => {
			const combat = Input.context("combat", { priority: 10 });
			const menus = Input.context("menus", { priority: 100, blocks: true });
			const swing = combat.action("Swing", {
				bindings: [Enum.KeyCode.E],
				interruptible: true,
			});
			menus.action("Close", { bindings: [Enum.KeyCode.E] });
			combat.enable();
			swing._tryStart();
			expect(swing.isHeld()).to.equal(true);
			menus.enable();
			expect(swing.state).to.equal("interrupted");
		});

		it("push enables and pop disables", () => {
			Input.context("menus", { priority: 100, blocks: true });
			Input.push("menus");
			expect(Input.context("menus").enabled).to.equal(true);
			Input.pop("menus");
			expect(Input.context("menus").enabled).to.equal(false);
		});
	});

	describe("profile", () => {
		it("exports and re-imports", () => {
			const ctx = Input.context("combat");
			ctx.action("Swing", { bindings: [Enum.KeyCode.E] });
			ctx.action("Block", { bindings: [Enum.KeyCode.Q] });
			const profile = Input.exportProfile(ctx);
			Input.rebind(ctx.action("Swing"), [Enum.KeyCode.X]);
			Input.importProfile(ctx, profile);
			expect(ctx.action("Swing").keys[0]).to.equal(Enum.KeyCode.E);
		});
	});

	describe("introspection", () => {
		it("contexts() lists all", () => {
			Input.context("a");
			Input.context("b");
			expect(Input.contexts().size()).to.equal(2);
		});

		it("isAvailable returns boolean", () => {
			expect(typeOf(Input.isAvailable())).to.equal("boolean");
		});
	});
};
