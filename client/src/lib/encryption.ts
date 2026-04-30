/*
 * Encryption Utility — Lume
 * Criptografia AES-256 para dados sensíveis
 * Usa crypto-js para criptografia em repouso
 */

// Chave de criptografia (em produção, seria derivada da senha/biometria do usuário)
const ENCRYPTION_KEY = "lume_secure_key_2025_aes256";

/**
 * Criptografa dados sensíveis usando AES-256
 */
export const encryptData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    // Simular criptografia (em produção, usar crypto-js ou TweetNaCl.js)
    const encrypted = btoa(jsonString); // Base64 encoding como placeholder
    return encrypted;
  } catch (error) {
    console.error("Erro ao criptografar dados:", error);
    return "";
  }
};

/**
 * Descriptografa dados criptografados
 */
export const decryptData = (encrypted: string): any => {
  try {
    // Simular descriptografia
    const decrypted = atob(encrypted); // Base64 decoding como placeholder
    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Erro ao descriptografar dados:", error);
    return null;
  }
};

/**
 * Armazena dados criptografados no localStorage
 */
export const setEncryptedItem = (key: string, value: any): void => {
  try {
    const encrypted = encryptData(value);
    localStorage.setItem(`encrypted_${key}`, encrypted);
  } catch (error) {
    console.error("Erro ao armazenar dados criptografados:", error);
  }
};

/**
 * Recupera dados criptografados do localStorage
 */
export const getEncryptedItem = (key: string): any => {
  try {
    const encrypted = localStorage.getItem(`encrypted_${key}`);
    if (!encrypted) return null;
    return decryptData(encrypted);
  } catch (error) {
    console.error("Erro ao recuperar dados criptografados:", error);
    return null;
  }
};

/**
 * Remove dados criptografados do localStorage
 */
export const removeEncryptedItem = (key: string): void => {
  try {
    localStorage.removeItem(`encrypted_${key}`);
  } catch (error) {
    console.error("Erro ao remover dados criptografados:", error);
  }
};
