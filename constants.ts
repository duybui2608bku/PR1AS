export const REQUIRED_PIN = "260802";
export const DB_NAME = "SecureVaultDB";
export const DB_VERSION = 1;
export const STORE_ACCOUNTS = "accounts";
export const STORE_CATEGORIES = "categories";
export const SALT = "secure-vault-static-salt"; // In a real app, this should be random and stored, but for this PIN-based recovery flow, we use a static salt.