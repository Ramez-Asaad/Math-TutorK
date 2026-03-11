/** Check if the child's string input matches the expected numeric answer */
export function validateNumber(input: string, answer: number): boolean {
    const parsed = parseInt(input.trim(), 10)
    return !isNaN(parsed) && parsed === answer
}

/** Check a comparison symbol (< = >) */
export function validateComparison(input: string, a: number, b: number): boolean {
    if (a < b) return input === '<'
    if (a > b) return input === '>'
    return input === '='
}

/** Check fraction (numerator/denominator) */
export function validateFraction(
    inputNum: number,
    inputDen: number,
    answerNum: number,
    answerDen: number
): boolean {
    return inputNum * answerDen === answerNum * inputDen
}

/** Stars earned based on wrong count */
export function calcStars(wrongCount: number): 1 | 2 | 3 {
    if (wrongCount === 0) return 3
    if (wrongCount <= 2) return 2
    return 1
}
