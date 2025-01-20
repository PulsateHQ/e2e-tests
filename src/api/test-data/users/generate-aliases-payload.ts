export function generateCsvContentForAliases(aliases: string[]): Buffer {
  let csvContent = 'User_Alias';
  for (const alias of aliases) {
    csvContent += `\n${alias}`;
  }
  return Buffer.from(csvContent, 'utf-8');
}
