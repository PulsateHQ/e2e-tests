import { CreateSegmentPayload } from '@_src/api/models/segment.model';
import { faker } from '@faker-js/faker/locale/en';

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
