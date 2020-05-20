import ApiKey from '@repository/apikey/ApiKeyModel';

export const API_KEY = 'random-api-key';

export const mockFindApiKey = jest.fn(async (key: string) => {
  if (key === API_KEY) {
    return { key } as ApiKey;
  }
  return null;
});

jest.mock('@repository/apikey', () => ({
  get findByKey() {
    return mockFindApiKey;
  },
}));
