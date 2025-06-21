import {
  isPostalCodeValid,
  emailSchema,
  passwordSchema,
  nameSchema,
  dateOfBirthSchema,
  streetNameSchema,
  citySchema,
  postalCodeSchema,
  countrySchema,
  houseNumberSchema,
  apartmentSchema,
  loginFormSchema,
  registerFormSchema,
  validateLogin,
  validateRegister,
} from './validation';

describe('isPostalCodeValid', () => {
  it('should return true for valid US postal codes', () => {
    const result = isPostalCodeValid('90210', 'US');
    expect(result).toBe(true);
  });

  it('should return true for valid US postal codes with 4 digit extension', () => {
    const result = isPostalCodeValid('90210-1234', 'US');
    expect(result).toBe(true);
  });

  it('should return false for invalid US postal codes', () => {
    const result = isPostalCodeValid('9021', 'US');
    expect(result).toBe(false);
  });

  it('should return true for valid CA postal codes', () => {
    const result = isPostalCodeValid('A1A 1A1', 'CA');
    expect(result).toBe(true);
  });

  it('should return true for valid CA postal codes without space', () => {
    const result = isPostalCodeValid('A1A1A1', 'CA');
    expect(result).toBe(true);
  });

  it('should return false for invalid CA postal codes', () => {
    const result = isPostalCodeValid('1A1 1A1', 'CA');
    expect(result).toBe(false);
  });

  it('should return true for valid GB postal codes', () => {
    const result = isPostalCodeValid('SW1A 0AA', 'GB');
    expect(result).toBe(true);
  });

  it('should return false for invalid GB postal codes', () => {
    const result = isPostalCodeValid('SW1A 0A', 'GB');
    expect(result).toBe(false);
  });

  it('should return true for valid DE postal codes', () => {
    const result = isPostalCodeValid('12345', 'DE');
    expect(result).toBe(true);
  });

  it('should return false for invalid DE postal codes', () => {
    const result = isPostalCodeValid('1234', 'DE');
    expect(result).toBe(false);
  });

  it('should return true for valid FR postal codes', () => {
    const result = isPostalCodeValid('75001', 'FR');
    expect(result).toBe(true);
  });

  it('should return false for invalid FR postal codes', () => {
    const result = isPostalCodeValid('7500', 'FR');
    expect(result).toBe(false);
  });

  it('should return true for valid IT postal codes', () => {
    const result = isPostalCodeValid('00100', 'IT');
    expect(result).toBe(true);
  });

  it('should return false for invalid IT postal codes', () => {
    const result = isPostalCodeValid('0010', 'IT');
    expect(result).toBe(false);
  });

  it('should return true for valid ES postal codes', () => {
    const result = isPostalCodeValid('28001', 'ES');
    expect(result).toBe(true);
  });

  it('should return false for invalid ES postal codes', () => {
    const result = isPostalCodeValid('2800', 'ES');
    expect(result).toBe(false);
  });

  it('should return true for valid NL postal codes', () => {
    const result = isPostalCodeValid('1234 AB', 'NL');
    expect(result).toBe(true);
  });

  it('should return false for invalid NL postal codes', () => {
    const result = isPostalCodeValid('123 AB', 'NL');
    expect(result).toBe(false);
  });

  it('should return true for valid BE postal codes', () => {
    const result = isPostalCodeValid('1000', 'BE');
    expect(result).toBe(true);
  });

  it('should return false for invalid BE postal codes', () => {
    const result = isPostalCodeValid('100', 'BE');
    expect(result).toBe(false);
  });

  it('should return true for valid CH postal codes', () => {
    const result = isPostalCodeValid('8000', 'CH');
    expect(result).toBe(true);
  });

  it('should return false for invalid CH postal codes', () => {
    const result = isPostalCodeValid('800', 'CH');
    expect(result).toBe(false);
  });

  it('should return true for valid AT postal codes', () => {
    const result = isPostalCodeValid('1010', 'AT');
    expect(result).toBe(true);
  });

  it('should return false for invalid AT postal codes', () => {
    const result = isPostalCodeValid('101', 'AT');
    expect(result).toBe(false);
  });

  it('should return true for valid AU postal codes', () => {
    const result = isPostalCodeValid('2000', 'AU');
    expect(result).toBe(true);
  });

  it('should return false for invalid AU postal codes', () => {
    const result = isPostalCodeValid('200', 'AU');
    expect(result).toBe(false);
  });

  it('should return true for valid RU postal codes', () => {
    const result = isPostalCodeValid('101000', 'RU');
    expect(result).toBe(true);
  });

  it('should return false for invalid RU postal codes', () => {
    const result = isPostalCodeValid('10100', 'RU');
    expect(result).toBe(false);
  });

  it('should return true for valid UA postal codes', () => {
    const result = isPostalCodeValid('01001', 'UA');
    expect(result).toBe(true);
  });

  it('should return false for invalid UA postal codes', () => {
    const result = isPostalCodeValid('0100', 'UA');
    expect(result).toBe(false);
  });

  it('should return true for valid PL postal codes', () => {
    const result = isPostalCodeValid('00-001', 'PL');
    expect(result).toBe(true);
  });

  it('should return false for invalid PL postal codes', () => {
    const result = isPostalCodeValid('000-001', 'PL');
    expect(result).toBe(false);
  });

  it('should return true for valid BY postal codes', () => {
    const result = isPostalCodeValid('220000', 'BY');
    expect(result).toBe(true);
  });

  it('should return false for invalid BY postal codes', () => {
    const result = isPostalCodeValid('22000', 'BY');
    expect(result).toBe(false);
  });

  it('should return true for unsupported country with alphanumeric postal code', () => {
    const result = isPostalCodeValid('ABC 123', 'XX');
    expect(result).toBe(true);
  });

  it('should return false for unsupported country with invalid alphanumeric postal code', () => {
    const result = isPostalCodeValid('ABC@123', 'XX');
    expect(result).toBe(false);
  });
});

describe('emailSchema', () => {
  it('should validate a valid email', () => {
    const result = emailSchema.safeParse('test@example.com');
    expect(result.success).toBe(true);
  });

  it('should invalidate an empty email', () => {
    const result = emailSchema.safeParse('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Please enter your email');
    }
  });

  it('should invalidate an email without @', () => {
    const result = emailSchema.safeParse('testexample.com');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Please enter a valid email (e.g., user@example.com)'
      );
    }
  });

  it('should invalidate an email with leading spaces', () => {
    const result = emailSchema.safeParse(' test@example.com');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Email must not start or end with spaces'
      );
    }
  });

  it('should invalidate an email with trailing spaces', () => {
    const result = emailSchema.safeParse('test@example.com ');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Email must not start or end with spaces'
      );
    }
  });

  it('should invalidate an email with spaces in between', () => {
    const result = emailSchema.safeParse('test @example.com');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Email must not contain spaces'
      );
    }
  });
});

describe('passwordSchema', () => {
  it('should validate a valid password', () => {
    const result = passwordSchema.safeParse('Password123');
    expect(result.success).toBe(true);
  });

  it('should invalidate a password less than 8 characters', () => {
    const result = passwordSchema.safeParse('Pass123');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Use at least 8 characters');
    }
  });

  it('should invalidate a password without an uppercase letter', () => {
    const result = passwordSchema.safeParse('password123');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Add at least one uppercase letter (A-Z)'
      );
    }
  });

  it('should invalidate a password without a lowercase letter', () => {
    const result = passwordSchema.safeParse('PASSWORD123');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Add at least one lowercase letter (a-z)'
      );
    }
  });

  it('should invalidate a password without a number', () => {
    const result = passwordSchema.safeParse('PasswordABC');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Include a number (0-9)');
    }
  });

  it('should invalidate a password with leading spaces', () => {
    const result = passwordSchema.safeParse(' Password123');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Password must not start or end with a space'
      );
    }
  });

  it('should invalidate a password with trailing spaces', () => {
    const result = passwordSchema.safeParse('Password123 ');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Password must not start or end with a space'
      );
    }
  });
});

describe('nameSchema', () => {
  it('should validate a valid name', () => {
    const result = nameSchema.safeParse('John Doe');
    expect(result.success).toBe(true);
  });

  it('should invalidate an empty name', () => {
    const result = nameSchema.safeParse('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Name is required');
    }
  });

  it('should invalidate a name less than 3 characters', () => {
    const result = nameSchema.safeParse('Jo');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Name is required');
    }
  });

  it('should invalidate a name with invalid characters', () => {
    const result = nameSchema.safeParse('John Doe1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Only letters and spaces allowed'
      );
    }
  });

  it('should invalidate a name longer than 50 characters', () => {
    const longName = 'a'.repeat(51);
    const result = nameSchema.safeParse(longName);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Max 50 characters');
    }
  });
});

describe('dateOfBirthSchema', () => {
  it('should validate a valid date of birth (18 years or older)', () => {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - 18;
    const result = dateOfBirthSchema.safeParse(`${birthYear}-01-01`);
    expect(result.success).toBe(true);
  });

  it('should invalidate an empty date of birth', () => {
    const result = dateOfBirthSchema.safeParse('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Date of birth is required');
    }
  });

  it('should invalidate a date of birth with invalid format', () => {
    const result = dateOfBirthSchema.safeParse('01-01-2000');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Date of birth must be in YYYY-MM-DD format'
      );
    }
  });

  it('should invalidate a date of birth less than 18 years old', () => {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - 17;
    const result = dateOfBirthSchema.safeParse(`${birthYear}-01-01`);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'You must be at least 18 years old'
      );
    }
  });

  it('should invalidate a date of birth with a year before 1900', () => {
    const result = dateOfBirthSchema.safeParse('1899-01-01');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Date of birth year seems incorrect'
      );
    }
  });
});

describe('streetNameSchema', () => {
  it('should validate a valid street name', () => {
    const result = streetNameSchema.safeParse('Main Street');
    expect(result.success).toBe(true);
  });

  it('should invalidate an empty street name', () => {
    const result = streetNameSchema.safeParse('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Street name is required');
    }
  });

  it('should invalidate a street name with invalid characters', () => {
    const result = streetNameSchema.safeParse('Main Street!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Only letters and single spaces allowed'
      );
    }
  });

  it('should invalidate a street name longer than 100 characters', () => {
    const longStreetName = 'a'.repeat(101);
    const result = streetNameSchema.safeParse(longStreetName);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Street name must be less than 100 characters'
      );
    }
  });
});

describe('citySchema', () => {
  it('should validate a valid city name', () => {
    const result = citySchema.safeParse('New York');
    expect(result.success).toBe(true);
  });

  it('should invalidate an empty city name', () => {
    const result = citySchema.safeParse('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('City is required');
    }
  });

  it('should invalidate a city name with invalid characters', () => {
    const result = citySchema.safeParse('New York1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Only letters and spaces allowed'
      );
    }
  });

  it('should invalidate a city name longer than 50 characters', () => {
    const longCityName = 'a'.repeat(51);
    const result = citySchema.safeParse(longCityName);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Max 50 characters');
    }
  });
});

describe('postalCodeSchema', () => {
  it('should validate a valid 5-digit postal code', () => {
    const result = postalCodeSchema.safeParse('12345');
    expect(result.success).toBe(true);
  });

  it('should invalidate an empty postal code', () => {
    const result = postalCodeSchema.safeParse('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Postal code is required');
    }
  });

  it('should invalidate a postal code with less than 5 digits', () => {
    const result = postalCodeSchema.safeParse('1234');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Postal code must be 5 digits'
      );
    }
  });

  it('should invalidate a postal code with more than 5 digits', () => {
    const result = postalCodeSchema.safeParse('123456');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Postal code must be 5 digits'
      );
    }
  });

  it('should invalidate a postal code with non-digit characters', () => {
    const result = postalCodeSchema.safeParse('abcde');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Postal code must be 5 digits'
      );
    }
  });

  it('should invalidate a postal code with leading spaces', () => {
    const result = postalCodeSchema.safeParse(' 12345');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Postal code must not start or end with a space'
      );
    }
  });

  it('should invalidate a postal code with trailing spaces', () => {
    const result = postalCodeSchema.safeParse('12345 ');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Postal code must not start or end with a space'
      );
    }
  });
});

describe('countrySchema', () => {
  it('should validate a valid 2-letter uppercase country code', () => {
    const result = countrySchema.safeParse('US');
    expect(result.success).toBe(true);
  });

  it('should invalidate an empty country code', () => {
    const result = countrySchema.safeParse('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Country is required');
    }
  });

  it('should invalidate a country code with less than 2 letters', () => {
    const result = countrySchema.safeParse('U');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Country must be a 2-letter ISO code (e.g., US, DE)'
      );
    }
  });

  it('should invalidate a country code with more than 2 letters', () => {
    const result = countrySchema.safeParse('USA');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Country must be a 2-letter ISO code (e.g., US, DE)'
      );
    }
  });

  it('should invalidate a country code with lowercase letters', () => {
    const result = countrySchema.safeParse('us');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Country must be a 2-letter ISO code (e.g., US, DE)'
      );
    }
  });

  it('should invalidate a country code with non-letter characters', () => {
    const result = countrySchema.safeParse('U1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Country must be a 2-letter ISO code (e.g., US, DE)'
      );
    }
  });
});

describe('houseNumberSchema', () => {
  it('should validate a valid house number', () => {
    const result = houseNumberSchema.safeParse('123');
    expect(result.success).toBe(true);
  });

  it('should invalidate an empty house number', () => {
    const result = houseNumberSchema.safeParse('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('House number is required');
    }
  });

  it('should invalidate a house number longer than 10 characters', () => {
    const longHouseNumber = '1'.repeat(11);
    const result = houseNumberSchema.safeParse(longHouseNumber);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'House number must be ≤ 10 chars'
      );
    }
  });

  it('should invalidate a house number with leading spaces', () => {
    const result = houseNumberSchema.safeParse(' 123');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'No leading or trailing spaces'
      );
    }
  });

  it('should invalidate a house number with trailing spaces', () => {
    const result = houseNumberSchema.safeParse('123 ');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'No leading or trailing spaces'
      );
    }
  });
});

describe('apartmentSchema', () => {
  it('should validate a valid apartment number', () => {
    const result = apartmentSchema.safeParse('Apt 101');
    expect(result.success).toBe(true);
  });

  it('should validate an empty apartment number (optional)', () => {
    const result = apartmentSchema.safeParse('');
    expect(result.success).toBe(true);
  });

  it('should validate an undefined apartment number (optional)', () => {
    const result = apartmentSchema.safeParse(undefined);
    expect(result.success).toBe(true);
  });

  it('should invalidate an apartment number longer than 10 characters', () => {
    const longApartment = 'A'.repeat(11);
    const result = apartmentSchema.safeParse(longApartment);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Apartment must be ≤ 10 chars'
      );
    }
  });

  it('should invalidate an apartment number with leading spaces', () => {
    const result = apartmentSchema.safeParse(' Apt 101');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'No leading or trailing spaces'
      );
    }
  });

  it('should invalidate an apartment number with trailing spaces', () => {
    const result = apartmentSchema.safeParse('Apt 101 ');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'No leading or trailing spaces'
      );
    }
  });
});

describe('loginFormSchema', () => {
  it('should validate a valid login form', () => {
    const result = loginFormSchema.safeParse({
      email: 'test@example.com',
      password: 'Password123',
    });
    expect(result.success).toBe(true);
  });

  it('should invalidate an invalid login form (invalid email)', () => {
    const result = loginFormSchema.safeParse({
      email: 'invalid-email',
      password: 'Password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path[0]).toBe('email');
    }
  });

  it('should invalidate an invalid login form (invalid password)', () => {
    const result = loginFormSchema.safeParse({
      email: 'test@example.com',
      password: 'pass',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path[0]).toBe('password');
    }
  });
});

describe('registerFormSchema', () => {
  const validRegisterData = {
    email: 'test@example.com',
    password: 'Password123',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '2000-01-01',
    streetName: 'Main Street',
    houseNumber: '123',
    city: 'New York',
    postalCode: '10001',
    country: 'US',
  };

  it('should validate a valid registration form', () => {
    const result = registerFormSchema.safeParse(validRegisterData);
    expect(result.success).toBe(true);
  });

  it('should validate a valid registration form with optional billing address', () => {
    const dataWithBilling = {
      ...validRegisterData,
      billingStreetName: 'Billing Street',
      billingHouseNumber: '456',
      billingApartment: 'B',
      billingCity: 'Los Angeles',
      billingPostalCode: '90210',
      billingCountry: 'US',
    };
    const result = registerFormSchema.safeParse(dataWithBilling);
    expect(result.success).toBe(true);
  });

  it('should invalidate registration with invalid postal code for country', () => {
    const invalidData = {
      ...validRegisterData,
      postalCode: '123456',
      country: 'US',
    };
    const result = registerFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path[0]).toBe('postalCode');
      expect(result.error.errors[0].message).toBe(
        'Invalid postal code for selected country'
      );
    }
  });

  it('should invalidate registration with invalid billing postal code for country', () => {
    const invalidData = {
      ...validRegisterData,
      billingPostalCode: '123456',
      billingCountry: 'US',
    };
    const result = registerFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path[0]).toBe('billingPostalCode');
      expect(result.error.errors[0].message).toBe(
        'Invalid billing postal code for selected country'
      );
    }
  });

  it('should invalidate registration with invalid billing postal code when billing country is not provided', () => {
    const invalidData = {
      ...validRegisterData,
      billingPostalCode: 'A1A 1A1',
      country: 'US',
    };
    const result = registerFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path[0]).toBe('billingPostalCode');
      expect(result.error.errors[0].message).toBe(
        'Invalid billing postal code for selected country'
      );
    }
  });
});

describe('validateLogin', () => {
  it('should return success true for valid login data', () => {
    const data = {
      email: 'test@example.com',
      password: 'Password123',
    };
    const result = validateLogin(data);
    expect(result.success).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('should return success false and errors for invalid login data', () => {
    const data = {
      email: 'invalid-email',
      password: 'pass',
    };
    const result = validateLogin(data);
    expect(result.success).toBe(false);
    expect(Object.keys(result.errors).length).toBe(2);
    expect(result.errors.email).toBe(
      'Please enter a valid email (e.g., user@example.com)'
    );
    expect(result.errors.password).toBe('Use at least 8 characters');
  });

  it('should handle partial invalid login data', () => {
    const data = {
      email: 'test@example.com',
      password: 'pass',
    };
    const result = validateLogin(data);
    expect(result.success).toBe(false);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors.password).toBe('Use at least 8 characters');
  });
});

describe('validateRegister', () => {
  const validRegisterData = {
    email: 'test@example.com',
    password: 'Password123',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '2000-01-01',
    streetName: 'Main Street',
    houseNumber: '123',
    city: 'New York',
    postalCode: '10001',
    country: 'US',
  };

  it('should return success true for valid registration data', () => {
    const result = validateRegister(validRegisterData);
    expect(result.success).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('should return success false and errors for invalid registration data', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'pass',
      firstName: 'J',
      lastName: '',
      dateOfBirth: '2020-01-01',
      streetName: '',
      houseNumber: '',
      city: '',
      postalCode: '123',
      country: 'USA',
    };
    const result = validateRegister(invalidData);
    expect(result.success).toBe(false);
    expect(Object.keys(result.errors).length).toBe(9);
    expect(result.errors.email).toBe(
      'Please enter a valid email (e.g., user@example.com)'
    );
    expect(result.errors.password).toBe('Use at least 8 characters');
    expect(result.errors.firstName).toBe('Name is required');
    expect(result.errors.lastName).toBe('Name is required');
    expect(result.errors.dateOfBirth).toBe('You must be at least 18 years old');
    expect(result.errors.streetName).toBe('Street name is required');
    expect(result.errors.houseNumber).toBe('House number is required');
    expect(result.errors.city).toBe('City is required');
    expect(result.errors.country).toBe(
      'Country must be a 2-letter ISO code (e.g., US, DE)'
    );
    expect(result.errors.postalCode).toBeUndefined(); // Debugging assertion
  });

  it('should return success false and errors for invalid postal code in registration data', () => {
    const invalidData = {
      ...validRegisterData,
      postalCode: '123456',
      country: 'US',
    };
    const result = validateRegister(invalidData);
    expect(result.success).toBe(false);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors.postalCode).toBe(
      'Invalid postal code for selected country'
    );
  });

  it('should return success false and errors for invalid billing postal code in registration data', () => {
    const invalidData = {
      ...validRegisterData,
      billingPostalCode: '123456',
      billingCountry: 'US',
    };
    const result = validateRegister(invalidData);
    expect(result.success).toBe(false);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors.billingPostalCode).toBe(
      'Invalid billing postal code for selected country'
    );
  });
});
