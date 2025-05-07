import RepeatableFiller from "./repeatable-filler";

import { checkSelectHasValue } from "./utils/element";

import ElementFiller from "src/common/element-filler";
import { IFakeFillerOptions } from "src/types";

class FakeFiller {
  private elementFiller: ElementFiller;
  private clickedElement: HTMLElement | undefined;
  private urlMatchesToBlock: string[];
  private repeatableFiller: RepeatableFiller;

  constructor(options: IFakeFillerOptions, profileIndex = -1) {
    this.elementFiller = new ElementFiller(options, profileIndex);
    this.urlMatchesToBlock = options.urlMatchesToBlock;
    this.repeatableFiller = new RepeatableFiller(this.fillAllElements.bind(this));
  }

  private urlMatchesBlockList(): boolean {
    const url = window.location.href;

    if (url && this.urlMatchesToBlock && this.urlMatchesToBlock.length > 0) {
      for (let i = 0; i < this.urlMatchesToBlock.length; i += 1) {
        const currentURL = this.urlMatchesToBlock[i];

        if (url.match(new RegExp(currentURL))) {
          return true;
        }
      }
    }

    return false;
  }

  private async fillAllElements(container: Document | HTMLElement): Promise<void> {
    if (this.urlMatchesBlockList()) {
      return;
    }

    const fillers = [
      {
        selector: "select:not(:disabled):not([readonly])",
        callback: (element: HTMLSelectElement) => this.elementFiller.fillSelectElement(element),
      },
      {
        selector: "input:not(:disabled):not([readonly])",
        callback: (element: HTMLInputElement) => this.elementFiller.fillInputElement(element),
      },
      {
        selector: "textarea:not(:disabled):not([readonly])",
        callback: (element: HTMLTextAreaElement) => this.elementFiller.fillTextAreaElement(element),
      },
      {
        selector: "[contenteditable]",
        callback: (element: HTMLElement) => this.elementFiller.fillContentEditableElement(element),
      },
      {
        selector: ".multiselect",
        callback: (element: HTMLElement) => this.elementFiller.fillMultiSelectElement(element),
      },
      {
        selector: "select:not(:disabled):not([readonly])",
        callback: (element: HTMLSelectElement) => {
          if (!checkSelectHasValue(element)) {
            this.elementFiller.fillSelectElement(element);
          }
        },
      },
    ];

    type InputElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLElement;

    for (const { selector, callback } of fillers) {
      const elements = container.querySelectorAll<InputElement>(selector);

      for (const element of elements) {
        callback(element);
        await this.delay(50);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public setClickedElement(element: HTMLElement | undefined): void {
    this.clickedElement = element;
  }

  public fillAllInputs(): void {
    this.repeatableFiller.fillAll(document);
    this.fillAllElements(document);
  }

  public fillThisInput(): void {
    if (this.urlMatchesBlockList()) {
      return;
    }

    const element = this.clickedElement || document.activeElement;

    if (element) {
      const tagName = element.tagName.toLowerCase();

      if (tagName === "input") {
        this.elementFiller.fillInputElement(element as HTMLInputElement);
      } else if (tagName === "textarea") {
        this.elementFiller.fillTextAreaElement(element as HTMLTextAreaElement);
      } else if (tagName === "select") {
        this.elementFiller.fillSelectElement(element as HTMLSelectElement);
      } else if ((element as HTMLElement).isContentEditable) {
        this.elementFiller.fillContentEditableElement(element as HTMLElement);
      }
    }

    this.setClickedElement(undefined);
  }

  public fillThisForm(): void {
    if (this.urlMatchesBlockList()) {
      return;
    }

    const element = this.clickedElement || document.activeElement;

    if (element && element.tagName.toLowerCase() !== "body") {
      const form = element.closest("form");

      if (form) {
        this.repeatableFiller.fillAll(form);
        this.fillAllElements(form);
      }
    }

    this.setClickedElement(undefined);
  }
}

export default FakeFiller;
