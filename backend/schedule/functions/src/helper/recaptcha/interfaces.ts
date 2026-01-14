export interface ResponseRecaptchaVerification {
    success: boolean;
    score?: number;
    'error-codes'?: string[];
}