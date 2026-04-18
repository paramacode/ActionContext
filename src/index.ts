import { Initialize } from "./core/registry";
import { IsAvailable } from "./core/validator";
import { Context, Activate, Deactivate, DestroyContext, DestroyAll, GetContexts, GetActions, IsActive } from "./managers/context-manager";
import { On } from "./managers/action-manager";
import { Rebind, GetBindings, ResetBindings, ResetAllBindings, GetDefaultBindings, GetAllBindings, ExportBindings, ImportBindings, FindConflicts, ListenForInput } from "./managers/binding-manager";

export type { TriggerType, ContextBuilder, ActionBuilder, ContextOptions, ActionProfile, BindingConflict, InputListenerOptions, BindingProfile } from "./types";

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

    /** Destroy all contexts, actions, bindings, and handlers. Useful for full state reset. */
    DestroyAll,

    /** Subscribe to an action trigger ("began", "ended", "changed") across all contexts. Returns a disconnect function. */
    On,

    /** Rebind an action's keys at runtime without destroying anything. */
    Rebind,

    /** Query the current bindings for an action. Returns readonly array of KeyCodes. */
    GetBindings,

    /** Query the original default bindings for an action. */
    GetDefaultBindings,

    /** Reset an action's bindings to the original defaults. */
    ResetBindings,

    /** Reset all action bindings in a context to their original defaults. */
    ResetAllBindings,

    /** Get all current bindings for every action in a context. */
    GetAllBindings,

    /** Export all bindings for a context as a serializable map (for DataStore persistence). */
    ExportBindings,

    /** Apply a previously exported binding profile to a context. */
    ImportBindings,

    /** Check for binding conflicts before rebinding (same key on multiple actions). */
    FindConflicts,

    /** Listen for the next player key input (for "press any key" rebind UI). Returns a cancel function. */
    ListenForInput,

    /** Get all registered context identifiers. */
    GetContexts,

    /** Get all action names within a context. */
    GetActions,

    /** Check whether a context is currently active. */
    IsActive,

    /** Check if the Input Action System is available on this platform. */
    IsAvailable
};