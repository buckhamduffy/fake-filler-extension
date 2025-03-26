import { fakerEN_AU as faker } from "@faker-js/faker";
import RandExp from "randexp";

import { EmailHostnameType, EmailUsernameType } from "../types";

import { DEFAULT_EMAIL_CUSTOM_FIELD, SanitizeText } from "./helpers";
import { blank } from "./utils/value";

export type EMAIL_CONFIG = {
  emailPrefix?: string;
  emailSuffix?: string;
  emailHostname?: EmailHostnameType;
  emailHostnameList?: string[];
  emailUsername?: EmailUsernameType;
  emailUsernameList?: string[];
  emailUsernameRegEx?: string;
};

export type PREVIOUS_VALUES = {
  previousValue: string | null;
  previousPassword: string | null;
  previousUsername: string | null;
  previousFirstName: string | null;
  previousLastName: string | null;
};

export class EmailGenerator {
  private config: EMAIL_CONFIG;
  private previous: PREVIOUS_VALUES;

  constructor(config: EMAIL_CONFIG, previous: Partial<PREVIOUS_VALUES> = {}) {
    this.config = config;
    this.previous = {
      previousValue: "",
      previousPassword: "",
      previousUsername: "",
      previousFirstName: "",
      previousLastName: "",
      ...previous,
    };
  }

  private generateUsername(): string {
    switch (this.config.emailUsername) {
      case "list": {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const usernames = this.config.emailUsernameList || DEFAULT_EMAIL_CUSTOM_FIELD.emailUsernameList!;

        // @ts-ignore
        return faker.helpers.arrayElement(usernames);
      }

      case "username": {
        if (!blank(this.previous.previousUsername)) {
          return SanitizeText(this.previous.previousUsername);
        }
        return faker.internet.username();
      }

      case "name": {
        return SanitizeText(
          [
            this.previous.previousFirstName || faker.person.firstName().toLowerCase(),
            this.previous.previousLastName || faker.person.lastName().toLowerCase(),
          ].join(".")
        );
      }

      case "regex": {
        if (this.config.emailUsernameRegEx) {
          try {
            const regExGenerator = new RandExp(this.config.emailUsernameRegEx);
            regExGenerator.defaultRange.add(0, 65535);
            return regExGenerator.gen();
          } catch (ex: any) {
            return ex.toString();
          }
        }

        return faker.internet.username();
      }

      default:
        return faker.internet.username();
    }
  }

  private generateDomain(): string {
    if (this.config.emailHostname === "list") {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const hostnames = this.config.emailHostnameList || DEFAULT_EMAIL_CUSTOM_FIELD.emailHostnameList!;
      // @ts-ignore
      const domain = faker.helpers.arrayElement(hostnames);
      if (domain) {
        if (domain.indexOf("@") === -1) {
          return `@${domain}`;
        }
        return domain;
      }
    }

    return `@${faker.internet.domainName()}`;
  }

  private generateSuffix(): string {
    const suffix = this.config.emailSuffix || "";
    return suffix.replace(/\[hostname\]/g, window.location.hostname);
  }

  private generatePrefix(): string {
    return this.config.emailPrefix || "";
  }

  public generate(): string {
    return [this.generatePrefix(), this.generateUsername(), this.generateSuffix(), this.generateDomain()].join("");
  }
}
