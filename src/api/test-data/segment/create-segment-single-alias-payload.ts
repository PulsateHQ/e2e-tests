import { CreateSegmentPayload } from '@_src/api/models/create-segment.api.model';
import { faker } from '@faker-js/faker/locale/en';

export const createSegmentSingleAliasPayload: CreateSegmentPayload = {
  name: faker.lorem.word(),
  groups: [
    {
      join_type: '+',
      rules: [
        {
          type: 'alias',
          match_type: 'equal',
          match_value: ''
        }
      ]
    }
  ]
};
