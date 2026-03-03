---
sidebar_position: 1
---

# Introduction

**ActionContext** is a lightweight input orchestration library for Roblox, built on top of the modern **Input Action System (IAS)**. It provides a declarative, context-driven API to define, bind, activate, and rebind input actions at runtime without touching low-level services like `UserInputService` or `ContextActionService`.

## Why ActionContext?

Traditional Roblox input handling scatters keybind logic across scripts, tightly couples hardware keys to gameplay code, and makes runtime rebinding painful. ActionContext solves this with three core ideas:

- **Contexts** -> Group related actions (e.g. `"Gameplay"`, `"Menu"`, `"Vehicle"`) and activate/deactivate them based on game state.
- **Actions** -> Named gameplay intents (`"Jump"`, `"Shoot"`, `"Reload"`) that are decoupled from physical keys.
- **Bindings** -> Map hardware keys to actions. Rebind at runtime without destroying or reconnecting anything.

## How it works

Under the hood, ActionContext creates real `InputContext`, `InputAction`, and `InputBinding` instances from Roblox's IAS. Your code never touches those directly, you work with names and callbacks.

## At a glance

| Feature | Description |
|:---:|:---:|
| **Builder API** | Define contexts and actions with a clean callback pattern |
| **Runtime rebinding** | Change keys without destroying actions or events |
| **Exclusive activation** | Switch contexts atomically (e.g. gameplay → menu) |
| **Introspection** | Query active contexts, actions, and bindings at any time |
| **Auto-wiring** | Register event handlers before or after creating actions |
| **Feature detection** | Gracefully degrades if IAS is unavailable |
