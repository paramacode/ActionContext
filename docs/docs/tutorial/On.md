---
sidebar_position: 3
title: On
---

# On

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Subscribe to action triggers. Handlers are **global**, they automatically connect to every context that has an action with the matching name, including contexts created *after* the handler is registered.

---

### `Input.On(actionName, triggerType, callback)`

| Parameter | Type | Description |
|:---:|:---:|:---:|
| `actionName` | `string` | The name of the action to listen for. |
| `triggerType` | `"began" \| "ended" \| "changed"` | When to fire. |
| `callback` | `() => void` | Function to execute. |

**Returns:** `() => void` a disconnect function. Call it to stop listening.

#### Trigger types

| Type | Fires when | IAS signal |
|:---:|:---:|:---:|
| `"began"` | Input starts (key down, button pressed) | `InputAction.Pressed` |
| `"ended"` | Input stops (key up, button released) | `InputAction.Released` |
| `"changed"` | Value changes (analog sticks, triggers) | `InputAction.StateChanged` |

---

### Basic usage

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    Input.On("Jump", "began", () => {
        character.Jump();
    });

    Input.On("Shoot", "began", () => {
        WeaponSystem.Fire();
    });

    Input.On("Shoot", "ended", () => {
        WeaponSystem.StopFire();
    });
    ```
  </TabItem>
  <TabItem value="lua" label="Luau">
    ```lua
    Input.On("Jump", "began", function()
        character:Jump()
    end)

    Input.On("Shoot", "began", function()
        WeaponSystem.Fire()
    end)

    Input.On("Shoot", "ended", function()
        WeaponSystem.StopFire()
    end)
    ```
  </TabItem>
</Tabs>

---

### Disconnecting

`On` returns a disconnect function. Call it when you no longer need the handler.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    const disconnect = Input.On("Jump", "began", () => {
        print("Jumped!");
    });

    // Later, when you no longer need it:
    disconnect();
    ```
  </TabItem>
  <TabItem value="lua" label="Luau">
    ```lua
    local disconnect = Input.On("Jump", "began", function()
        print("Jumped!")
    end)

    -- Later:
    disconnect()
    ```
  </TabItem>
</Tabs>

---

### Register before creating a context

Handlers are auto-wired. You can register them **before** the context even exists:

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    // 1. Register handler first
    Input.On("Jump", "began", () => {
        MovementSystem.Jump();
    });

    // 2. Define context later — handler connects automatically
    Input.Context("Gameplay", (context) => {
        context.action("Jump").bind(Enum.KeyCode.Space);
    });
    ```
  </TabItem>
  <TabItem value="lua" label="Luau">
    ```lua
    Input.On("Jump", "began", function()
        MovementSystem.Jump()
    end)

    Input.Context("Gameplay", function(context)
        context.action("Jump").bind(Enum.KeyCode.Space)
    end)
    ```
  </TabItem>
</Tabs>

This is useful when different scripts handle events independently without knowing about each other's initialization order.
