
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { motion, AnimatePresence } from "framer-motion"
import { useRef, memo } from "react"

// Memoize individual toast to prevent unnecessary re-renders
const MemoizedToast = memo(({ 
  id, 
  title, 
  description, 
  action, 
  ...props 
}: any) => (
  <motion.div
    key={id}
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.9 }}
    transition={{ 
      duration: 0.4, 
      ease: "easeOut"
    }}
    className="z-[100]"
    layout
  >
    <Toast key={id} {...props}>
      <div className="grid gap-1">
        {title && <ToastTitle>{title}</ToastTitle>}
        {description && (
          <ToastDescription>{description}</ToastDescription>
        )}
      </div>
      {action}
      <ToastClose />
    </Toast>
  </motion.div>
))

MemoizedToast.displayName = 'MemoizedToast';

export function Toaster() {
  const { toasts } = useToast()
  const renderedToastsRef = useRef(new Set<string>())

  return (
    <ToastProvider>
      <AnimatePresence>
        {toasts.map(function ({ id, title, description, action, ...props }) {
          // Mark this toast as rendered to avoid flicker during re-renders
          renderedToastsRef.current.add(id)
          
          return (
            <MemoizedToast
              key={id}
              id={id}
              title={title}
              description={description}
              action={action}
              {...props}
            />
          )
        })}
      </AnimatePresence>
      <ToastViewport />
    </ToastProvider>
  )
}
