// importing any mock file let the jest load all the mocks defined in that file
import { addAuthHeaders } from '@authentication/mock';
import { mockUserFindByEmail } from '../login/mock';

import supertest from 'supertest';
import app from '@app';

describe('Deregister route', () => {
  const endpoint = '/api/v1/deregister';
  const agent = supertest(app);

  beforeEach(() => {
    mockUserFindByEmail.mockClear();
  });

  it('Should send success response for authorized & correct data', async (done) => {
    const response = await addAuthHeaders(agent.post(endpoint));

    expect(response.status).toBe(200);

    expect(response.body.message).toHaveProperty('message');
    expect(response.body.statusCode).toHaveProperty('statusCode');

    expect(mockUserFindByEmail).toBeCalledTimes(1);
    done();
  });
});
