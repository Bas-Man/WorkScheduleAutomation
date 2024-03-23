
import { lookupLocation } from "../locations";

describe('Test non-existant location', () => {
    it('lookupLocation("Akabane")', () => {
      expect(lookupLocation("Akabane")).toBe('');
    });
});

describe('Test non-existant location not to be valid', () => {
    it('lookupLocation("Akabane")', () => {
      expect(lookupLocation("Akabane")).not.toBe("Berlitz Akabane Language Center");
    });
});

describe('Test Shinagawa location is valid', () => {
    it('lookupLocation("Shinagawa")', () => {
      expect(lookupLocation("Shinagawa")).toBe("Berlitz Shinagawa Language Center");
    });
});
