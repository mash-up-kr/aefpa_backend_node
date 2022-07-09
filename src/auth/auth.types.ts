export type AuthCodeType = 'SIGN_UP' | 'CHANGE_PASSWORD';

export const authCodeTypes: readonly AuthCodeType[] = ['SIGN_UP', 'CHANGE_PASSWORD'] as const;
