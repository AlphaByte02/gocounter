/** Returns the ISO string for Jan 1 of a given year */
export function startOfYear(year: number): string {
    return new Date(year, 0, 1).toISOString();
}

/** Returns the current year */
export function currentYear(): number {
    return new Date().getFullYear();
}

/**
 * Returns an array of selectable years dynamically:
 * from the earliest year provided (e.g. oldest counter) up to current year.
 * Falls back to [currentYear] if no earliestYear given.
 */
export function availableYears(earliestYear?: number): number[] {
    const now = currentYear();
    const start = earliestYear ?? now;
    return Array.from({ length: now - start + 1 }, (_, i) => start + i);
}

export function dateRange(startDate: Date | string, endDate: Date | string, steps = 1, useUTC = false) {
    const dateArray = [];

    if (!(startDate instanceof Date)) {
        startDate = new Date(startDate);
    }
    if (useUTC) {
        startDate.setUTCHours(0, 0, 0, 0);
    } else {
        startDate.setHours(0, 0, 0, 0);
    }
    const currentDate = startDate;

    if (!(endDate instanceof Date)) {
        endDate = new Date(endDate);
    }
    if (useUTC) {
        endDate.setUTCHours(0, 0, 0, 0);
    } else {
        endDate.setHours(0, 0, 0, 0);
    }

    while (currentDate <= endDate) {
        dateArray.push(new Date(currentDate));
        if (useUTC) {
            currentDate.setUTCDate(currentDate.getUTCDate() + steps);
        } else {
            currentDate.setDate(currentDate.getDate() + steps);
        }
    }

    return dateArray;
}

export function daysInMonth(month?: number, year?: number): number {
    const now = new Date();
    if (!year) {
        year = now.getFullYear();
    }
    if (!month) {
        month = now.getMonth();
    }

    return new Date(year, month + 1, 0).getDate();
}

export function isLeapYear(year: number) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInYear(year: number) {
    return isLeapYear(year) ? 366 : 365;
}
