import { findParentWithClass } from "./utils/element";

// eslint-disable-next-line no-unused-vars
type ElementFiller = (container: Document | HTMLElement) => void;

export default class RepeatableFiller {
  private elementFiller: ElementFiller;

  constructor(elementFiller: ElementFiller) {
    this.elementFiller = elementFiller;
  }

  public fillAll(container: Document | HTMLElement): void {
    container.querySelectorAll<HTMLButtonElement>("button.repeatable-row-add").forEach(this.fill.bind(this));
  }

  private async fill(button: HTMLElement, index: number): Promise<void> {
    const parent = findParentWithClass(button, "card", 5);

    if (!parent) {
      return;
    }

    if (parent.querySelectorAll(".repeatable-row").length > 0) {
      return;
    }

    await this.wait(100 * index);

    button.click();

    await this.wait(100 * index);

    this.elementFiller(parent);
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
