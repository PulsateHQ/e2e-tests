import {
  API_E2E_ACCESS_TOKEN_ADMIN,
  SUPER_ADMIN_ACCESS_TOKEN
} from '@_config/env.config';
import {
  addResourcesToGroupWithApi,
  createGroupForSegmentWithApi,
  deleteGroupWithApi,
  getAllGroupsWithApi,
  getSingleGroupWithApi,
  removeResourcesFromGroupWithApi,
  updateGroupWithApi
} from '@_src/api/factories/groups.api.factory';
import {
  createSegmentWithApi,
  getSingleSegmentWithApi
} from '@_src/api/factories/segments.api.factory';
import { APIE2ELoginUserModel } from '@_src/api/models/admin.model';
import { createGroupSegmentsPayload } from '@_src/api/test-data/cms/group/create-group-segments.payload';
import { createSegmentAllUsersPayload } from '@_src/api/test-data/cms/segment/create-segment-all-users.payload';
import { setupIsolatedCompany } from '@_src/api/utils/company-registration.util';
import {
  deleteAllCampaigns,
  deleteAllGroups,
  deleteAllSegments,
  deleteAllUsers,
  importRandomUsers
} from '@_src/api/utils/data.manager.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';

test.describe('Groups Management', () => {
  let APIE2ELoginUserModel: APIE2ELoginUserModel;

  test.beforeAll(async ({ request }) => {
    // Create isolated company/app for this test file
    APIE2ELoginUserModel = await setupIsolatedCompany(
      request,
      SUPER_ADMIN_ACCESS_TOKEN,
      API_E2E_ACCESS_TOKEN_ADMIN,
      'groups.api.spec.ts'
    );
  });

  test.beforeEach(async ({ request }) => {
    await deleteAllCampaigns(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId
    );
    await deleteAllUsers(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId
    );
    await deleteAllSegments(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId
    );
    await deleteAllGroups(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId
    );
  });

  test('should manage group lifecycle with segment resource assignments', async ({
    request
  }) => {
    // Arrange
    const numberOfUsers = 3;
    await importRandomUsers(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId,
      numberOfUsers
    );

    const createSegmentResponse = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createSegmentAllUsersPayload(),
      APIE2ELoginUserModel.apiE2EAppId
    );
    const createSegmentResponseJson = await createSegmentResponse.json();
    const firstSegmentId = createSegmentResponseJson.segment.id;

    const getAllGroupsResponse = await getAllGroupsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      undefined,
      APIE2ELoginUserModel.apiE2EAppId
    );

    expect(getAllGroupsResponse.status()).toBe(200);

    const getAllGroupsResponseJson = await getAllGroupsResponse.json();
    expect(getAllGroupsResponseJson.data).toHaveLength(0);

    // Store the payload before making the API call
    const groupPayload = createGroupSegmentsPayload();

    const createGroupResponse = await createGroupForSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      groupPayload,
      APIE2ELoginUserModel.apiE2EAppId
    );

    const createGroupResponseJson = await createGroupResponse.json();
    const firstGroupId = createGroupResponseJson.id;

    expect(createGroupResponse.status()).toBe(200);
    expect(createGroupResponseJson.name).toBe(groupPayload.group.name);
    expect(createGroupResponseJson.resource_type).toBe('Mobile::App::Segment');

    const getSingleGroupResponse = await getSingleGroupWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      firstGroupId,
      APIE2ELoginUserModel.apiE2EAppId
    );
    const getSingleGroupResponseJson = await getSingleGroupResponse.json();

    expect(getSingleGroupResponse.status()).toBe(200);
    expect(getSingleGroupResponseJson.name).toBe(groupPayload.group.name);
    expect(getSingleGroupResponseJson.id).toBe(firstGroupId);
    expect(getSingleGroupResponseJson.resource_type).toBe(
      'Mobile::App::Segment'
    );

    const addResourcesToGroupResponse = await addResourcesToGroupWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      {
        resource_ids: [firstSegmentId],
        group_id: firstGroupId
      },
      APIE2ELoginUserModel.apiE2EAppId
    );

    expect(addResourcesToGroupResponse.status()).toBe(200);

    const getSingleGroupAfterAddResourcesResponse = await getSingleGroupWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      firstGroupId,
      APIE2ELoginUserModel.apiE2EAppId
    );

    expect(getSingleGroupAfterAddResourcesResponse.status()).toBe(200);
    const getSingleGroupAfterAddResourcesResponseJson =
      await getSingleGroupAfterAddResourcesResponse.json();
    expect(
      getSingleGroupAfterAddResourcesResponseJson.resource_ids.segment_ids
    ).toContain(firstSegmentId);

    const getSingleSegmentWithApiResponse = await getSingleSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      firstSegmentId,
      APIE2ELoginUserModel.apiE2EAppId
    );
    const getSingleSegmentWithApiResponseJson =
      await getSingleSegmentWithApiResponse.json();

    expect(getSingleSegmentWithApiResponse.status()).toBe(200);
    expect(getSingleSegmentWithApiResponseJson.groups_ids).toHaveLength(1);

    const updateGroupResponse = await updateGroupWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      firstGroupId,
      groupPayload,
      APIE2ELoginUserModel.apiE2EAppId
    );

    expect(updateGroupResponse.status()).toBe(200);
    const updateGroupResponseJson = await updateGroupResponse.json();
    expect(updateGroupResponseJson.name).toBe(groupPayload.group.name);

    const getSingleGroupAfterUpdateResponse = await getSingleGroupWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      firstGroupId,
      APIE2ELoginUserModel.apiE2EAppId
    );

    expect(getSingleGroupAfterUpdateResponse.status()).toBe(200);
    const getSingleGroupAfterUpdateResponseJson =
      await getSingleGroupAfterUpdateResponse.json();
    expect(getSingleGroupAfterUpdateResponseJson.name).toBe(
      groupPayload.group.name
    );

    const removeResourcesFromGroupResponse =
      await removeResourcesFromGroupWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        {
          resource_ids: [firstSegmentId],
          group_id: firstGroupId
        },
        APIE2ELoginUserModel.apiE2EAppId
      );

    expect(removeResourcesFromGroupResponse.status()).toBe(200);

    const getSingleGroupAfterRemoveResourcesResponse =
      await getSingleGroupWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        firstGroupId,
        APIE2ELoginUserModel.apiE2EAppId
      );

    expect(getSingleGroupAfterRemoveResourcesResponse.status()).toBe(200);
    const getSingleGroupAfterRemoveResourcesResponseJson =
      await getSingleGroupAfterRemoveResourcesResponse.json();
    expect(
      getSingleGroupAfterRemoveResourcesResponseJson.resource_ids.segment_ids
    ).not.toContain(firstSegmentId);

    const deleteGroupResponse = await deleteGroupWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      firstGroupId,
      APIE2ELoginUserModel.apiE2EAppId
    );

    expect(deleteGroupResponse.status()).toBe(200);

    const getAllGroupsAfterDeleteResponse = await getAllGroupsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      undefined,
      APIE2ELoginUserModel.apiE2EAppId
    );

    expect(getAllGroupsAfterDeleteResponse.status()).toBe(200);
    const getAllGroupsAfterDeleteResponseJson =
      await getAllGroupsAfterDeleteResponse.json();
    expect(getAllGroupsAfterDeleteResponseJson.data).toHaveLength(0);
  });
});
