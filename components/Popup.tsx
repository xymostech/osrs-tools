import { useState, ReactNode } from "react";
import {
  useFloating,
  useDismiss,
  useClick,
  useInteractions,
  Placement,
  offset,
} from "@floating-ui/react";

export default function Popup({
  children,
  popup,
  placement,
  startOpen,
}: {
  children: ReactNode;
  popup: ReactNode;
  placement?: Placement;
  startOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(!!startOpen);

  const { refs, floatingStyles, context } = useFloating({
    placement,
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(5)],
  });

  const dismiss = useDismiss(context);
  const click = useClick(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    dismiss,
    click,
  ]);

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()}>
        {children}
      </div>
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className="z-10"
          {...getFloatingProps()}
        >
          {popup}
        </div>
      )}
    </>
  );
}
