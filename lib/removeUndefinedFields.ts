export const removeUndefinedFields = <T extends Record<string, unknown>>(payload: T): Partial<T> => {
  const sanitized: Partial<T> = {};

  for (const key of Object.keys(payload) as Array<keyof T>) {
    const value = payload[key];
    if (value !== undefined) {
      sanitized[key] = value;
    }
  }

  return sanitized;
};
