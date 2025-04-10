
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

// Increased toast limit to 5 to ensure multiple toasts can be displayed if needed
const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

// Create a Set to track toast IDs that are being removed to avoid race conditions
const toastsBeingRemoved = new Set<string>();
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId) || toastsBeingRemoved.has(toastId)) {
    return
  }

  // Mark this toast as being removed to prevent re-adding it
  toastsBeingRemoved.add(toastId);

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    toastsBeingRemoved.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      // Check if we already have a toast with the same content to avoid duplicates
      // This helps prevent flickering due to multiple identical toasts
      const existingToastIndex = state.toasts.findIndex(
        t => t.title === action.toast.title && 
             t.description === action.toast.description
      );
      
      // If a similar toast already exists, don't add another one
      if (existingToastIndex >= 0) {
        return state;
      }
      
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // Only add to remove queue if not already being removed
      if (toastId && !toastsBeingRemoved.has(toastId)) {
        addToRemoveQueue(toastId)
      } else if (!toastId) {
        // For dismissing all toasts
        state.toasts.forEach((toast) => {
          if (!toastsBeingRemoved.has(toast.id)) {
            addToRemoveQueue(toast.id)
          }
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          (t.id === toastId || toastId === undefined) && !toastsBeingRemoved.has(t.id)
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

// Use a variable that we can update instead of a constant
let memoryStateValue: State = { toasts: [] }

// Use a single dispatcher function
const listeners = new Set<(state: State) => void>()

function dispatch(action: Action) {
  // Update the memoryStateValue by calling reducer with existing state and action
  memoryStateValue = reducer(memoryStateValue, action)
  listeners.forEach((listener) => {
    listener(memoryStateValue)
  })
}

type Toast = Omit<ToasterToast, "id">

// Add a debounce mechanism to prevent multiple toasts with the same content
const toastHistory = new Map<string, number>();
const TOAST_COOLDOWN_MS = 3000; // 3 seconds cooldown between identical toasts

function toast({ ...props }: Toast) {
  const id = genId()
  
  // Create a simple hash based on toast content
  const contentKey = `${props.title || ''}-${props.description || ''}`;
  const now = Date.now();
  
  // Check if this exact toast was shown recently
  if (contentKey.length > 0 && toastHistory.has(contentKey)) {
    const lastShown = toastHistory.get(contentKey) || 0;
    if (now - lastShown < TOAST_COOLDOWN_MS) {
      // Skip showing duplicate toast during cooldown
      return {
        id,
        dismiss: () => {},
        update: () => {},
      };
    }
  }
  
  // Record this toast
  if (contentKey.length > 0) {
    toastHistory.set(contentKey, now);
    
    // Clean up old entries after cooldown period
    setTimeout(() => {
      toastHistory.delete(contentKey);
    }, TOAST_COOLDOWN_MS);
  }

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryStateValue)

  React.useEffect(() => {
    // Use a stable function reference to prevent unnecessary re-renders
    const listener = (newState: State) => {
      setState(newState)
    }
    
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
