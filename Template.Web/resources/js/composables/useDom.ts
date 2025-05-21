import $ from '../core/dom';
import type { DOMWrapper } from '../core/dom';
import type { BaseController } from '../controllers/base.controller';

/**
 * Composable function to get the DOM manipulation utility.
 * The controller instance is accepted for API consistency with potential future hooks
 * that might require controller-specific data (e.g., useData(controller)).
 * For this specific useDom, the controller instance isn't strictly used to return $.
 */
export function useDom(controller: BaseController): (selectorOrElement: string | HTMLElement | HTMLElement[] | DOMWrapper) => DOMWrapper {
  return $;
}
