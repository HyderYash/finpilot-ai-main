import { Fragment } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getGlossaryRegex, getGlossaryDefinition } from "@/lib/glossary";

const regex = getGlossaryRegex();

/**
 * Wraps glossary terms in the given text with Tooltips showing definitions.
 * Use inside ReactMarkdown components.text for one-click literacy tooltips.
 */
export function GlossaryText({ children }: { children: string }) {
  const parts = children.split(regex);
  if (parts.length === 1) return <>{children}</>;
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
        const def = getGlossaryDefinition(part);
        if (!def)
          return <Fragment key={i}>{part}</Fragment>;
        return (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <span className="border-b border-dashed border-primary/50 cursor-help text-primary/90">{part}</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              {def}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </>
  );
}
