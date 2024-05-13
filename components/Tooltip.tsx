import { useState, ReactNode } from "react";
import { useHover, useFloating, useInteractions } from "@floating-ui/react";

export default function Tooltip({
  content,
  children,
}: {
  content: ReactNode;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
  });

  const hover = useHover(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  return (
    <>
      <span ref={refs.setReference} {...getReferenceProps()}>
        {children}
      </span>
      {isOpen && (
        <div
          ref={refs.setFloating}
          className="bg-white p-2 border border-slate-600 rounded"
          style={floatingStyles}
          {...getFloatingProps()}
        >
          {content}
        </div>
      )}
    </>
  );
}
