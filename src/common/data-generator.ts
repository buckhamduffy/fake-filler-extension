import { Faker, fakerEN_AU as faker } from "@faker-js/faker";
import moment from "moment";
import RandExp from "randexp";

import { EMAIL_CONFIG, EmailGenerator, PREVIOUS_VALUES } from "./email-generator";

import * as data from "src/common/dummy-data";
import { DEFAULT_TELEPHONE_TEMPLATE } from "src/common/helpers";

class DataGenerator {
  public randomNumber(min: number, max: number, fractionDigits = 0): number {
    if (fractionDigits > 0) {
      return faker.number.float({
        min,
        max,
        fractionDigits,
      });
    }

    return faker.number.int({ min, max });
  }

  public scrambledWord(minLength = 3, maxLength = 15): string {
    const wordLength = this.randomNumber(minLength, maxLength);
    let resultWord = "";
    let odd = true;

    while (resultWord.length < wordLength) {
      const newSymbol = odd
        ? data.consonants[Math.floor(Math.random() * data.consonants.length)]
        : data.vowels[Math.floor(Math.random() * data.vowels.length)];

      odd = !odd;
      resultWord += newSymbol;
    }

    return resultWord;
  }

  public words(wordCount: number, minLength = 0, maxLength = 0): string {
    let resultPhrase = "";
    let word = "";
    let phraseLength = 0;

    // If the wordCount is insufficient to reach the minLength, the minLength takes precedence
    for (let i = 0; i < wordCount || phraseLength < minLength; i += 1) {
      word = data.wordBank[Math.floor(Math.random() * (data.wordBank.length - 1))];
      phraseLength = resultPhrase.length;

      if (
        phraseLength === 0 ||
        resultPhrase.substring(phraseLength - 1, phraseLength) === "." ||
        resultPhrase.substring(phraseLength - 1, phraseLength) === "?"
      ) {
        word = word.substring(0, 1).toUpperCase() + word.substring(1, word.length);
      }

      resultPhrase += phraseLength > 0 ? ` ${word}` : word;
    }

    if (maxLength && maxLength > 0) {
      resultPhrase = resultPhrase.substring(0, maxLength);
    }

    return resultPhrase;
  }

  public alphanumeric(template: string): string {
    const count = template.length;
    let i = 0;
    let returnValue = "";
    let currentCharacter = "";
    let ignore = false;

    for (; i < count; i += 1) {
      currentCharacter = template[i];

      if (currentCharacter === "]") {
        ignore = false;
        // eslint-disable-next-line no-continue
        continue;
      }

      if (currentCharacter === "[") {
        ignore = true;
        // eslint-disable-next-line no-continue
        continue;
      }

      if (ignore) {
        currentCharacter = "";
      }

      const alphabetsLength = data.alphabets.length;
      const consonantsLength = data.consonants.length;
      const vowelsLength = data.vowels.length;

      switch (currentCharacter) {
        case "L":
          returnValue += data.alphabets[Math.floor(Math.random() * (alphabetsLength - 1))].toUpperCase();
          break;

        case "l":
          returnValue += data.alphabets[Math.floor(Math.random() * (alphabetsLength - 1))].toLowerCase();
          break;

        case "D":
          returnValue +=
            Math.random() > 0.5
              ? data.alphabets[Math.floor(Math.random() * (alphabetsLength - 1))].toUpperCase()
              : data.alphabets[Math.floor(Math.random() * (alphabetsLength - 1))].toLowerCase();
          break;

        case "C":
          returnValue += data.consonants[Math.floor(Math.random() * (consonantsLength - 1))].toUpperCase();
          break;

        case "c":
          returnValue += data.consonants[Math.floor(Math.random() * (consonantsLength - 1))].toLowerCase();
          break;

        case "E":
          returnValue +=
            Math.random() > 0.5
              ? data.consonants[Math.floor(Math.random() * (consonantsLength - 1))].toUpperCase()
              : data.consonants[Math.floor(Math.random() * (consonantsLength - 1))].toLowerCase();
          break;

        case "V":
          returnValue += data.vowels[Math.floor(Math.random() * (vowelsLength - 1))].toUpperCase();
          break;

        case "v":
          returnValue += data.vowels[Math.floor(Math.random() * (vowelsLength - 1))].toLowerCase();
          break;

        case "F":
          returnValue +=
            Math.random() > 0.5
              ? data.vowels[Math.floor(Math.random() * (vowelsLength - 1))].toUpperCase()
              : data.vowels[Math.floor(Math.random() * (vowelsLength - 1))].toLowerCase();
          break;

        case "X":
          returnValue += this.randomNumber(1, 9);
          break;

        case "x":
          returnValue += this.randomNumber(0, 9);
          break;

        default:
          returnValue += template[i];
          break;
      }
    }

    return returnValue;
  }

  public paragraph(minWords: number, maxWords: number, minLength: number, maxLength: number): string {
    const wordCount = this.randomNumber(minWords, maxWords);
    let resultPhrase = this.words(wordCount, minLength, maxLength);

    resultPhrase = resultPhrase.replace(/[?.!,;]? ?[^ ]*$/, "!");

    while (resultPhrase.length < minLength) {
      resultPhrase += "!";
    }

    return resultPhrase;
  }

  public phrase(minLength: number, maxLength: number): string {
    const length = this.randomNumber(5, 20);
    let resultPhrase = this.words(length, minLength, maxLength);

    resultPhrase = resultPhrase.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");

    if (resultPhrase.length < minLength) {
      const missingLength = minLength - resultPhrase.length;
      resultPhrase += this.scrambledWord(missingLength, missingLength);
    }

    return resultPhrase;
  }

  public website(): string {
    return faker.internet.url();
  }

  public phoneNumber(template: string = DEFAULT_TELEPHONE_TEMPLATE): string {
    let i = 0;
    let telephone = "";

    for (; i < template.length; i += 1) {
      if (template[i] === "X") {
        telephone += this.randomNumber(1, 9);
      } else if (template[i] === "x") {
        telephone += this.randomNumber(0, 9);
      } else {
        telephone += template[i];
      }
    }

    return telephone;
  }

  public date(from?: Date, to?: Date, format?: string): string {
    const date = faker.date.between({ from: from || "1970-01-01", to: to || new Date() });
    return moment(date).format(format || "YYYY-MM-DD");
  }

  public time(): string {
    return faker.date.anytime().toTimeString();
  }

  public month(): string {
    return faker.date.anytime().getMonth().toString();
  }

  public year(): string {
    return faker.date.between({ from: 1970, to: new Date().getFullYear() }).getFullYear().toString();
  }

  public weekNumber(): string {
    return `0${this.randomNumber(1, 52)}`.slice(-2);
  }

  public firstName(): string {
    return faker.person.firstName();
  }

  public lastName(): string {
    return faker.person.lastName();
  }

  public organizationName(): string {
    return faker.company.name();
  }

  public color(): string {
    return faker.color.rgb();
  }

  public email(): string {
    return faker.internet.exampleEmail();
  }

  public faker(): Faker {
    return faker;
  }

  public emailConfig(config: EMAIL_CONFIG, previous: Partial<PREVIOUS_VALUES>): string {
    const emailGenerator = new EmailGenerator(config, previous);
    return emailGenerator.generate();
  }

  public generateRandomStringFromRegExTemplate(regexTemplate: string): string {
    let randomValue = "";

    if (regexTemplate) {
      try {
        const regExGenerator = new RandExp(regexTemplate);
        regExGenerator.defaultRange.add(0, 65535);
        randomValue = regExGenerator.gen();
      } catch (e: any) {
        randomValue = e.toString();
      }
    }

    return randomValue;
  }

  public streetAddress() {
    return faker.location.streetAddress();
  }

  public randomElement<RandomType>(options: RandomType[]): RandomType {
    // @ts-ignore
    return faker.helpers.arrayElement(options);
  }

  public country(): string {
    return this.randomElement<string>([
      "Australia",
      "New Zealand",
      "Samoa",
      "Solomon Islands",
      "Vanuatu",
      "Timor-Leste",
      "Papua New Guinea",
      "Fiji",
      "Tonga",
      "Kiribati",
      "Tuvalu",
      "Nauru",
    ]);
  }
}

export default DataGenerator;
