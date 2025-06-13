import { Injectable } from '@angular/core';

/**
 * Service for storing data in localStorage with basic obfuscation.
 * This is NOT secure encryption, just a way to prevent casual viewing
 * of sensitive data like API keys in browser dev tools.
 */
@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  // Check if localStorage is available
  private isStorageAvailable(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('localStorage is not available:', e);
      return false;
    }
  }

  /**
   * Stores a value in localStorage with basic obfuscation
   * @param key The storage key
   * @param value The value to store
   */
  setItem(key: string, value: string): void {
    if (!this.isStorageAvailable()) return;

    try {
      // Simple obfuscation - not encryption, just making it harder to read in dev tools
      if (value) {
        // Convert to base64 and reverse the string for simple obfuscation
        const obfuscated = btoa(unescape(encodeURIComponent(value))).split('').reverse().join('');
        localStorage.setItem(key, obfuscated);
      } else {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.error('Failed to store value:', e);
    }
  }

  /**
   * Gets a value from localStorage and de-obfuscates it
   * @param key The storage key
   * @returns The retrieved value or an empty string
   */
  getItem(key: string): string {
    if (!this.isStorageAvailable()) return '';

    try {
      const value = localStorage.getItem(key);
      if (!value) {
        return '';
      }
      
      // Reverse the string and decode from base64
      const deobfuscated = decodeURIComponent(escape(atob(value.split('').reverse().join(''))));
      return deobfuscated;
    } catch (e) {
      console.error('Failed to decode stored value:', e);
      return '';
    }
  }

  /**
   * Removes an item from localStorage
   * @param key The storage key
   */
  removeItem(key: string): void {
    if (!this.isStorageAvailable()) return;
    
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Failed to remove item:', e);
    }
  }

  /**
   * Clears all items from localStorage
   */
  clear(): void {
    if (!this.isStorageAvailable()) return;
    
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
  }
}
