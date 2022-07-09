export type AuthCodeType = 'sign_up' | 'change_password';

export const authCodeTypes: readonly AuthCodeType[] = ['sign_up', 'change_password'] as const;
