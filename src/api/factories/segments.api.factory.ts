import { CreateSegmentPayload } from '@_src/api/models/create-segment.api.model';
import { Headers } from '@_src/api/models/headers.api.model';
import { apiUrls } from '@_src/api/utils/api.util';
import { generateCsvContentForAliases } from '@_src/api/utils/apiDataManager.util';
import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIRequestContext, APIResponse } from '@playwright/test';

export async function getAllSegmentsWithApi(
  request: APIRequestContext,
  authToken: string
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const url = `${apiUrls.segments.v2}?show=all`;

  const response = await request.get(url, { headers });

  const responseBody = await response.text();
  const expectedStatusCode = 200;

  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty('data');
  expect(responseJson).toHaveProperty('bulk_actions');
  expect(responseJson).toHaveProperty('metadata');

  return response;
}

export async function getSingleSegmentUsersWithApi(
  request: APIRequestContext,
  authToken: string,
  segmentId: string
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const url = `${apiUrls.segments.v2}/${segmentId}/users`;

  const response = await request.get(url, { headers });

  const responseBody = await response.text();
  const expectedStatusCode = 200;

  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty('data');
  expect(responseJson).toHaveProperty('metadata');

  return response;
}

export async function getSingleSegmentWithApi(
  request: APIRequestContext,
  authToken: string,
  segmentId: string
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const url = `${apiUrls.segments.v2}/${segmentId}`;

  const response = await request.get(url, { headers });

  const responseBody = await response.text();
  const expectedStatusCode = 200;

  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('created_at');
  expect(responseJson).toHaveProperty('groups');

  return response;
}

export async function getTotalAudienceForSegmentWithApi(
  request: APIRequestContext,
  authToken: string,
  expectedTotalAudience?: number
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const url = `${apiUrls.segments.v2}/total_audience`;

  let response: APIResponse;

  await expect(async () => {
    response = await request.get(url, { headers });
    const responseBody = await response.text();
    const expectedStatusCode = 200;

    const responseJson = JSON.parse(responseBody);

    expect(
      response.status(),
      `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
    ).toBe(expectedStatusCode);

    if (expectedTotalAudience !== undefined) {
      expect(responseJson).toHaveProperty(
        'total_audience',
        expectedTotalAudience
      );
    }
  }).toPass({ timeout: 20_000 });

  return response!;
}

export async function getUserCountForAlias(
  request: APIRequestContext,
  authToken: string,
  alias: string
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const url = `${apiUrls.segments.v2}/users_count`;

  const payload = {
    segment: {
      groups: [
        {
          join_type: '+',
          rules: [
            {
              type: 'alias',
              match_value: alias,
              match_type: 'equal'
            }
          ]
        }
      ]
    }
  };

  const response = await request.post(url, {
    headers,
    data: JSON.stringify(payload)
  });

  const responseBody = await response.text();
  const expectedStatusCode = 200;

  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty('users_count');

  return response;
}

export async function estimateSegmentsWithApi(
  request: APIRequestContext,
  authToken: string,
  segmentsIds: string
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json'
  };

  const url = `${apiUrls.segments.v2}/estimate?segment_ids=${segmentsIds}`;

  const response = await request.get(url, { headers });

  const responseBody = await response.text();
  const expectedStatusCode = 200;

  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty('max');
  expect(responseJson).toHaveProperty('min');

  return response;
}

export async function createSegmentWithApi(
  request: APIRequestContext,
  authToken: string,
  payload: CreateSegmentPayload
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const response = await request.post(apiUrls.segments.v1, {
    headers,
    data: JSON.stringify(payload)
  });

  const responseBody = await response.text();
  const expectedStatusCode = 200;

  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty('segment');
  expect(responseJson.segment).toHaveProperty('name', payload.name);
  expect(responseJson.segment).toHaveProperty('groups');

  return response;
}

export async function updateSegmentWithApi(
  request: APIRequestContext,
  authToken: string,
  segmentsIds: string,
  payload: CreateSegmentPayload
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const url = `${apiUrls.segments.v1}/${segmentsIds}`;

  const response = await request.put(url, {
    headers,
    data: JSON.stringify(payload)
  });

  const responseBody = await response.text();
  const expectedStatusCode = 200;

  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty('name', payload.name);
  expect(responseJson).toHaveProperty('groups');
  expect(responseJson).toHaveProperty('hidden', false);
  expect(responseJson).toHaveProperty('hidden_at', null);
  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('users_count');

  return response;
}

export async function duplicateSegmentWithApi(
  request: APIRequestContext,
  authToken: string,
  segmentsIds: string
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const url = `${apiUrls.segments.v1}/${segmentsIds}/duplicate`;

  const response = await request.post(url, {
    headers
  });

  const responseBody = await response.text();
  const expectedStatusCode = 200;

  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty('name');
  expect(responseJson).toHaveProperty('groups');
  expect(responseJson).toHaveProperty('hidden', false);
  expect(responseJson).toHaveProperty('hidden_at', null);
  expect(responseJson).toHaveProperty('id');
  expect(responseJson).toHaveProperty('users_count');

  return response;
}

export async function createSegmentFromFile(
  request: APIRequestContext,
  authToken: string,
  segmentName: string,
  customTag: string,
  aliases: string[]
): Promise<APIResponse> {
  const csvContent = generateCsvContentForAliases(aliases);

  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: '*/*',
    ContentType: 'multipart/form-data'
  };

  const response = await request.post(
    `${apiUrls.segments.v2}/create_from_file`,
    {
      headers,
      multipart: {
        file: {
          name: 'segment_file_with_aliases.csv',
          mimeType: 'text/csv',
          buffer: csvContent
        },
        segment_name: segmentName,
        custom_tag: customTag
      }
    }
  );

  const responseBody = await response.text();
  const expectedStatusCode = 200;
  const responseJson = JSON.parse(responseBody);

  expect(response.status()).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty('segment');
  expect(responseJson.segment).toBe(
    "Thank you for your submission. We are currently processing your list to create the segment. Processing large lists may require additional time. You will receive an email notification once the segment is ready. If you don't see the email, please check your spam or junk folder.<br /><br /><i>Please note: Users on the list who do not have online or mobile banking will be excluded from the segment.</i>"
  );

  return response;
}

export async function batchDeleteSegmentsWithApi(
  request: APIRequestContext,
  authToken: string,
  resourceIds: string[]
): Promise<APIResponse> {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const payload = {
    resource_ids: resourceIds
  };

  const response = await request.delete(
    `${apiUrls.segments.v2}/batch_destroy`,
    {
      headers,
      data: JSON.stringify(payload)
    }
  );

  const responseBody = await response.text();

  const expectedStatusCode = 200;

  const responseJson = JSON.parse(responseBody);

  expect(
    response.status(),
    `Expected status: ${expectedStatusCode} and observed: ${response.status()}`
  ).toBe(expectedStatusCode);
  expect(responseJson).toHaveProperty('resources_count');

  return response;
}
