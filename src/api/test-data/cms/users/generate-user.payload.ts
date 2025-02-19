import { faker } from '@faker-js/faker/locale/en';

export function generateRandomUser(): string {
  const userAlias = faker.internet
    .username({ firstName: 'Piotr' })
    .replace(/\./g, '_');
  const emailAddress = faker.internet.email();
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const smsPhoneNumber = faker.phone.number();
  const currentCity = faker.location.city();
  const age = faker.number.int({ min: 18, max: 80 });
  const gender = faker.person.sex();

  return `${userAlias},${emailAddress},${firstName},${lastName},${smsPhoneNumber},${currentCity},${age},${gender}`;
}

export function generateCsvContentForUsersImport(
  numberOfUsers: number
): Buffer {
  let csvContent =
    'userAlias,emailAddress,firstName,lastName,smsPhoneNumber,currentCity,age,gender';

  for (let i = 0; i < numberOfUsers; i++) {
    const randomUser = generateRandomUser();
    csvContent += `\n${randomUser}`;
  }

  return Buffer.from(csvContent, 'utf-8');
}
