import { createContext, useContext, useState, type ReactNode } from "react";
import ConfirmModal from '../pages/core/ConfirmModal';

interface ConfirmContextType {
  showConfirm: (message: string, title?: string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<{
    isOpen: boolean;
    message: string;
    title: string;
    resolve?: (value: boolean) => void;
  }>({ isOpen: false, message: "", title: "" });

  const showConfirm = (message: string, title = "Confirm"): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ isOpen: true, message, title, resolve });
    });
  };

  const handleConfirm = () => {
    state.resolve?.(true);
    setState({ ...state, isOpen: false });
  };

  const handleClose = () => {
    state.resolve?.(false);
    setState({ ...state, isOpen: false });
  };

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      <ConfirmModal
        showConfirmModal={state.isOpen}
        title={state.title}
        message={state.message}
        onConfirm={handleConfirm}
        onClose={handleClose}
      />
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm must be used inside ConfirmProvider");
  return context.showConfirm;
};