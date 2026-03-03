---
sidebar_position: 5
title: Introspection
---

# Introspection

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Query the current state of contexts, actions, and bindings at runtime. These are **read-only** operations, they never mutate state.

---

### `Input.GetContexts()`

Returns all registered context identifiers.

**Returns:** `ReadonlyArray<string>`

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    const contexts = Input.GetContexts();
    // -> ["Gameplay", "Menu"]
    ```
  </TabItem>
  <TabItem value="lua" label="Luau">
    ```lua
    local contexts = Input.GetContexts()
    -- -> { "Gameplay", "Menu" }
    ```
  </TabItem>
</Tabs>

---

### `Input.GetActions(contextId)`

Returns all action names inside a context, or `undefined` if the context doesn't exist.

| Parameter | Type | Description |
|:---:|:---:|:---:|
| `contextId` | `string` | The context to query. |

**Returns:** `ReadonlyArray<string> | undefined`

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    const actions = Input.GetActions("Gameplay");
    // -> ["Jump", "Shoot", "Reload"]
    ```
  </TabItem>
  <TabItem value="lua" label="Luau">
    ```lua
    local actions = Input.GetActions("Gameplay")
    -- -> { "Jump", "Shoot", "Reload" }
    ```
  </TabItem>
</Tabs>

---

### `Input.GetBindings(contextId, actionName)`

Returns the current key bindings for a specific action, or `undefined` if the context or action doesn't exist.

| Parameter | Type | Description |
|:---:|:---:|:---:|
| `contextId` | `string` | The context that owns the action. |
| `actionName` | `string` | The action to query. |

**Returns:** `ReadonlyArray<Enum.KeyCode> | undefined`

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    const keys = Input.GetBindings("Gameplay", "Jump");
    // -> [Enum.KeyCode.Space, Enum.KeyCode.ButtonA]
    ```
  </TabItem>
  <TabItem value="lua" label="Luau">
    ```lua
    local keys = Input.GetBindings("Gameplay", "Jump")
    -- -> { Enum.KeyCode.Space, Enum.KeyCode.ButtonA }
    ```
  </TabItem>
</Tabs>

---

### `Input.IsActive(identifier)`

Returns whether a context is currently active (enabled).

| Parameter | Type | Description |
|:---:|:---:|:---:|
| `identifier` | `string` | The context to check. |

**Returns:** `boolean` - `false` if the context doesn't exist.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    if (Input.IsActive("Gameplay")) {
        print("Gameplay context is active");
    }
    ```
  </TabItem>
  <TabItem value="lua" label="Luau">
    ```lua
    if Input.IsActive("Gameplay") then
        print("Gameplay context is active")
    end
    ```
  </TabItem>
</Tabs>

---

### `Input.IsAvailable()`

Returns whether the Input Action System (IAS) is available on the current platform.

**Returns:** `boolean`

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    if (!Input.IsAvailable()) {
        warn("IAS not supported, falling back to legacy input");
    }
    ```
  </TabItem>
  <TabItem value="lua" label="Luau">
    ```lua
    if not Input.IsAvailable() then
        warn("IAS not supported, falling back to legacy input")
    end
    ```
  </TabItem>
</Tabs>

---

### Building a dynamic settings UI

Combine introspection methods to build a rebind menu that reads directly from ActionContext:

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    function buildRebindUI(contextId: string) {
        const actions = Input.GetActions(contextId);
        if (!actions) return;

        for (const action of actions) {
            const keys = Input.GetBindings(contextId, action);
            createRebindRow(action, keys ?? []);
        }
    }
    ```
  </TabItem>
  <TabItem value="lua" label="Luau">
    ```lua
    local function buildRebindUI(contextId)
        local actions = Input.GetActions(contextId)
        if not actions then return end

        for _, action in actions do
            local keys = Input.GetBindings(contextId, action)
            createRebindRow(action, keys or {})
        end
    end
    ```
  </TabItem>
</Tabs>
