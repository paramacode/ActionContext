---
sidebar_position: 4
title: Rebind
---

# Rebind

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Change the keys mapped to an action **at runtime** without destroying the action, disconnecting event handlers, or touching any other state. Perfect for settings menus where players remap controls.

---

### `Input.Rebind(contextId, actionName, newKeys)`

| Parameter | Type | Description |
|:---:|:---:|:---:|
| `contextId` | `string` | The context that owns the action. |
| `actionName` | `string` | The action to rebind. |
| `newKeys` | `Enum.KeyCode \| Enum.KeyCode[]` | The new key(s) to bind. |

**Returns:** `boolean` — `true` if successful, `false` if context or action not found.

:::info
Rebind destroys the old `InputBinding` instances and creates new ones. All existing event handlers (`On`) remain connected, they don't need to be re-registered.
:::

---

### Basic usage

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    // Player changes jump key from Space to ButtonB
    Input.Rebind("Gameplay", "Jump", Enum.KeyCode.ButtonB);
    ```
  </TabItem>
  <TabItem value="lua" label="Luau">
    ```lua
    Input.Rebind("Gameplay", "Jump", Enum.KeyCode.ButtonB)
    ```
  </TabItem>
</Tabs>

---

### Multiple keys

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    Input.Rebind("Gameplay", "Jump", [
        Enum.KeyCode.Space,
        Enum.KeyCode.ButtonA,
    ]);
    ```
  </TabItem>
  <TabItem value="lua" label="Luau">
    ```lua
    Input.Rebind("Gameplay", "Jump", {
        Enum.KeyCode.Space,
        Enum.KeyCode.ButtonA,
    })
    ```
  </TabItem>
</Tabs>

---

### Settings menu pattern

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    function onPlayerRebind(action: string, newKeys: Enum.KeyCode[]) {
        Input.Rebind("Gameplay", action, newKeys);

        PlayerProfile.SetKeys(action, newKeys);
    }
    ```
  </TabItem>
  <TabItem value="lua" label="Luau">
    ```lua
    local function onPlayerRebind(action, newKeys)
        Input.Rebind("Gameplay", action, newKeys)

        PlayerProfile.SetKeys(action, newKeys)
    end
    ```
  </TabItem>
</Tabs>
