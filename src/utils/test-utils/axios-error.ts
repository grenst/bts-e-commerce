import { AxiosError, AxiosHeaders, AxiosResponse } from 'axios';

export function createAxiosError(
  responseData: unknown,
  status = 400
): AxiosError {
  const error = new AxiosError('Axios error');

  const axiosResponse: AxiosResponse = {
    data: responseData,
    status,
    statusText: 'Error',
    headers: {},
    config: {
      headers: new AxiosHeaders(),
      url: '/mock-url',
      method: 'get',
    },
  };
  error.response = axiosResponse;

  return error;
}
