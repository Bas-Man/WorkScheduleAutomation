
import { contractType } from '../configuration';
import { isBonusTimeSlot, isStandardLesson, createDefaultUnit } from '../units';


describe('Test lesson type is not standard', () => {
    it('isStandardLesson("Bonus"', () => {
      expect(isStandardLesson("Bonus")).toBe(false);
    });
});

describe('Test lesson type is standard', () => {
    it('isStandardLesson("Office"', () => {
      expect(isStandardLesson("Office")).toBe(true);
    });
});


describe('Timeslot is a bonus lesson', () => {
  it('isBonusTimeSlot("07:00")', () => {
    expect(contractType).toBe('PL');
    expect(isBonusTimeSlot("07:00")).toBe(true);
  })
});

describe('Create a default lesson Unit', () => {
  it('createDefaultUnit()', () => {
    const unit = createDefaultUnit();
    expect(unit.zoom).toBe(false);
    expect(unit.isBonus).toBe(false);
  })
});