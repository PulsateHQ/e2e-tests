import { GeofencePayload } from '@_src/api/models/geofence.model';
import { faker } from '@faker-js/faker';

export const geofencePayload: GeofencePayload = {
  radius: '500',
  location: [49.51742021, 21.2563691],
  shape: 'circle',
  id: 'temp',
  error: {},
  groups: [],
  is_draggable: true,
  is_editable: false,
  name: faker.word.words(3)
};
