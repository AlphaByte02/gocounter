export function isEmpty(element: unknown) {
    if ((element || null) === null) {
        return true;
    }

    switch (typeof element) {
        case "object": {
            if (Array.isArray(element)) {
                return element.length === 0;
            } else {
                for (const _ in element) {
                    return false;
                }
                return true;
            }
        }
        default:
            return false;
    }
}

export function roundDecimal(num: number, n: number = 1): number {
    return Math.round(num * 10 ** n) / 10 ** n;
}

function gcd(a: number, b: number): number {
    // Base case: if b is 0, then the GCD is a
    if (b === 0) return a;
    // Recursive case: compute the GCD of b and the remainder of a divided by b
    else return gcd(b, a % b);
}

export function humanizeAvg(avg: number) {
    if (avg === 0) {
        return `0 every days`;
    }

    const maxDenominator = 1000;

    let numerator = avg;
    let denominator = 1;

    while (numerator % 1 !== 0 && denominator <= maxDenominator) {
        numerator *= 10;
        denominator *= 10;
    }

    const commonDivisor = gcd(roundDecimal(numerator), denominator);
    numerator = roundDecimal(numerator) / commonDivisor;
    denominator = denominator / commonDivisor;

    return `${numerator} every ${denominator} days`;
}
