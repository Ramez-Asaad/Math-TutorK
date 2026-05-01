import type { LessonVoiceConfig } from '../components/layout/LessonShell'

/**
 * Voice configurations for every lesson.
 * Each config has an instruction (spoken at lesson start by the Azelma voice)
 * and hints keyed by problem index or '*' for a universal hint.
 *
 * Instructions are written in a warm, encouraging, detailed tone — like a
 * gentle tutor spending time to explain the concept before the child begins.
 * They cover WHAT the lesson is about, WHY it matters, HOW to play, and
 * give a motivational nudge.
 */
export const VOICE_CONFIGS: Record<string, LessonVoiceConfig> = {
    /* ─── Counting ─────────────────────────────────────────────── */
    'dot-counter': {
        instruction: "Count every shape, then type the total.",
        hints: { '*': "Try pointing at each shape one by one as you count so you don't miss any!" },
    },
    'number-line': {
        instruction: "Tap the spot where the missing number belongs.",
        hints: { '*': "Look at the numbers on either side and count up to find where the missing one fits." },
    },
    'comparison': {
        instruction: "Count both groups and choose the correct symbol.",
        hints: { '*': "Count each side carefully first. The side with the bigger number has more!" },
    },
    'skip-counting': {
        instruction: "Find the jumping pattern and fill the blanks.",
        hints: { '*': "Look at how much bigger each number gets. That's your jump size!" },
    },

    /* ─── Place Value ──────────────────────────────────────────── */
    'dot-builder': {
        instruction: "Build the target number using the place value columns.",
        hints: { '*': "Break the number into parts: the first digit is hundreds, the middle is tens, and the last is ones." },
    },
    'expanded-form': {
        instruction: "Use the steppers to build the expanded form.",
        hints: { '*': "Start with the biggest place value first, like thousands, then work your way down." },
    },
    'hieroglyphs': {
        instruction: "Use the key to decode the symbols and find the total.",
        hints: { '*': "Match each symbol to its value in the key, then add them all together for the total." },
    },
    'rounding': {
        instruction: "Look at the line and decide which ten is closer.",
        hints: { '*': "Check the ones digit! If it's 5 or more, round up. If it's 4 or less, round down." },
    },

    /* ─── Addition ─────────────────────────────────────────────── */
    'combining': {
        instruction: "Combine both groups to find the total.",
        hints: { '*': "Count the first group, then the second, and add those two numbers together." },
    },
    'number-bonds': {
        instruction: "Split the number into two parts that add up to the total.",
        hints: { '*': "Make sure both circles are more than zero and add up to the number at the top." },
    },
    'making-ten': {
        instruction: "Fill the ten frame first, then count what's left.",
        hints: { '*': "Fill the empty spaces in the frame to make ten, then add whatever is left outside." },
    },
    'column-addition': {
        instruction: "Add from right to left, and carry the ten if needed.",
        hints: { '*': "Add one column at a time starting from the right. If it's 10 or more, carry the 1 over!" },
    },
    'addition-word-problems': {
        instruction: "Read the story, find the numbers, and add them.",
        hints: { '*': "Look for clue words like 'total' or 'altogether' to know you need to add." },
    },

    /* ─── Subtraction ──────────────────────────────────────────── */
    'takeaway': {
        instruction: "Remove the right amount of objects to find what is left.",
        hints: { '*': "Tap the objects to remove them, then count whatever is still on the screen." },
    },
    'number-line-jumps': {
        instruction: "Start at the number and jump back to subtract.",
        hints: { '*': "Find your starting number, then jump back by the amount you are taking away." },
    },
    'ten-frame': {
        instruction: "Remove the right number of circles from the frame.",
        hints: { '*': "A full row is always five. Use that trick to count what's left much faster!" },
    },
    'column-subtraction': {
        instruction: "Subtract from right to left, and borrow if needed.",
        hints: { '*': "If the top digit is too small, take ten from the column to the left and add it to your column." },
    },
    'missing-number-subtraction': {
        instruction: "Figure out the missing number in the equation.",
        hints: { '*': "Use addition to help! If the starting number is missing, add the other two numbers together." },
    },

    /* ─── Multiplication ───────────────────────────────────────── */
    'equal-groups': {
        instruction: "Multiply the groups by the items inside for the total.",
        hints: { '*': "Multiply the number of groups by the number of items in each group." },
    },
    'arrays': {
        instruction: "Multiply the rows by the columns.",
        hints: { '*': "Rows go across and columns go down. Rows times columns equals the total!" },
    },
    'square-numbers': {
        instruction: "Multiply the number by itself.",
        hints: { '*': "Square means the number times itself, like five times five!" },
    },
    'times-table-map': {
        instruction: "Multiply the row by the column to fill the cell.",
        hints: { '*': "Find the row on the left and the column on the top, then multiply them." },
    },
    'flashcards': {
        instruction: "Answer the multiplication problems quickly.",
        hints: { '*': "If you get stuck, try skip counting or breaking the problem into smaller facts." },
    },
    'magic-square': {
        instruction: "Fill the numbers so every line adds to the magic total.",
        hints: { '*': "Find a line that only has one missing number, add what you know, and subtract from the magic total." },
    },

    /* ─── Division ─────────────────────────────────────────────── */
    'dot-grouper': {
        instruction: "Share the dots equally between all groups.",
        hints: { '*': "Deal the dots one by one into each group until they are all shared equally." },
    },
    'fair-share': {
        instruction: "Divide the items equally so every group gets a fair share.",
        hints: { '*': "Give one item to each group, then go around again until everything is shared." },
    },
    'repeated-subtraction': {
        instruction: "Subtract repeatedly until zero, then count the steps.",
        hints: { '*': "Count how many times you subtract the number before reaching zero. That count is your answer!" },
    },
    'fact-family': {
        instruction: "Use multiplication and division to find the missing number.",
        hints: { '*': "Multiplication and division are connected. If you know three times four is twelve, twelve divided by four is three!" },
    },

    /* ─── Fractions ────────────────────────────────────────────── */
    'grid-painter': {
        instruction: "Split the shape and color the correct fraction.",
        hints: { '*': "Use the bottom number to split the shape, and the top number to color the pieces." },
    },
    'comparator': {
        instruction: "Look at the bars and choose the bigger fraction.",
        hints: { '*': "The longer the bar, the bigger the fraction! Look closely at the visuals." },
    },
    'fraction-number-line': {
        instruction: "Tap the exact spot where the fraction belongs.",
        hints: { '*': "Imagine dividing the line into equal parts, then count forward to find the spot." },
    },
    'equivalent': {
        instruction: "Multiply or divide top and bottom by the same number.",
        hints: { '*': "Whatever you multiply or divide the top by, do the exact same to the bottom!" },
    },
    'mixed-numbers': {
        instruction: "Convert between mixed numbers and improper fractions.",
        hints: { '*': "Multiply the whole number by the bottom, then add the top to make an improper fraction!" },
    },

    /* ─── Algebraic Thinking ───────────────────────────────────── */
    'patterns': {
        instruction: "Find the pattern and predict what comes next.",
        hints: { '*': "Look at what changes from one item to the next to find the rule, then apply it!" },
    },
    'balance-scale': {
        instruction: "Find the mystery weight to balance the scale.",
        hints: { '*': "Add up the side you know, then subtract to find what's missing on the other side." },
    },
    'function-machine': {
        instruction: "Find the rule and predict the output.",
        hints: { '*': "Compare the inputs and outputs to see if it's adding, subtracting, or multiplying." },
    },
    'missing-number': {
        instruction: "Find the missing number to make the equation true.",
        hints: { '*': "If it's addition, try subtracting. The equation must always balance!" },
    },

    /* ─── Number Sense ─────────────────────────────────────────── */
    'primes': {
        instruction: "Decide if the number is prime or composite.",
        hints: { '*': "Try dividing by two, three, five, or seven. If none work, it's prime!" },
    },
    'negative-numbers': {
        instruction: "Use the number line to add and subtract negative numbers.",
        hints: { '*': "When you add, move right. When you subtract, move left on the number line!" },
    },
    'word-problems-ns': {
        instruction: "Read the story, find the clues, and solve.",
        hints: { '*': "Look for clue words like 'total' for adding or 'each' for multiplying to find the right operation." },
    },
}

