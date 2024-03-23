
import { contractType } from '../configuration';
import { isBonusTimeSlot } from '../units';

jest.mock('../configuration', () => ({ contractType: 'FTI' }));

describe('Mock Test', () => {
  it('contractType("FTI")', () => {
    expect(contractType).toBe('FTI');
  })
})

describe('Timeslot is not a bonus lesson', () => {
  it('isBonusTimeSlot("07:00")', () => {
    expect(isBonusTimeSlot("07:00")).toBe(false);
  })
});