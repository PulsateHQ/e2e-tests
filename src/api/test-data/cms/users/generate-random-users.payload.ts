import { faker } from '@faker-js/faker/locale/en';

export function generateRandomUser(): string {
  return [
    `Lake ${faker.person.lastName()}field`,
    `playwright_${faker.person.firstName().toLowerCase()}${faker.number.int({ min: 100, max: 999 })}`,
    faker.person.firstName(),
    faker.person.lastName(),
    `${faker.person.firstName().toLowerCase()}.${faker.person.lastName().toLowerCase()}@example.com`,
    faker.phone.number({ style: 'national' })
  ]
    .map((field, index) => (index === 5 ? `"${field}"` : String(field)))
    .join(',');
}

export function generateCsvContentForUsersImport(
  numberOfUsers: number
): Buffer {
  const csvContent = [
    'Random,User Alias,First Name,Last Name,Email Address,SMS Phone Number'
  ];

  for (let i = 0; i < numberOfUsers; i++) {
    csvContent.push(generateRandomUser());
  }

  return Buffer.from(csvContent.join('\n'), 'utf-8');
}
