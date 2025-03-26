/* eslint-disable no-param-reassign */

import cssesc from "cssesc";
import moment from "moment";
import RandExp from "randexp";

import FileFiller from "./file-filler";

import { checkElementForWord, checkSelectHasValue } from "./utils/element";

import { blank } from "./utils/value";

import DataGenerator from "src/common/data-generator";
import { DEFAULT_EMAIL_CUSTOM_FIELD, SanitizeText } from "src/common/helpers";
import { CustomFieldTypes, ICustomField, IFakeFillerOptions } from "src/types";

export type FillableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

class ElementFiller {
  private generator: DataGenerator;
  private fileFiller: FileFiller;
  private options: IFakeFillerOptions;
  private profileIndex: number;

  private previousValue: string | null = null;
  private previousPassword: string | null = null;
  private previousUsername: string | null = null;
  private previousFirstName: string | null = null;
  private previousLastName: string | null = null;
  private previousDate: string | null = null;

  constructor(options: IFakeFillerOptions, profileIndex = -1) {
    this.options = options;
    this.profileIndex = profileIndex;
    this.generator = new DataGenerator();
    this.fileFiller = new FileFiller();
  }

  private fireEvents(element: FillableElement): void {
    ["input", "click", "change", "blur"].forEach((event) => {
      const changeEvent = new Event(event, { bubbles: true, cancelable: true });
      element.dispatchEvent(changeEvent);
    });
  }

  private fireEventsIfEnabled(element: FillableElement): void {
    if (this.options.triggerClickEvents) {
      this.fireEvents(element);
    }
  }

  private isAnyMatch(haystack: string, needles: string[]): boolean {
    for (let i = 0, count = needles.length; i < count; i += 1) {
      if (new RegExp(needles[i], "iu").test(haystack)) {
        return true;
      }
    }
    return false;
  }

  private isElementVisible(element: HTMLElement): boolean {
    if (!element.offsetHeight && !element.offsetWidth) {
      return false;
    }

    return window.getComputedStyle(element).visibility !== "hidden";
  }

  private shouldIgnoreElement(element: FillableElement): boolean {
    if (["button", "submit", "reset", "image"].indexOf(element.type) > -1) {
      return true;
    }

    // Ignore any invisible elements.
    if (this.options.ignoreHiddenFields && !this.isElementVisible(element)) {
      return true;
    }

    if (element.className.includes("multiselect-tags-search")) {
      return true;
    }

    // Ignore any elements that match an item in the the "ignoredFields" array.
    const elementName = this.getElementName(element);
    if (this.isAnyMatch(elementName, this.options.ignoredFields)) {
      return true;
    }

    if (this.options.ignoreFieldsWithContent) {
      // A radio button list will be ignored if it has been selected previously.
      if (element.type === "radio") {
        if (document.querySelectorAll(`input[name="${element.name}"]:checked`).length > 0) {
          return true;
        }
      }

      if (element.type === "select-one") {
        return checkSelectHasValue(element as HTMLSelectElement);
      }

      // All elements excluding radio buttons and check boxes will be ignored if they have a value.
      if (element.type !== "checkbox" && element.type !== "radio") {
        const elementValue = element.value;
        if (elementValue && elementValue.trim().length > 0) {
          return true;
        }
      }

      return !blank(element.value);
    }

    // If all above checks have failed, we do not need to ignore this element.
    return false;
  }

  private selectRandomRadio(name: string, valuesList: string[] = []): void {
    const list = [];
    const elements = document.getElementsByName(name) as NodeListOf<HTMLInputElement>;

    for (let i = 0; i < elements.length; i += 1) {
      if (elements[i].type === "radio" && (valuesList.length === 0 || valuesList.includes(elements[i].value))) {
        list.push(elements[i]);
      }
    }

    const radioElement = list[Math.floor(Math.random() * list.length)];
    radioElement.checked = true;
    this.fireEvents(radioElement);
  }

  private findCustomFieldFromList(
    fields: ICustomField[],
    elementName: string,
    matchTypes: CustomFieldTypes[] = []
  ): ICustomField | undefined {
    const doMatchType = matchTypes.length > 0;

    for (let i = 0; i < fields.length; i += 1) {
      if (this.isAnyMatch(elementName, fields[i].match)) {
        if (doMatchType) {
          for (let j = 0; j < matchTypes.length; j += 1) {
            if (fields[i].type === matchTypes[j]) {
              return fields[i];
            }
          }
        } else {
          return fields[i];
        }
      }
    }

    return undefined;
  }

  private findCustomField(elementName: string, matchTypes: CustomFieldTypes[] = []): ICustomField | undefined {
    let foundField: ICustomField | undefined;

    // Try finding the custom field from a profile if available.
    if (this.profileIndex > -1) {
      foundField = this.findCustomFieldFromList(
        this.options.profiles[this.profileIndex].fields,
        elementName,
        matchTypes
      );

      if (foundField) {
        return foundField;
      }
    }

    // If a custom field could not be found from the profile, try getting one from the default list.
    return this.findCustomFieldFromList(this.options.fields, elementName, matchTypes);
  }

  private NormalizeTextForElementName(text: string): string {
    const sanitizedText = SanitizeText(text);

    if (sanitizedText === text) {
      return sanitizedText;
    }

    return `${sanitizedText} ${text}`;
  }

  private getElementName(element: FillableElement): string {
    let normalizedName = "";

    if (this.options.fieldMatchSettings.matchName) {
      normalizedName += ` ${this.NormalizeTextForElementName(element.name)}`;
    }

    if (this.options.fieldMatchSettings.matchId) {
      normalizedName += ` ${this.NormalizeTextForElementName(element.id)}`;
    }

    if (this.options.fieldMatchSettings.matchClass) {
      normalizedName += ` ${this.NormalizeTextForElementName(element.className)}`;
    }

    if (this.options.fieldMatchSettings.matchPlaceholder) {
      normalizedName += ` ${this.NormalizeTextForElementName(element.getAttribute("placeholder") || "")}`;
    }

    if (
      this.options.fieldMatchSettings.customAttributes &&
      this.options.fieldMatchSettings.customAttributes.length > 0
    ) {
      this.options.fieldMatchSettings.customAttributes.forEach((customAttribute) => {
        normalizedName += ` ${this.NormalizeTextForElementName(element.getAttribute(customAttribute) || "")}`;
      });
    }

    if (this.options.fieldMatchSettings.matchLabel) {
      const normalizedId = cssesc(element.id);
      const labels = document.querySelectorAll(`label[for='${normalizedId}']`);
      for (let i = 0; i < labels.length; i += 1) {
        normalizedName += ` ${this.NormalizeTextForElementName(labels[i].innerHTML)}`;
      }
    }

    if (this.options.fieldMatchSettings.matchAriaLabel) {
      normalizedName += ` ${this.NormalizeTextForElementName(element.getAttribute("aria-label") || "")}`;
    }

    if (this.options.fieldMatchSettings.matchAriaLabelledBy) {
      const labelIds = (element.getAttribute("aria-labelledby") || "").split(" ");
      for (let i = 0; i < labelIds.length; i += 1) {
        const labelElement = document.getElementById(labelIds[i]);
        if (labelElement) {
          normalizedName += ` ${this.NormalizeTextForElementName(labelElement.innerHTML || "")}`;
        }
      }
    }

    return normalizedName;
  }

  private getElementMaxLength(element: HTMLInputElement | HTMLTextAreaElement | undefined): number {
    if (element && element.maxLength && element.maxLength > 0) {
      return element.maxLength;
    }
    return this.options.defaultMaxLength;
  }

  private getElementMinLength(element: HTMLInputElement | HTMLTextAreaElement | undefined): number {
    if (element && element.minLength && element.minLength > 0) {
      return element.minLength;
    }
    return 0;
  }

  private generateDummyDataForCustomField(
    customField: ICustomField | undefined,
    element: HTMLInputElement | HTMLTextAreaElement | undefined = undefined
  ): string {
    if (!customField) {
      if (element && element instanceof HTMLInputElement && element.pattern) {
        return this.generator.generateRandomStringFromRegExTemplate(element.pattern);
      }

      return this.generator.phrase(this.getElementMinLength(element), this.getElementMaxLength(element));
    }

    switch (customField.type) {
      case "username": {
        this.previousUsername = this.generator.scrambledWord(5, 10).toLowerCase();
        return this.previousUsername;
      }

      case "first-name": {
        this.previousFirstName = this.generator.firstName();
        return this.previousFirstName;
      }

      case "last-name": {
        this.previousLastName = this.generator.lastName();
        return this.previousLastName;
      }

      case "full-name": {
        this.previousFirstName = this.generator.firstName();
        this.previousLastName = this.generator.lastName();
        return `${this.previousFirstName} ${this.previousLastName}`;
      }

      case "street_address": {
        return this.generator.streetAddress();
      }

      case "country": {
        return this.generator.country();
      }

      case "email": {
        return this.generator.emailConfig(customField, {
          previousFirstName: this.previousFirstName,
          previousLastName: this.previousLastName,
          previousUsername: this.previousUsername,
          previousValue: this.previousValue,
        });
      }

      case "organization": {
        return this.generator.organizationName();
      }

      case "telephone": {
        return this.generator.phoneNumber(customField.template);
      }

      case "number": {
        const minValue = customField.min === 0 ? 0 : customField.min || 1;
        const maxValue = customField.max || 100;
        const decimalValue = customField.decimalPlaces || 0;
        return String(this.generator.randomNumber(minValue, maxValue, decimalValue));
      }

      case "date": {
        return this.generateDummyDataForDate(element as HTMLInputElement, customField);
      }

      case "url": {
        return this.generator.website();
      }

      case "text": {
        if (element && element instanceof HTMLInputElement && element.pattern) {
          return this.generator.generateRandomStringFromRegExTemplate(element.pattern);
        }

        const minWords = customField.min || 10;
        const maxWords = customField.max || 30;
        let maxLength = customField.maxLength || this.options.defaultMaxLength;
        if (element && element.maxLength && element.maxLength < maxLength) {
          maxLength = element.maxLength;
        }
        let minLength = 0;
        if (element && element.minLength) {
          minLength = element.minLength;
        }
        return this.generator.paragraph(minWords, maxWords, minLength, maxLength);
      }

      case "alphanumeric": {
        return this.generator.alphanumeric(customField.template || "");
      }

      case "regex": {
        const regExGenerator = new RandExp(customField.template || "");
        regExGenerator.defaultRange.add(0, 65535);
        return regExGenerator.gen();
      }

      case "randomized-list": {
        if (customField.list && customField.list.length > 0) {
          return customField.list[this.generator.randomNumber(0, customField.list.length - 1)];
        }
        return "";
      }

      default: {
        return this.generator.phrase(this.getElementMinLength(element), this.getElementMaxLength(element));
      }
    }
  }

  public fillInputElement(element: HTMLInputElement): void {
    if (this.shouldIgnoreElement(element)) {
      return;
    }

    let fireEvent = true;
    const elementType = element.type ? element.type.toLowerCase() : "";

    switch (elementType) {
      case "checkbox": {
        // standard version of this selector:
        if (this.isAnyMatch(this.getElementName(element), this.options.agreeTermsFields)) {
          element.checked = true;
          if (element.value && element.value === "false") {
            element.value = "true";
          }
        } else {
          element.checked = Math.random() > 0.5;
        }

        break;
      }

      case "date": {
        const dateCustomField = this.findCustomField(this.getElementName(element), ["date"]);

        if (dateCustomField) {
          element.value = this.generateDummyDataForCustomField(dateCustomField, element);
        } else {
          let minDate: Date | undefined;
          let maxDate: Date | undefined;

          if (element.min) {
            if (moment(element.min).isValid()) {
              minDate = moment(element.min).toDate();
            }
          }

          if (element.max) {
            if (moment(element.max).isValid()) {
              maxDate = moment(element.max).toDate();
            }
          }

          element.value = this.generator.date(minDate, maxDate);
        }
        break;
      }

      case "datetime": {
        const datetimeCustomField = this.findCustomField(this.getElementName(element), [
          "alphanumeric",
          "regex",
          "randomized-list",
        ]);

        if (datetimeCustomField) {
          element.value = this.generateDummyDataForCustomField(datetimeCustomField, element);
        } else {
          element.value = `${this.generator.date()}T${this.generator.time()}Z`;
        }
        break;
      }

      case "datetime-local": {
        const datetimeLocalCustomField = this.findCustomField(this.getElementName(element), [
          "alphanumeric",
          "regex",
          "randomized-list",
        ]);

        if (datetimeLocalCustomField) {
          element.value = this.generateDummyDataForCustomField(datetimeLocalCustomField, element);
        } else {
          element.value = `${this.generator.date()}T${this.generator.time()}`;
        }
        break;
      }

      case "time": {
        const timeCustomField = this.findCustomField(this.getElementName(element), [
          "alphanumeric",
          "regex",
          "randomized-list",
        ]);

        if (timeCustomField) {
          element.value = this.generateDummyDataForCustomField(timeCustomField, element);
        } else {
          element.value = this.generator.time();
        }
        break;
      }

      case "month": {
        const monthCustomField = this.findCustomField(this.getElementName(element), [
          "alphanumeric",
          "regex",
          "randomized-list",
        ]);

        if (monthCustomField) {
          element.value = this.generateDummyDataForCustomField(monthCustomField, element);
        } else {
          element.value = `${this.generator.year()}-${this.generator.month()}`;
        }
        break;
      }

      case "week":
        // eslint-disable-next-line no-case-declarations
        const weekCustomField = this.findCustomField(this.getElementName(element), [
          "alphanumeric",
          "regex",
          "randomized-list",
        ]);

        if (weekCustomField) {
          element.value = this.generateDummyDataForCustomField(weekCustomField, element);
        } else {
          element.value = `${this.generator.year()}-W${this.generator.weekNumber()}`;
        }
        break;

      case "email": {
        if (this.isAnyMatch(this.getElementName(element), this.options.confirmFields) && this.previousValue) {
          element.value = this.previousValue;
        } else {
          let emailCustomField = this.findCustomField(this.getElementName(element), ["email"]);
          if (!emailCustomField) {
            emailCustomField = DEFAULT_EMAIL_CUSTOM_FIELD;
          }

          this.previousValue = this.generateDummyDataForCustomField(emailCustomField, element);
          element.value = this.previousValue;
        }
        break;
      }

      case "number":
      case "range": {
        let min = element.min ? parseInt(element.min, 10) : 1;
        let max = element.max ? parseInt(element.max, 10) : 100;

        const numberCustomField = this.findCustomField(this.getElementName(element), ["number"]);

        if (numberCustomField) {
          min = numberCustomField.min || min;
          max = numberCustomField.max || max;

          if (element.min && element.max) {
            min = Number(element.min) > min ? Number(element.min) : min;
            max = Number(element.max) < max ? Number(element.max) : max;
          }
        }

        let decimalPlaces = 0;

        if (element.step) {
          // Doesn't work properly for non-powers of 10
          decimalPlaces = Math.floor(-Math.log10(Number(element.step)));
        } else if (numberCustomField) {
          decimalPlaces = numberCustomField.decimalPlaces || 0;
        }

        element.value = String(this.generator.randomNumber(min, max, decimalPlaces));
        break;
      }

      case "password": {
        if (this.isAnyMatch(this.getElementName(element), this.options.confirmFields) && this.previousPassword) {
          element.value = this.previousPassword;
        } else {
          if (this.options.passwordSettings.mode === "defined") {
            this.previousPassword = this.options.passwordSettings.password;
          } else {
            this.previousPassword = this.generator.scrambledWord(8, 8).toLowerCase();
            // eslint-disable-next-line no-console
            console.info(this.previousPassword);
          }

          element.value = this.previousPassword;
        }
        break;
      }

      case "radio": {
        if (element.name) {
          const matchingCustomField = this.findCustomField(this.getElementName(element), ["randomized-list"]);
          const valuesList = matchingCustomField?.list ? matchingCustomField?.list : [];
          this.selectRandomRadio(element.name, valuesList);
        }
        fireEvent = false;
        break;
      }

      case "tel": {
        const telephoneCustomField = this.findCustomField(this.getElementName(element), [
          "telephone",
          "regex",
          "randomized-list",
        ]);

        if (telephoneCustomField) {
          element.value = this.generateDummyDataForCustomField(telephoneCustomField, element);
        } else {
          element.value = this.generator.phoneNumber();
        }
        break;
      }

      case "url": {
        const urlCustomField = this.findCustomField(this.getElementName(element), [
          "alphanumeric",
          "url",
          "regex",
          "randomized-list",
        ]);

        if (urlCustomField) {
          element.value = this.generateDummyDataForCustomField(urlCustomField, element);
        } else {
          element.value = this.generator.website();
        }
        break;
      }

      case "color": {
        const colorCustomField = this.findCustomField(this.getElementName(element), [
          "alphanumeric",
          "regex",
          "randomized-list",
        ]);

        if (colorCustomField) {
          element.value = this.generateDummyDataForCustomField(colorCustomField, element);
        } else {
          element.value = this.generator.color();
        }
        break;
      }

      case "search": {
        const searchCustomField = this.findCustomField(this.getElementName(element), [
          "alphanumeric",
          "regex",
          "randomized-list",
          "text",
        ]);

        if (searchCustomField) {
          element.value = this.generateDummyDataForCustomField(searchCustomField, element);
        } else {
          element.value = this.generator.words(1);
        }
        break;
      }

      case "file": {
        if (this.options.uploadFiles) {
          this.fileFiller.fillInput(element);
        }
        break;
      }

      default: {
        if (this.isAnyMatch(this.getElementName(element), this.options.confirmFields) && this.previousValue) {
          element.value = this.previousValue;
        } else {
          const customField = this.findCustomField(this.getElementName(element));
          this.previousValue = this.generateDummyDataForCustomField(customField, element);
          element.value = this.previousValue;
        }
        break;
      }
    }

    if (this.options.triggerClickEvents && fireEvent) {
      this.fireEvents(element);
    }
  }

  public fillTextAreaElement(element: HTMLTextAreaElement): void {
    if (this.shouldIgnoreElement(element)) {
      return;
    }

    const matchingCustomField = this.findCustomField(this.getElementName(element), [
      "text",
      "alphanumeric",
      "regex",
      "randomized-list",
    ]);

    element.value = this.generateDummyDataForCustomField(matchingCustomField, element);

    if (this.options.triggerClickEvents) {
      this.fireEvents(element);
    }
  }

  public fillSelectElement(element: HTMLSelectElement): void {
    if (this.shouldIgnoreElement(element)) {
      return;
    }

    if (!element.options || element.options.length < 1) {
      return;
    }

    const options = Array.from(element.options)
      .filter((option) => !option.disabled)
      .map((option) => option.value)
      .filter((option) => option !== null && option !== "");

    if (!options.length) {
      return;
    }

    const matchingCustomField = this.findCustomField(this.getElementName(element));

    // If a custom field exists for this element, we use that to determine the value.
    // However, if the generated value is not present in the options list we will select a random one.
    if (matchingCustomField) {
      const value = this.generateDummyDataForCustomField(matchingCustomField);

      if (options.includes(value)) {
        element.value = value;
        this.fireEventsIfEnabled(element);
        return;
      }
    }

    if (!element.multiple) {
      element.value = this.generator.randomElement(options);
      this.fireEventsIfEnabled(element);
      return;
    }

    const optionsCount = element.options.length;

    // Unselect any existing options.
    for (let i = 0; i < optionsCount; i += 1) {
      if (!element.options[i].disabled) {
        element.options[i].selected = false;
      }
    }

    // Select a random number of options.
    const numberOfOptionsToSelect = this.generator.randomNumber(1, optionsCount);

    for (let i = 0; i < numberOfOptionsToSelect; i += 1) {
      const index = this.generator.randomNumber(0, optionsCount - 1);
      if (!element.options[index].disabled) {
        element.options[index].selected = true;
        this.fireEventsIfEnabled(element);
      }
    }
  }

  public fillContentEditableElement(element: HTMLElement): void {
    if ((element as HTMLElement).isContentEditable) {
      element.textContent = this.generator.paragraph(5, 100, 0, this.options.defaultMaxLength);
    }
  }

  public fillMultiSelectElement(element: HTMLElement) {
    const clear = element.querySelector(".multiselect-clear-icon") as HTMLElement | null;
    if (clear) {
      clear.click();
    }

    const options: string[] = [];
    element.querySelectorAll(".multiselect-options li.multiselect-option").forEach((option: Element): void => {
      const label = option.getAttribute("aria-label");
      if (label) {
        options.push(label);
      }
    });

    if (!options.length) {
      return;
    }

    const selectedOption = this.generator.randomElement<string>(options);

    const input = element.querySelector("input");
    if (!input) {
      return;
    }

    const firstOption = element.querySelector(
      `li.multiselect-option[aria-label="${selectedOption}"]`
    ) as HTMLElement | null;
    if (firstOption) {
      firstOption.click();
    }
  }

  private generateDummyDataForDate(element: HTMLInputElement | undefined, customField: ICustomField): string {
    let minDate: Date | undefined;
    let maxDate: Date | undefined;

    const isStartDate = element ? checkElementForWord(element, ["start", "from"]) : false;
    const isEndDate = element ? checkElementForWord(element, ["end", "to"]) : false;

    if (customField.minDate) {
      minDate = moment(customField.minDate).toDate();
    } else if (!Number.isNaN(Number(customField.min))) {
      minDate = moment(new Date()).add(customField.min, "days").toDate();
    }

    if (customField.maxDate) {
      maxDate = moment(customField.maxDate).toDate();
    } else if (!Number.isNaN(Number(customField.max))) {
      maxDate = moment(new Date()).add(customField.max, "days").toDate();
    }

    if (isEndDate) {
      if (this.previousDate) {
        minDate = moment(this.previousDate).toDate();
        if (maxDate && moment(maxDate).isBefore(minDate)) {
          maxDate = moment(minDate).add(1, "month").toDate();
        }
      }
    }

    const format = (element?.type === "date" ? "YYYY-MM-DD" : customField.template) || "DD-MM-YYYY";

    if (element?.type === "date") {
      if (element.min && moment(element.min).isValid()) {
        minDate = moment(element.min).toDate();
      }

      if (element.max && moment(element.max).isValid()) {
        maxDate = moment(element.max).toDate();
      }
    }

    const value = moment(this.generator.date(minDate, maxDate)).format(format);

    if (isStartDate) {
      this.previousDate = value;
    }

    if (isEndDate) {
      this.previousDate = null;
    }

    return value;
  }
}

export default ElementFiller;
