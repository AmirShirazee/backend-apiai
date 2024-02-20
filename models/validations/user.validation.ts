import Joi, { ValidationResult } from 'joi';
import { UserDocument } from '../user.model';

interface LoginInput extends Partial<Pick<UserDocument, 'username' | 'password'>> {
  [key: string]: any;
}

export function validateBasicLoginInput(input: LoginInput): ValidationResult {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required().label('Username'),
    password: Joi.string().min(5).max(255).required().label('Password'),
  }).options({ allowUnknown: true }); // Allow unknown fields

  return schema.validate(input);
}

export function validateAdvancedLoginInput(input: LoginInput): ValidationResult {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required().label('Username').messages({
      'string.min': 'Username must have at least 3 characters.',
      'string.max': 'Username must have at most 50 characters.',
      'any.required': 'Username is required.',
    }),
    password: Joi.string()
      .min(8)
      .max(255)
      .required()
      .pattern(/[a-zA-Z0-9!@#$%^&*()_+]/)
      .label('Password')
      .messages({
        'any.invalid': 'Password cannot be the same as the username.',
        'string.min': 'Password must have at least 8 characters.',
        'string.max': 'Password must have at most 255 characters.',
        'any.required': 'Password is required.',
      }),
  }).options({ allowUnknown: true }); // Allow unknown fields

  return schema.validate(input);
}

// Existing Register Input Validation
export function validateRegisterInput(
  input: Pick<UserDocument, 'username' | 'email' | 'password'>,
): ValidationResult {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required().label('Username'),
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: true } }) // checks for '@' and a domain
      .min(5)
      .max(255)
      .required()
      .label('Email')
      .messages({
        'string.email': 'Email must be a valid email address.',
        'string.min': '"Email" must have at least 5 characters.',
        'string.max': '"Email" must have at most 255 characters.',
        'any.required': '"Email" is required.',
      }),
    password: Joi.string()
      .min(8)
      .max(255)
      .required()
      .pattern(/^(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*()_+]+$/)
      .label('Password')
      .custom((value, helpers) => {
        if (value === helpers?.state?.ancestors[0]?.username) {
          return helpers.error('any.invalid');
        }
        return value;
      })
      .messages({
        'any.invalid': 'Password cannot be the same as the username or email.',
        'string.pattern.base': 'Password must contain at least one uppercase letter.',
      }),
  });

  return schema.validate(input);
}

// Existing Email Validation
export function validateEmail(input: Pick<UserDocument, 'email'>): ValidationResult {
  const schema = Joi.object({
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: true } }) // checks for '@' and a domain
      .min(5)
      .max(255)
      .required()
      .label('Email')
      .messages({
        'string.email': 'Email must be a valid email address.',
        'string.min': '"Email" must have at least 5 characters.',
        'string.max': '"Email" must have at most 255 characters.',
        'any.required': '"Email" is required.',
      }),
  });
  return schema.validate(input);
}

// Existing Password Validation
export function validatePassword(input: Pick<UserDocument, 'password'>): ValidationResult {
  const schema = Joi.object({
    password: Joi.string()
      .min(8)
      .max(255)
      .required()
      .pattern(/^(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*()_+]+$/)
      .label('Password')
      .messages({
        'any.invalid': 'Password cannot be an old password',
        'string.pattern.base': 'Password must contain at least one uppercase letter.',
      }),
  });

  return schema.validate(input);
}

export function isStrongPassword(password: string) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[^A-Za-z0-9]/.test(password);

  return (
    password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars
  );
}
