import { useEffect } from "react";
import type { FC, ReactNode } from "react";

interface CloseOnEscapeProps {
  children: ReactNode;
  onClose: () => void;
}

const CloseOnEscape: FC<CloseOnEscapeProps> = ({ children, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) {
        return;
      }

      event.preventDefault();
      onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return <>{children}</>;
};

export default CloseOnEscape;
