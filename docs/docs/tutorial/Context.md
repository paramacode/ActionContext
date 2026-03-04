---
sidebar_position: 1
title: Context
---

# Context

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Define a group of related input actions. A context represents a gameplay state like `"Gameplay"`, `"Menu"`, or `"Vehicle"`, and contains all the actions relevant to that state.

Contexts start **disabled** by default. You must explicitly activate them.

---

### `Input.Context(identifier, builderOrProfile, options?)`

| Parameter | Type | Default | Description |
|:---:|:---:|:---:|:---:|
| `identifier` | `string` | - | Unique name for this context. |
| `builderOrProfile` | `((context: ContextBuilder) => void) \| ActionProfile` | - | A builder callback **or** an `ActionProfile` map. |
| `options` | `ContextOptions` | `undefined` | Optional configuration. |

#### ActionProfile

```ts
type ActionProfile = ReadonlyMap<string, Enum.KeyCode | Enum.KeyCode[]>
```

A `Map` that maps action names to their key bindings. When passed directly as the second argument, ActionContext creates all actions and bindings automatically — no builder callback needed.

#### ContextOptions

| Field | Type | Default | Description |
|:---:|:---:|:---:|:---:|
| `override` | `boolean` | `false` | If `true`, replaces an existing context with the same name. |

:::danger
If a context with the same identifier already exists and `override` is not `true`, an **error** will be thrown. This prevents accidental loss of bindings and connections in production.
:::

---

### Builder API

Inside the builder callback you receive a `ContextBuilder` with one method:

| Method | Returns | Description |
|:---:|:---:|:---:|
| `context.action(name)` | `ActionBuilder` | Creates a named action inside this context. |

The `ActionBuilder` exposes:

| Method | Returns | Description |
|:---:|:---:|:---:|
| `.bind(keys)` | `ActionBuilder` | Binds one or more `KeyCode` values. Chainable. |

---

### Basic usage

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    import { Input } from "@rbxts/actioncontext";

    Input.Context("Gameplay", (context) => {
        context.action("Jump").bind(Enum.KeyCode.Space);
        context.action("Shoot").bind(Enum.KeyCode.ButtonR2);
        context.action("Reload").bind(Enum.KeyCode.R);
    });
    ```
  </TabItem>
  <TabItem value="lua" label="Luau">
    ```lua
    local ActionContext = require(path.to.ActionContext)
    local Input = ActionContext.Input

    Input.Context("Gameplay", function(context)
        context.action("Jump").bind(Enum.KeyCode.Space)
        context.action("Shoot").bind(Enum.KeyCode.ButtonR2)
        context.action("Reload").bind(Enum.KeyCode.R)
    end)
    ```
  </TabItem>
</Tabs>

---

### Multiple bindings per action

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    Input.Context("Gameplay", (context) => {
        context.action("Jump").bind([Enum.KeyCode.Space, Enum.KeyCode.ButtonA]);
    });
    ```
  </TabItem>
  <TabItem value="lua" label="Luau">
    ```lua
    Input.Context("Gameplay", function(context)
        context.action("Jump").bind({ Enum.KeyCode.Space, Enum.KeyCode.ButtonA })
    end)
    ```
  </TabItem>
</Tabs>

---

### Dynamic definition from a player profile

Pass an `ActionProfile` (a `Map` of action names → key bindings) directly to `Input.Context` instead of a builder callback. ActionContext iterates the map internally — no manual looping required.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    import { Input, ActionProfile } from "@rbxts/actioncontext";

    const profile = new Map<string, Enum.KeyCode[]>([
        ["Jump", [Enum.KeyCode.Space, Enum.KeyCode.ButtonA]],
        ["Shoot", [Enum.KeyCode.ButtonR2]],
        ["Reload", [Enum.KeyCode.R]],
    ]);

    Input.Context("Gameplay", profile);
    ```
  </TabItem>
  <TabItem value="lua" label="Luau">
    ```lua
    local ActionContext = require(path.to.ActionContext)
    local Input = ActionContext.Input

    local profile = {
        Jump = { Enum.KeyCode.Space, Enum.KeyCode.ButtonA },
        Shoot = { Enum.KeyCode.ButtonR2 },
        Reload = { Enum.KeyCode.R },
    }

    Input.Context("Gameplay", profile)
    ```
  </TabItem>
</Tabs>

---

### Overriding an existing context

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    Input.Context("Gameplay", (context) => {
        context.action("Fly").bind(Enum.KeyCode.F);
    }, { override: true });
    ```
  </TabItem>
  <TabItem value="lua" label="Luau">
    ```lua
    Input.Context("Gameplay", function(context)
        context.action("Fly").bind(Enum.KeyCode.F)
    end, { override = true })
    ```
  </TabItem>
</Tabs>

---

### Destroying a context

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    Input.Destroy("Gameplay");
    ```
  </TabItem>
  <TabItem value="lua" label="Luau">
    ```lua
    Input.Destroy("Gameplay")
    ```
  </TabItem>
</Tabs>

Destroying a context disconnects all event handlers, destroys all `InputAction` and `InputBinding` instances, and removes it from the registry.
