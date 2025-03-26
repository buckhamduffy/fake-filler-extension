import { isArray, isBoolean, isNumber, isPlainObject, isString } from "lodash-es";

type Blank = null | undefined | "" | [] | Record<string, never> | 0 | false;

export const isNull = (value: unknown): boolean => {
  return value === undefined || value === null || Number.isNaN(value);
};

export const blank = (value: unknown): value is Blank => {
  if (isNull(value)) {
    return true;
  }

  if (isString(value)) {
    return value.trim() === "";
  }

  if (isBoolean(value) || isNumber(value)) {
    return false;
  }

  if (isPlainObject(value)) {
    const obj = value as Record<string, unknown>;

    if (!Object.keys(obj).length) {
      return true;
    }

    return Object.values(obj).every(blank);
  }

  if (isArray(value)) {
    return value.length === 0 || value.every(blank);
  }

  return false;
};

export const filled = <T>(value: unknown): value is T => {
  return !blank(value);
};
