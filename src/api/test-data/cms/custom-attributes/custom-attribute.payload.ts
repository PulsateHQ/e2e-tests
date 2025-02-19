import { CustomAttribute } from '@_src/api/models/custom-attribute.model';
import { faker } from '@faker-js/faker/locale/en';

export function generateUniqueCustomTag(): string {
  return `custom_tag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export const createCustomAttributePayload = (
  overrides: Partial<CustomAttribute> = {}
): CustomAttribute => {
  return {
    source:
      overrides.source ||
      faker.helpers.arrayElement(['cunexus', 'other_source']),
    product_id:
      overrides.product_id ||
      faker.helpers.arrayElement(['motor_loan', 'personal_loan', 'mortgage']),
    category:
      overrides.category ||
      faker.helpers.arrayElement(['loans', 'cards', 'investments']),
    name:
      overrides.name ||
      `${overrides.source || 'cunexus'}_${overrides.product_id || 'motor_loan'}`,
    value:
      overrides.value || faker.number.int({ min: 5000, max: 50000 }).toString()
  };
};
