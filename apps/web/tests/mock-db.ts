export const userPreferences = {};
export const usageEvents = {};

export const mockState = {
  geminiApiKey: null as string | null,
  totalUsage: 0,
  selectCalled: false,
};

export const db = {
  query: {
    userPreferences: {
      findFirst: async () => {
        return mockState.geminiApiKey ? { geminiApiKey: mockState.geminiApiKey } : null;
      },
    },
  },
  select: () => {
    mockState.selectCalled = true;
    return {
      from: () => ({
        where: async () => [{ total: mockState.totalUsage }],
      }),
    };
  },
};
