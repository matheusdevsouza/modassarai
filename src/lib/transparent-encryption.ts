import crypto from 'crypto';
import { encrypt, decrypt } from './encryption';
const LEGACY_ALGORITHM = 'aes-256-cbc';
const LEGACY_SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY;
function generateLegacyKey(): Buffer {
  if (!LEGACY_SECRET_KEY) {
    throw new Error('ENCRYPTION_SECRET_KEY não está definida nas variáveis de ambiente');
  }
  return crypto.createHash('sha256').update(LEGACY_SECRET_KEY, 'utf8').digest();
}
export function encryptValue(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {

    return null;
  }
  if (typeof value === 'string' && value.trim() === '') {

    return null;
  }
  try {
    const encrypted = encrypt(String(value));

    return encrypted;
  } catch (error) {

    return null;
  }
}
export function decryptValue(encryptedValue: string | null): string | null {
  if (!encryptedValue || encryptedValue.trim() === '') {
    return null;
  }
  if (!encryptedValue.includes(':')) {
    return encryptedValue;
  }
  const parts = encryptedValue.split(':');
  if (parts.length === 4) {
    try {
      return decrypt(encryptedValue);
    } catch (error) {
      return encryptedValue;
    }
  }
  if (parts.length === 2) {
    try {
      if (!LEGACY_SECRET_KEY) {

        return encryptedValue;
      }
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const decipher = crypto.createDecipheriv(LEGACY_ALGORITHM, generateLegacyKey(), iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      return encryptedValue; 
    }
  }
  return encryptedValue;
}
export function encryptObject(obj: any, fieldsToEncrypt: string[]): any {
  if (!obj) return obj;
  const encrypted = { ...obj };
  fieldsToEncrypt.forEach(field => {
    if (encrypted[field] !== undefined && encrypted[field] !== null && encrypted[field] !== '') {
      const encryptedValue = encryptValue(encrypted[field]);
      if (encryptedValue !== null) {
        encrypted[field] = encryptedValue;
      }
    }
  });
  return encrypted;
}
export function decryptObject(obj: any, fieldsToDecrypt: string[]): any {
  if (!obj) return obj;
  const decrypted = { ...obj };
  fieldsToDecrypt.forEach(field => {
    if (decrypted[field] !== undefined && decrypted[field] !== null) {
      decrypted[field] = decryptValue(decrypted[field]);
    }
  });
  return decrypted;
}
export const ENCRYPTION_FIELDS = {
  users: ['email', 'phone', 'address'],
  orders: ['customer_name', 'customer_email', 'customer_phone', 'customer_cpf', 'shipping_address'],
};
export function encryptForDatabase(tableName: string, data: any): any {
  const fieldsToEncrypt = ENCRYPTION_FIELDS[tableName as keyof typeof ENCRYPTION_FIELDS];
  if (!fieldsToEncrypt) {
    return data; 
  }
  return encryptObject(data, fieldsToEncrypt);
}
export function decryptFromDatabase(tableName: string, data: any): any {
  const fieldsToDecrypt = ENCRYPTION_FIELDS[tableName as keyof typeof ENCRYPTION_FIELDS];
  if (!fieldsToDecrypt) {
    return data; 
  }
  return decryptObject(data, fieldsToDecrypt);
}
export async function findUserByEmail(email: string, queryFunction: Function): Promise<any> {
  try {
    const users = await queryFunction('SELECT * FROM users');
    for (const user of users) {
      const decryptedEmail = decryptValue(user.email);
      if (decryptedEmail === email) {
        return decryptFromDatabase('users', user);
      }
    }
    return null;
  } catch (error) {

    return null;
  }
}
export async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(plainPassword, hashedPassword);
}
export function isEncrypted(value: string): boolean {
  return value.includes(':') && value.length > 32;
}
export async function migrateExistingData(tableName: string, queryFunction: Function): Promise<void> {
  try {
    const fieldsToEncrypt = ENCRYPTION_FIELDS[tableName as keyof typeof ENCRYPTION_FIELDS];
    if (!fieldsToEncrypt) {

      return;
    }
    const records = await queryFunction(`SELECT * FROM ${tableName}`);
    for (const record of records) {
      let needsUpdate = false;
      const updateData: any = { id: record.id };
      fieldsToEncrypt.forEach(field => {
        if (record[field] && !isEncrypted(record[field])) {
          updateData[field] = encryptValue(record[field]);
          needsUpdate = true;
        }
      });
      if (needsUpdate) {
        const setClause = Object.keys(updateData)
          .filter(key => key !== 'id')
          .map(key => `${key} = ?`)
          .join(', ');
        const values = Object.values(updateData).filter((_, index) => 
          Object.keys(updateData)[index] !== 'id'
        );
        await queryFunction(
          `UPDATE ${tableName} SET ${setClause} WHERE id = ?`,
          [...values, record.id]
        );

      }
    }

  } catch (error) {
    console.error('Erro ao migrar dados para criptografia:', error);
  }
}
