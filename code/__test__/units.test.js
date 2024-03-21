import { isBonusTimeSlot, isStandardLesson } from '../units';

describe('Test lesson type is not standard', () => {
    it('isStandardLesson("Bonus"', () => {
      expect(isStandardLesson("Bonus")).toBe(false);
    });
  });

describe('Test lesson type is standard', () => {
    it('isStandardLesson("Office"', () => {
      expect(isStandardLesson("Bonus")).toBe(false);
    });
  });

describe('Timeslot is a bonus lesson', () => {
  it('isBonusTimeSlot("07:00")', () => {
    expect(isBonusTimeSlot("07:00")).toBe(true);
  })
})