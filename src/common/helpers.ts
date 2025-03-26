import { ICustomField, IFakeFillerOptions } from "src/types";

// spell-checker:disable

const DEFAULT_TELEPHONE_TEMPLATE = "+1 (XxX) XxX-XxxX";

export const CURRENT_SETTINGS_VERSION = 1;

export const DEFAULT_EMAIL_CUSTOM_FIELD: ICustomField = {
  type: "email",
  name: "Email Address",
  match: ["email"],
  emailPrefix: "",
  emailSuffix: "",
  emailUsername: "random",
  emailUsernameList: ["jack", "jill"],
  emailUsernameRegEx: "",
  emailHostname: "list",
  emailHostnameList: ["example.com"],
};

const FakeFillerDefaultOptions = (): IFakeFillerOptions => {
  const options: IFakeFillerOptions = {
    version: CURRENT_SETTINGS_VERSION,
    agreeTermsFields: ["agree", "terms", "conditions"],
    confirmFields: ["confirm", "reenter", "retype", "repeat", "secondary"],
    defaultMaxLength: 20,
    enableContextMenu: false,
    fieldMatchSettings: {
      matchLabel: false,
      matchAriaLabel: false,
      matchAriaLabelledBy: false,
      matchId: true,
      matchName: true,
      matchClass: true,
      matchPlaceholder: true,
      customAttributes: [],
    },
    fields: [],
    ignoredFields: ["captcha", "hipinputtext"],
    ignoreFieldsWithContent: true,
    ignoreHiddenFields: true,
    passwordSettings: {
      mode: "defined",
      password: "Pa$$w0rd!",
    },
    profiles: [],
    triggerClickEvents: true,
    uploadFiles: true,
    urlMatchesToBlock: ["trello"],
  };

  options.fields.push({
    type: "regex",
    name: "Postcode",
    match: ["postcode", "postalcode"],
    template: "[34][1-8]{3}",
  });

  options.fields.push({
    type: "date",
    name: "Date of Birth",
    match: ["birthdate", "dateofbirth"],
    template: "DD-MM-YYYY",
    minDate: "1970-01-01",
    maxDate: "2000-01-01",
  });

  options.fields.push({
    type: "date",
    name: "Expiry Date",
    match: ["expiry"],
    template: "DD-MM-YYYY",
    min: 30,
    max: 3000,
  });

  options.fields.push({
    type: "date",
    name: "Date",
    match: ["date\\s+"],
    template: "DD-MMM-YYYY",
    max: 0,
    minDate: "1970-01-01",
  });

  options.fields.push({
    type: "regex",
    name: "Passport #",
    match: ["passportnumber"],
    template: "P\\d{7}",
  });

  options.fields.push({
    type: "username",
    name: "Username",
    match: ["userid", "username"],
  });

  options.fields.push({
    type: "first-name",
    name: "First Name",
    match: ["firstname", "givenname", "middlename"],
  });

  options.fields.push({
    type: "last-name",
    name: "Last Name",
    match: ["lastname", "surname", "secondname", "familyname"],
  });

  options.fields.push(DEFAULT_EMAIL_CUSTOM_FIELD);

  options.fields.push({
    type: "organization",
    name: "Organization or Company Name",
    match: ["organization", "organisation", "company"],
  });

  options.fields.push({
    type: "full-name",
    name: "Full Name",
    match: ["fullname", "name"],
  });

  options.fields.push({
    type: "regex",
    name: "Credit Card",
    match: ["creditcard"],
    template:
      // tslint:disable-next-line:max-line-length
      "((42){7}0|4000056655665550|5{12}4440|2223003122003220|520082{5}10|(510){5}0|378282246310005|371449635398431|6011(11|98)1{9}0|6011000990139420|3056930009020000|36227206271667|6555900000604100|3566002020360500|620{12}(4|0)0|620550{14}|(40{5}|5{6})2500001001|4000050360000001|5555050360000080)",
  });

  options.fields.push({
    type: "telephone",
    name: "Phone Number",
    match: ["phone", "fax", "mobile", "cell"],
    template: "+61 400 XXX XXX",
  });

  options.fields.push({
    type: "number",
    name: "A Random Number between 1 and 1000",
    match: ["integer", "number", "numeric", "income", "price", "qty", "quantity", "amount", "numof", "noof"],
    min: 1,
    max: 1000,
    decimalPlaces: 0,
  });

  options.fields.push({
    type: "number",
    name: "Day",
    match: ["day"],
    min: 1,
    max: 28,
    decimalPlaces: 0,
  });

  options.fields.push({
    type: "number",
    name: "Month",
    match: ["month"],
    min: 1,
    max: 12,
    decimalPlaces: 0,
  });

  options.fields.push({
    type: "number",
    name: "Year",
    match: ["year"],
    min: 1970,
    max: 2022,
    decimalPlaces: 0,
  });

  options.fields.push({
    type: "url",
    name: "Website Address",
    match: ["website"],
  });

  options.fields.push({
    type: "regex",
    name: "Address Line 2",
    match: ["address2", "addressline2", "street2"],
    template: "(Suite|Apartment|Apt.?|#|Number|No|) [1-9][0-9]{0,2}[A-G]?",
  });

  options.fields.push({
    type: "street_address",
    name: "Address Line 1",
    match: ["address", "street"],
  });

  options.fields.push({
    type: "country",
    name: "Country",
    match: ["country"],
  });

  options.fields.push({
    type: "randomized-list",
    name: "City",
    match: ["city", "location", "suburb"],
    list: ["Melbourne", "Sydney", "Brisbane", "Perth", "Adelaide", "Northern Territory", "Tasmania", "Canberra"],
  });
  return options;
};

const GetFakeFillerOptions = (): Promise<IFakeFillerOptions> => {
  return new Promise<IFakeFillerOptions>((resolve) => {
    chrome.storage.local.get("options", (result) => {
      resolve({ ...FakeFillerDefaultOptions(), ...result.options });
    });
  });
};

const CreateContextMenus = (enableContextMenu: boolean): void => {
  chrome.contextMenus.removeAll();

  if (enableContextMenu) {
    chrome.contextMenus.create({
      id: "fake-filler-all",
      title: "Fill all inputs",
      contexts: ["page", "editable"],
    });

    chrome.contextMenus.create({
      id: "fake-filler-form",
      title: "Fill this form",
      contexts: ["editable"],
    });

    chrome.contextMenus.create({
      id: "fake-filler-input",
      title: "Fill this input",
      contexts: ["editable"],
    });
  }
};

const SaveFakeFillerOptions = (options: IFakeFillerOptions): void => {
  chrome.storage.local.set({
    options,
  });

  chrome.runtime.sendMessage({ type: "optionsUpdated", data: options }, () => chrome.runtime.lastError);
  CreateContextMenus(options.enableContextMenu);
};

const SanitizeText = (text: string): string => {
  return text.replace(/[^a-zA-Z0-9]+/g, "").toLowerCase();
};

const CsvToArray = (csvString: string, sanitize = false): string[] => {
  const splitValues = csvString && csvString.length > 0 ? csvString.split(",") : [];
  const arrayData: string[] = [];

  for (let i = 0; i < splitValues.length; i += 1) {
    splitValues[i] = splitValues[i].replace(/^\s*/, "").replace(/\s*$/, "");

    if (sanitize) {
      splitValues[i] = SanitizeText(splitValues[i]);
    }

    if (splitValues[i].length > 0) {
      arrayData.push(splitValues[i]);
    }
  }

  return arrayData;
};

const MultipleLinesToArray = (text: string): string[] => {
  const splitValues = text && text.length > 0 ? text.split("\n") : [];
  const arrayData: string[] = [];

  for (let i = 0; i < splitValues.length; i += 1) {
    splitValues[i] = splitValues[i].replace(/^\s*/, "").replace(/\s*$/, "");
    if (splitValues[i].length > 0) {
      arrayData.push(splitValues[i]);
    }
  }

  return arrayData;
};

const GetKeyboardShortcuts = (): Promise<chrome.commands.Command[]> => {
  return new Promise<chrome.commands.Command[]>((resolve) => {
    chrome.commands.getAll((result) => {
      resolve(result);
    });
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GetMessage = (key: string, parameters?: any): string => {
  return chrome.i18n.getMessage(key, parameters);
};

export {
  DEFAULT_TELEPHONE_TEMPLATE,
  CreateContextMenus,
  CsvToArray,
  FakeFillerDefaultOptions,
  GetFakeFillerOptions,
  GetKeyboardShortcuts,
  GetMessage,
  MultipleLinesToArray,
  SanitizeText,
  SaveFakeFillerOptions,
};
