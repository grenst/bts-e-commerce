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

describe('isPostalCodeValid (DE)', () => {
  it.each(['01067', '10115', '60528'])('accepts %s', (code) => {
    expect(isPostalCodeValid(code, 'DE')).toBe(true);
  });

  it.each(['1234', '123456', 'ABCDE'])('rejects %s', (code) => {
    expect(isPostalCodeValid(code, 'DE')).toBe(false);
  });

  it('fallback for unknown country', () => {
    expect(isPostalCodeValid('12345', 'XX')).toBe(true);
    expect(isPostalCodeValid('12345-', 'XX')).toBe(false);
  });
});

describe('emailSchema', () => {
  it.each(['user@mail.de', 'name.surname@test.co'])('valid %s', (e) => {
    expect(emailSchema.safeParse(e).success).toBe(true);
  });

  it.each(['', 'invalid', ' test@mail.de ', 'user mail@de'])
  ('invalid %s', (e) => {
    expect(emailSchema.safeParse(e).success).toBe(false);
  });
});

describe('passwordSchema', () => {
  it('valid', () => {
    expect(passwordSchema.safeParse('Passwort1').success).toBe(true);
  });

  it.each(['Pass1', 'password1', 'PASSWORD1', 'Password'])
  ('invalid %s', (p) => {
    expect(passwordSchema.safeParse(p).success).toBe(false);
  });
});

describe('nameSchema', () => {
  it('valid', () => {
    expect(nameSchema.safeParse('Max Mustermann').success).toBe(true);
  });

  it.each(['', 'Max!', 'a'.repeat(51)])('invalid %s', (n) => {
    expect(nameSchema.safeParse(n).success).toBe(false);
  });
});

describe('dateOfBirthSchema', () => {
  const year = new Date().getFullYear() - 19;
  it('valid', () => {
    expect(dateOfBirthSchema.safeParse(`${year}-01-01`).success).toBe(true);
  });

  it.each(['', '01-01-2000', `${year + 10}-01-01`, '1899-01-01'])
  ('invalid %s', (d) => {
    expect(dateOfBirthSchema.safeParse(d).success).toBe(false);
  });
});

describe('streetNameSchema', () => {
  it('valid', () => {
    expect(streetNameSchema.safeParse('Hauptstraße').success).toBe(true);
  });

  it.each(['', 'Main!', 'a'.repeat(101)])('invalid %s', (s) => {
    expect(streetNameSchema.safeParse(s).success).toBe(false);
  });
});

describe('citySchema', () => {
  it('valid', () => {
    expect(citySchema.safeParse('Berlin').success).toBe(true);
  });

  it.each(['', 'Berlin!', 'a'.repeat(51)])('invalid %s', (c) => {
    expect(citySchema.safeParse(c).success).toBe(false);
  });
});

describe('postalCodeSchema (DE)', () => {
  it('valid', () => {
    expect(postalCodeSchema.safeParse('10115').success).toBe(true);
  });

  it.each(['', '1234', 'ABCDE', ' 10115 '])('invalid %s', (p) => {
    expect(postalCodeSchema.safeParse(p).success).toBe(false);
  });
});

describe('countrySchema', () => {
  it('valid', () => {
    expect(countrySchema.safeParse('DE').success).toBe(true);
  });

  it.each(['', 'GER'])('invalid %s', (c) => {
    expect(countrySchema.safeParse(c).success).toBe(false);
  });
});

describe('houseNumberSchema', () => {
  it('valid', () => {
    expect(houseNumberSchema.safeParse('12A').success).toBe(true);
  });

  it.each(['', '12345678901', ' 12 '])('invalid %s', (h) => {
    expect(houseNumberSchema.safeParse(h).success).toBe(false);
  });
});

describe('apartmentSchema', () => {
  it.each(['', undefined, 'Whg 3'])('valid %s', (a) => {
    expect(apartmentSchema.safeParse(a).success).toBe(true);
  });

  it.each(['12345678901', ' Whg 3 '])('invalid %s', (a) => {
    expect(apartmentSchema.safeParse(a).success).toBe(false);
  });
});

describe('loginFormSchema', () => {
  it('valid', () => {
    expect(
      loginFormSchema.safeParse({ email: 'test@mail.de', password: 'Passwort1' })
        .success,
    ).toBe(true);
  });

  it('invalid', () => {
    expect(
      loginFormSchema.safeParse({ email: 'bad', password: 'weak' }).success,
    ).toBe(false);
  });
});

describe('registerFormSchema (DE)', () => {
  const base = {
    email: 'user@mail.de',
    password: 'Passwort1',
    firstName: 'Max',
    lastName: 'Mustermann',
    dateOfBirth: '2000-01-01',
    streetName: 'Hauptstraße',
    houseNumber: '12',
    city: 'Berlin',
    postalCode: '10115',
    country: 'DE',
  };

  it('valid', () => {
    expect(registerFormSchema.safeParse(base).success).toBe(true);
  });

  it('invalid postal code', () => {
    const res = registerFormSchema.safeParse({ ...base, postalCode: 'ABCDE' });
    expect(res.success).toBe(false);
  });
});

describe('validateLogin', () => {
  it('valid', () => {
    expect(
      validateLogin({ email: 'user@mail.de', password: 'Passwort1' }).success,
    ).toBe(true);
  });

  it('invalid', () => {
    expect(
      validateLogin({ email: 'bad', password: 'weak' }).success,
    ).toBe(false);
  });
});

describe('validateRegister (DE)', () => {
  const base = {
    email: 'user@mail.de',
    password: 'Passwort1',
    firstName: 'Max',
    lastName: 'Mustermann',
    dateOfBirth: '2000-01-01',
    streetName: 'Hauptstraße',
    houseNumber: '12',
    city: 'Berlin',
    postalCode: '10115',
    country: 'DE',
  };

  it('valid', () => {
    expect(validateRegister(base).success).toBe(true);
  });

  it('invalid postal', () => {
    const res = validateRegister({ ...base, postalCode: 'BAD' });
    expect(res.success).toBe(false);
  });
});
