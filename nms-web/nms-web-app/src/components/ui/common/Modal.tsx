// src/components/ui/common/Modal.tsx
import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  // Optional but recommended: Close modal on 'Escape' key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop: This is now purely for visual effect. The onClick is removed. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            aria-hidden="true"
          />

          {/* 
            FIX: The onClick handler is moved here.
            This is the full-screen container that centers the modal. Since it sits on top 
            of the backdrop (z-50 vs z-40), this is the element that actually receives the "outside" click.
          */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ ease: "easeOut", duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose} // <-- The click handler is now here
          >
            {/* 
              This remains the same. The stopPropagation is crucial.
              It stops a click on the modal's content from "bubbling up" to the parent
              div and triggering the onClose function.
            */}
            <div
              onClick={(e) => e.stopPropagation()} 
              className={`relative bg-card border border-border rounded-lg shadow-xl w-full ${maxWidth}`}
            >
              <div className="flex items-start justify-between p-5 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-1 -mt-1 -mr-1 rounded-full text-muted-foreground hover:bg-accent"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}