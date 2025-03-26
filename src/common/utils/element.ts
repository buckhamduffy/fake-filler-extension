import { blank } from "./value";

export const findParentWithClass = (element: HTMLElement, className: string, max = 5): HTMLElement | null => {
  let tries = 0;
  let currentElement = element;

  while (tries < max) {
    if (currentElement.classList.contains(className)) {
      return currentElement;
    }

    if (!currentElement.parentElement) {
      return null;
    }

    currentElement = currentElement.parentElement;
    tries += 1;
  }

  return null;
};

export const checkElementForWord = (element: HTMLInputElement, words: string[]): boolean => {
  return words.some((word) => element.id.includes(word) || element.name.includes(word));
};

export const checkSelectHasValue = (element: HTMLSelectElement): boolean => {
  const { value } = element;

  if (blank(value)) {
    return false;
  }

  return Array.from(element.options).some((option) => option.value === value);
};
