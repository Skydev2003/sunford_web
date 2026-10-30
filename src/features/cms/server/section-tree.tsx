import "server-only";
import { Children, cloneElement, isValidElement, type ReactNode, type ReactElement } from "react";
import type { CmsData } from "../types";

// Keys depend on the original value, so adding another text node does not shift saved edits.
function key(type: string, value: string) {
  let hash = 2166136261;
  for (const char of `${type}:${value}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return `${type}_${(hash >>> 0).toString(16)}`;
}
export function sectionValue(data: CmsData, type: "text" | "image" | "href", original: string) {
  const value = data[key(type, original)];
  return typeof value === "string" ? value : original;
}
export function patchSection(tree: ReactNode, data: CmsData): ReactNode {
  return Children.map(tree, (child) => {
    if (typeof child === "string")
      return typeof data[key("text", child)] === "string"
        ? String(data[key("text", child)])
        : child;
    if (!isValidElement(child)) return child;
    const props = child.props as Record<string, unknown>;
    const next: Record<string, unknown> = {};
    for (const [prop, type] of [
      ["src", "image"],
      ["href", "href"],
    ]) {
      if (typeof props[prop] === "string" && typeof data[key(type, props[prop])] === "string")
        next[prop] = data[key(type, props[prop])];
    }
    if (props.children) next.children = patchSection(props.children as ReactNode, data);
    return cloneElement(child as ReactElement<Record<string, unknown>>, next);
  });
}
