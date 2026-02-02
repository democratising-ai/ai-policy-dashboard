import { Injectable } from '@angular/core';

export interface SanitizationResult {
  isValid: boolean;
  sanitizedValue: any;
  errors: string[];
}

export interface ValidationConfig {
  maxLength?: number;
  minLength?: number;
  allowHtml?: boolean;
  allowUrls?: boolean;
  required?: boolean;
  pattern?: RegExp;
}

@Injectable({
  providedIn: 'root'
})
export class InputSanitizerService {
  private readonly DEFAULT_MAX_LENGTH = 10000;
  private readonly DEFAULT_STRING_MAX_LENGTH = 5000;

  private readonly DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:\s*text\/html/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<link/i,
    /<meta/i,
    /expression\s*\(/i,
    /url\s*\(\s*["']?\s*javascript:/i,
  ];

  /**
   * Sanitize a string value
   */
  sanitizeString(value: string, config: ValidationConfig = {}): SanitizationResult {
    const errors: string[] = [];
    const maxLength = config.maxLength || this.DEFAULT_STRING_MAX_LENGTH;

    if (value === null || value === undefined) {
      if (config.required) {
        return { isValid: false, sanitizedValue: '', errors: ['Value is required'] };
      }
      return { isValid: true, sanitizedValue: '', errors: [] };
    }

    let sanitized = String(value);

    // Check length
    if (sanitized.length > maxLength) {
      errors.push(`Value exceeds maximum length of ${maxLength} characters`);
      sanitized = sanitized.substring(0, maxLength);
    }

    if (config.minLength && sanitized.length < config.minLength) {
      errors.push(`Value must be at least ${config.minLength} characters`);
    }

    if (!config.allowHtml) {
      for (const pattern of this.DANGEROUS_PATTERNS) {
        const replaced = sanitized.replace(pattern, '');
        if (replaced !== sanitized) {
          errors.push('Potentially dangerous content detected and removed');
          sanitized = replaced;
        }
      }

    }

    // Check pattern if provided
    if (config.pattern && !config.pattern.test(sanitized)) {
      errors.push('Value does not match required pattern');
    }

    return {
      isValid: errors.length === 0,
      sanitizedValue: sanitized,
      errors
    };
  }

  /**
   * Sanitize an object/row data for submission
   */
  sanitizeRowData(data: Record<string, any>): SanitizationResult {
    const errors: string[] = [];
    const sanitizedData: Record<string, any> = {};

    // Check total size
    const jsonSize = JSON.stringify(data).length;
    if (jsonSize > this.DEFAULT_MAX_LENGTH) {
      return {
        isValid: false,
        sanitizedValue: data,
        errors: [`Data exceeds maximum size of ${this.DEFAULT_MAX_LENGTH} characters`]
      };
    }

    for (const [key, value] of Object.entries(data)) {
      // Sanitize key
      const sanitizedKey = this.sanitizeKey(key);
      if (sanitizedKey !== key) {
        errors.push(`Key "${key}" was sanitized`);
      }

      // Sanitize value based on type
      if (typeof value === 'string') {
        const result = this.sanitizeString(value);
        sanitizedData[sanitizedKey] = result.sanitizedValue;
        errors.push(...result.errors.map(e => `${key}: ${e}`));
      } else if (Array.isArray(value)) {
        sanitizedData[sanitizedKey] = value.map((item, index) => {
          if (typeof item === 'string') {
            const result = this.sanitizeString(item);
            errors.push(...result.errors.map(e => `${key}[${index}]: ${e}`));
            return result.sanitizedValue;
          }
          return item;
        });
      } else if (typeof value === 'object' && value !== null) {
        const result = this.sanitizeRowData(value);
        sanitizedData[sanitizedKey] = result.sanitizedValue;
        errors.push(...result.errors.map(e => `${key}.${e}`));
      } else {
        // Numbers, booleans, null - pass through
        sanitizedData[sanitizedKey] = value;
      }
    }

    return {
      isValid: errors.filter(e => !e.includes('was sanitized')).length === 0,
      sanitizedValue: sanitizedData,
      errors
    };
  }

  /**
   * Sanitize object key names
   */
  private sanitizeKey(key: string): string {
    // Remove any characters that could cause JSON issues
    return key
      .replace(/[<>'"\\]/g, '')
      .replace(/[\x00-\x1f\x7f]/g, '') // Remove control characters
      .trim()
      .substring(0, 256); // Limit key length
  }

  /**
   * Validate URL format
   */
  isValidUrl(url: string): boolean {
    if (!url) return true; // Empty is valid (not required)

    try {
      const parsed = new URL(url);
      // Only allow http and https protocols
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Sanitize URL
   */
  sanitizeUrl(url: string): string {
    if (!url) return '';

    // Remove javascript: and data: URLs
    if (/^(javascript|data|vbscript):/i.test(url.trim())) {
      return '';
    }

    return url.trim();
  }
}
