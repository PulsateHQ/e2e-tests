import { CreateSegmentPayload } from '@_src/api/models/segment.model';
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
