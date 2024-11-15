import { CreateSegmentPayload } from '@_src/api/models/create-segment.api.model';
import { faker } from '@faker-js/faker';

export const createSegmentAllUsersPayload: CreateSegmentPayload = {
  name: faker.lorem.word(),
  groups: [
    {
      join_type: '+',
      rules: [
        {
          type: 'all_users',
          match_type: 'equal',
          match_value: 'true'
        }
      ]
    }
  ]
};
