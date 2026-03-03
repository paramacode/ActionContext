---
sidebar_position: 2
title: Activate & Deactivate
---

# Activate & Deactivate

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Contexts start **disabled**. Actions inside a disabled context will not fire. Use `Activate` and `Deactivate` to control which contexts respond to input based on your game state.

---

### `Input.Activate(identifier, exclusive?)`

| Parameter | Type | Default | Description |
|:---:|:---:|:---:|:---:|
| `identifier` | `string` | — | The context to activate. |
| `exclusive` | `boolean` | `false` | If `true`, deactivates **all other** contexts first. |

### `Input.Deactivate(identifier)`

| Parameter | Type | Default | Description |
|:---:|:---:|:---:|:---:|
| `identifier` | `string` | — | The context to deactivate. |

---

### Basic usage

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    // Activate normally — other contexts stay as they are
    Input.Activate("Gameplay");

    // Deactivate when leaving gameplay
    Input.Deactivate("Gameplay");
    ```
  </TabItem>
  <TabItem value="lua" label="Luau">
    ```lua
    Input.Activate("Gameplay")

    Input.Deactivate("Gameplay")
    ```
  </TabItem>
</Tabs>

---

### Multiple contexts active simultaneously

Multiple contexts can be active at the same time. This is useful when different systems need to listen for input independently.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    Input.Activate("Gameplay");
    Input.Activate("UI");

    // Both "Gameplay" and "UI" actions are now responding
    ```
  </TabItem>
  <TabItem value="lua" label="Luau">
    ```lua
    Input.Activate("Gameplay")
    Input.Activate("UI")
    ```
  </TabItem>
</Tabs>

---

### Exclusive activation

When you need exactly **one** context active like switching from gameplay to a pause menu use exclusive mode. It deactivates every other context automatically.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    // Player opens pause menu — only "Menu" should respond
    Input.Activate("Menu", true);

    // Player resumes — switch back to gameplay exclusively
    Input.Activate("Gameplay", true);
    ```
  </TabItem>
  <TabItem value="lua" label="Luau">
    ```lua
    Input.Activate("Menu", true)

    Input.Activate("Gameplay", true)
    ```
  </TabItem>
</Tabs>

---

### Driven by game state

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    GameState.OnChanged((state) => {
        if (state === "InGame") {
            Input.Activate("Gameplay", true);
        } else if (state === "Paused") {
            Input.Activate("Menu", true);
        } else {
            Input.Deactivate("Gameplay");
            Input.Deactivate("Menu");
        }
    });
    ```
  </TabItem>
  <TabItem value="lua" label="Luau">
    ```lua
    GameState.OnChanged(function(state)
        if state == "InGame" then
            Input.Activate("Gameplay", true)
        elseif state == "Paused" then
            Input.Activate("Menu", true)
        else
            Input.Deactivate("Gameplay")
            Input.Deactivate("Menu")
        end
    end)
    ```
  </TabItem>
</Tabs>
