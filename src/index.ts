import { Initialize } from "./Core/Registry";
import { IsAvailable } from "./Core/Validator";
import { Context, Activate, Deactivate, DestroyContext, GetContexts, GetActions, IsActive } from "./Managers/ContextManager";
import { On } from "./Managers/ActionManager";
import { Rebind, GetBindings } from "./Managers/BindingManager";

export type { TriggerType, ContextBuilder, ActionBuilder, ContextOptions } from "./Types";

Initialize();

export const Input = {
    /** Define a context with actions and bindings via builder callback. Errors if context already exists unless { override: true }. */
    Context,

    /** Activate a context. Pass `true` as second arg to deactivate all others (exclusive mode). */
    Activate,

    /** Deactivate a context (actions stop responding). */
    Deactivate,

    /** Destroy a context and all its actions/bindings. */
    Destroy: DestroyContext,

    /** Subscribe to an action trigger ("began", "ended", "changed") across all contexts. Returns a disconnect function. */
    On,

    /** Rebind an action's keys at runtime without destroying anything. */
    Rebind,

    /** Query the current bindings for an action. Returns readonly array of KeyCodes. */
    GetBindings,

    /** Get all registered context identifiers. */
    GetContexts,

    /** Get all action names within a context. */
    GetActions,

    /** Check whether a context is currently active. */
    IsActive,

    /** Check if the Input Action System is available on this platform. */
    IsAvailable
};