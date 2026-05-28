const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const readApiJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { error: "Received an invalid server response." };
  }
};

export const getApiErrorMessage = (payload: unknown, fallback: string) => {
  if (isRecord(payload) && typeof payload.error === "string" && payload.error) {
    return payload.error;
  }

  return fallback;
};
