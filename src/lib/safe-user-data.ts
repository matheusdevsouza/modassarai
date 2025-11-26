import { hashUserId } from './encryption';

export interface SafeUserData {
  id: string;
  internalId: number;
  name: string;
  display_name?: string;
  email: string;
  phone?: string;
  cpf?: string;
  address?: string;
  birth_date?: string;
  gender?: string;
  email_verified_at?: string | null;
  last_login?: string | null;
  is_admin: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export function processSafeUserData(userData: any): SafeUserData {
  const isEncrypted = (value: string): boolean => {
    return Boolean(value && typeof value === 'string' && value.includes(':') && value.length > 50);
  };

  const getSafeValue = (value: any, placeholder: string = 'Não informado'): string => {
    if (value === undefined || value === null || value === '') return placeholder;
    if (typeof value !== 'string') return String(value);
    if (isEncrypted(value)) return '[Dados protegidos]';
    const trimmed = value.trim();
    return trimmed === '' ? placeholder : trimmed;
  };

  let publicId = userData?.user_uuid;
  if (!publicId && userData?.id) {
    try {
      publicId = hashUserId(userData.id);
    } catch (error) {
      console.warn('Falha ao gerar identificador seguro para usuário:', error instanceof Error ? error.message : String(error));
      publicId = cryptoFallbackId();
    }
  }
  if (!publicId) {
    publicId = cryptoFallbackId();
  }

  let displayName: string | undefined = undefined;
  if (userData.display_name && userData.display_name !== null && userData.display_name !== '') {
    if (isEncrypted(userData.display_name)) {
      displayName = undefined;
    } else {
      const trimmed = String(userData.display_name).trim();
      displayName = trimmed !== '' ? trimmed : undefined;
    }
  }

  let userName = 'Usuário';
  if (userData.name && userData.name !== null && userData.name !== '') {
    if (isEncrypted(userData.name)) {
      userName = 'Usuário';
    } else {
      const trimmed = String(userData.name).trim();
      userName = trimmed !== '' ? trimmed : 'Usuário';
    }
  }

  return {
    id: publicId,
    internalId: userData.id,
    name: userName,
    display_name: displayName,
    email: getSafeValue(userData.email, 'email@exemplo.com'),
    phone: getSafeValue(userData.phone),
    cpf: getSafeValue(userData.cpf),
    address: getSafeValue(userData.address),
    birth_date: userData.birth_date || 'Não informado',
    gender: userData.gender || 'Não informado',
    email_verified_at: userData.email_verified_at || null,
    last_login: userData.last_login || null,
    is_admin: Boolean(userData.is_admin),
    is_active: userData.is_active !== undefined ? Boolean(userData.is_active) : undefined,
    created_at: userData.created_at,
    updated_at: userData.updated_at
  };
}

function cryptoFallbackId(): string {
  return `user_${Math.random().toString(36).substring(2, 10)}`;
}

export function isUserDataEncrypted(userData: any): boolean {
  return (
    (userData.name && userData.name.includes(':') && userData.name.length > 50) ||
    (userData.email && userData.email.includes(':') && userData.email.length > 50)
  );
}

export function getEncryptedDataMessage(): string {
  return 'Seus dados estão protegidos e sendo processados com segurança.';
}
