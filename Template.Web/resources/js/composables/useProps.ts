/**
 * Composable function to read and parse a JSON string from a 'data-props' attribute on an HTML element.
 *
 * @param el - The HTML element to read the 'data-props' attribute from.
 * @param defaultValue - Optional default value to return if the attribute is missing or JSON is invalid.
 * @returns The parsed JSON object, or the defaultValue if provided, or null.
 */

// Overload for when a non-null defaultValue is provided: guarantees T is returned.
export function useProps<T>(el: HTMLElement, defaultValue: T): T;
// Overload for when no defaultValue (or null) is provided: T | null may be returned.
export function useProps<T>(el: HTMLElement, defaultValue?: null): T | null;

// Implementation (remains the same, as it already handles the logic correctly)
export function useProps<T = any>(el: HTMLElement, defaultValue: T | null = null): T | null {
  const propsString = el.dataset.props;

  if (!propsString) {
    console.warn("Element does not have a 'data-props' attribute.", el);
    return defaultValue;
  }

  try {
    return JSON.parse(propsString) as T;
  } catch (error) {
    console.error("Failed to parse 'data-props' attribute JSON:", error, el);
    return defaultValue;
  }
}
