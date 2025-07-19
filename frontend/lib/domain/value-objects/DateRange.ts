/**
 * DateRange Value Object
 * Represents a date range with validation and business rules
 */

export class DateRange {
  private constructor(
    private readonly startDate: Date,
    private readonly endDate: Date
  ) {
    this.validate();
  }

  /**
   * Create a new DateRange instance
   */
  static create(startDate: Date | string, endDate: Date | string): DateRange {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    return new DateRange(start, end);
  }

  /**
   * Create a date range for a single day
   */
  static singleDay(date: Date | string): DateRange {
    const day = typeof date === 'string' ? new Date(date) : date;
    const startOfDay = new Date(day);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(day);
    endOfDay.setHours(23, 59, 59, 999);
    
    return new DateRange(startOfDay, endOfDay);
  }

  /**
   * Create a date range for today
   */
  static today(): DateRange {
    return DateRange.singleDay(new Date());
  }

  /**
   * Create a date range for this week
   */
  static thisWeek(): DateRange {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return new DateRange(startOfWeek, endOfWeek);
  }

  /**
   * Create a date range for this month
   */
  static thisMonth(): DateRange {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    return new DateRange(startOfMonth, endOfMonth);
  }

  /**
   * Validate date range constraints
   */
  private validate(): void {
    if (!this.startDate || !this.endDate) {
      throw new Error('Start date and end date are required');
    }

    if (isNaN(this.startDate.getTime()) || isNaN(this.endDate.getTime())) {
      throw new Error('Invalid date format');
    }

    if (this.startDate > this.endDate) {
      throw new Error('Start date cannot be after end date');
    }
  }

  /**
   * Get start date
   */
  getStartDate(): Date {
    return new Date(this.startDate);
  }

  /**
   * Get end date
   */
  getEndDate(): Date {
    return new Date(this.endDate);
  }

  /**
   * Get duration in days
   */
  getDurationInDays(): number {
    const timeDiff = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  /**
   * Get duration in hours
   */
  getDurationInHours(): number {
    const timeDiff = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600));
  }

  /**
   * Get duration in minutes
   */
  getDurationInMinutes(): number {
    const timeDiff = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 60));
  }

  /**
   * Check if date range contains a specific date
   */
  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  /**
   * Check if date range overlaps with another
   */
  overlaps(other: DateRange): boolean {
    return this.startDate <= other.endDate && this.endDate >= other.startDate;
  }

  /**
   * Check if date range is in the past
   */
  isInPast(): boolean {
    return this.endDate < new Date();
  }

  /**
   * Check if date range is in the future
   */
  isInFuture(): boolean {
    return this.startDate > new Date();
  }

  /**
   * Check if date range is today
   */
  isToday(): boolean {
    const today = new Date();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    return this.startDate <= todayEnd && this.endDate >= todayStart;
  }

  /**
   * Check if date range is this week
   */
  isThisWeek(): boolean {
    const thisWeek = DateRange.thisWeek();
    return this.overlaps(thisWeek);
  }

  /**
   * Check if date range is this month
   */
  isThisMonth(): boolean {
    const thisMonth = DateRange.thisMonth();
    return this.overlaps(thisMonth);
  }

  /**
   * Get intersection with another date range
   */
  intersection(other: DateRange): DateRange | null {
    if (!this.overlaps(other)) {
      return null;
    }

    const start = this.startDate > other.startDate ? this.startDate : other.startDate;
    const end = this.endDate < other.endDate ? this.endDate : other.endDate;
    
    return new DateRange(start, end);
  }

  /**
   * Get union with another date range
   */
  union(other: DateRange): DateRange {
    const start = this.startDate < other.startDate ? this.startDate : other.startDate;
    const end = this.endDate > other.endDate ? this.endDate : other.endDate;
    
    return new DateRange(start, end);
  }

  /**
   * Format date range for display
   */
  format(locale: string = 'en-US'): string {
    const startFormatted = this.startDate.toLocaleDateString(locale);
    const endFormatted = this.endDate.toLocaleDateString(locale);
    
    if (startFormatted === endFormatted) {
      return startFormatted;
    }
    
    return `${startFormatted} - ${endFormatted}`;
  }

  /**
   * Convert to string
   */
  toString(): string {
    return this.format();
  }

  /**
   * Convert to JSON
   */
  toJSON(): { startDate: string; endDate: string } {
    return {
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString()
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: { startDate: string; endDate: string }): DateRange {
    return DateRange.create(json.startDate, json.endDate);
  }
} 