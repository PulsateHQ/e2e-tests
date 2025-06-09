import { CreateGroupPayload } from '@_src/api/models/group.model';
import { faker } from '@faker-js/faker/locale/en';

export const createGroupSegmentsPayload = (): CreateGroupPayload => ({
  group: {
    name: faker.lorem.word(),
    resource_type: 'segments'
  }
});
