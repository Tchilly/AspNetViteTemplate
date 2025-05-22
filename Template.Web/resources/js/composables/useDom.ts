import $ from '../core/dom';
import type { DOMWrapper as CoreDOMWrapper } from '../core/dom'; // Import with an alias

// Re-export the type for external use
export type DOMWrapper = CoreDOMWrapper;

/**
 * Composable function to get the DOM manipulation utility.
 */
export function useDom(): (selectorOrElement: string | HTMLElement | HTMLElement[] | CoreDOMWrapper) => CoreDOMWrapper {
  return $;
}
