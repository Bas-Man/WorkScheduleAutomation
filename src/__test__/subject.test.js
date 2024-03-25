import { newSchedule } from "../schedule";

describe('Create a new schedule from email', () => {
    it('newSchedule("Schedule for Monday March 25th, 2024)', () => {
        const schedule = newSchedule("Schedule for Monday March 25th, 2024");
      expect(schedule.day).toBe('Monday');
      expect(schedule.month).toBe('March');
      expect(schedule.date).toBe('25');
      expect(schedule.year).toBe('2024');
    });
});