import $ from '../core/dom';
import type { DOMWrapper } from '../core/dom';

/**
 * Composable function to get the DOM manipulation utility.
 */
export function useDom(): (selectorOrElement: string | HTMLElement | HTMLElement[] | DOMWrapper) => DOMWrapper {
  return $;
}
