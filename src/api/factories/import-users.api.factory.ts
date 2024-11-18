import { Headers } from '@_src/api/models/headers.api.model';
import { ImportUsersPayload } from '@_src/api/models/import-users.api.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

function readCsvFile(filePath: string): Buffer {
  return fs.readFileSync(filePath);
}

export async function importUsersWithApi(
  request: APIRequestContext,
  authToken: string,
  { file, app_id }: ImportUsersPayload
): Promise<APIResponse> {
  const filePath = path.resolve(file);
  const fileContent = readCsvFile(filePath);

  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: '*/*',
    ContentType: 'multipart/form-data'
  };

  const response = await request.post(apiUrls.importUsersUrl, {
    headers,
    multipart: {
      file: {
        name: filePath,
        mimeType: 'text/csv',
        buffer: fileContent
      },
      app_id: app_id
    }
  });

  const responseBody = await response.text();

  const expectedStatusCode = 200;

  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson.app_id).toBe(app_id);
  expect(responseJson.file).toBe('manual upload');

  return response;
}
