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
        instruction: "Welcome to Dot Counter! Count every shape you see on the screen, then type the number on the right.",
        hints: { '*': "Try pointing at each shape one by one as you count so you don't miss any!" },
    },
    'number-line': {
        instruction: "Welcome to the Number Line! Tap the exact spot on the line where the missing number belongs.",
        hints: { '*': "Look at the numbers on either side and count up to find where the missing one fits." },
    },
    'comparison': {
        instruction: "Let's compare! Count both groups and decide which one has more, fewer, or if they are the same.",
        hints: { '*': "Count each side carefully first. The side with the bigger number has more!" },
    },
    'skip-counting': {
        instruction: "Time to skip count! Find the pattern of the jumps and fill in the missing number.",
        hints: { '*': "Look at how much bigger each number gets. That's your jump size!" },
    },

    /* ─── Place Value ──────────────────────────────────────────── */
    'dot-builder': {
        instruction: "Welcome to the Building Zone! Build the target number using hundreds, tens, and ones blocks.",
        hints: { '*': "Break the number into parts: the first digit is hundreds, the middle is tens, and the last is ones." },
    },
    'expanded-form': {
        instruction: "Let's stretch numbers apart! Use the steppers to show how many thousands, hundreds, tens, and ones make up the number.",
        hints: { '*': "Start with the biggest place value first, like thousands, then work your way down." },
    },
    'hieroglyphs': {
        instruction: "Let's explore ancient Egypt! Use the key to find the value of each symbol and add them all up.",
        hints: { '*': "Match each symbol to its value in the key, then add them all together for the total." },
    },
    'rounding': {
        instruction: "Time to round! Look at the number on the line and decide which ten it is closer to.",
        hints: { '*': "Check the ones digit! If it's 5 or more, round up. If it's 4 or less, round down." },
    },

    /* ─── Addition ─────────────────────────────────────────────── */
    'combining': {
        instruction: "Let's add things up! Count both groups, then combine them to find the total.",
        hints: { '*': "Count the first group, then the second, and add those two numbers together." },
    },
    'number-bonds': {
        instruction: "Number bonds are like puzzles! Split the top number into two parts that add up to the total.",
        hints: { '*': "Make sure both circles are more than zero and add up to the number at the top." },
    },
    'making-ten': {
        instruction: "Making ten is a math superpower! Fill the ten frame first, then count what's left over.",
        hints: { '*': "Fill the empty spaces in the frame to make ten, then add whatever is left outside." },
    },
    'column-addition': {
        instruction: "Let's add big numbers! Work from right to left, and don't forget to carry the ten if you need to.",
        hints: { '*': "Add one column at a time starting from the right. If it's 10 or more, carry the 1 over!" },
    },
    'addition-word-problems': {
        instruction: "Story time! Read the problem, find the numbers, and add them together.",
        hints: { '*': "Look for clue words like 'total' or 'altogether' to know you need to add." },
    },

    /* ─── Subtraction ──────────────────────────────────────────── */
    'takeaway': {
        instruction: "It's takeaway time! Count all the objects, remove the right amount, and see what's left.",
        hints: { '*': "Tap the objects to remove them, then count whatever is still on the screen." },
    },
    'number-line-jumps': {
        instruction: "Get ready to jump backwards! Start at the big number and jump left to subtract.",
        hints: { '*': "Find your starting number, then jump back by the amount you are taking away." },
    },
    'ten-frame': {
        instruction: "Let's use the ten frame! Remove the right number of circles and count what remains.",
        hints: { '*': "A full row is always five. Use that trick to count what's left much faster!" },
    },
    'column-subtraction': {
        instruction: "Let's subtract big numbers! Start from the right, and remember to borrow if the top digit is smaller.",
        hints: { '*': "If the top digit is too small, take ten from the column to the left and add it to your column." },
    },
    'missing-number-subtraction': {
        instruction: "Be a number detective! Figure out which number is missing to make the subtraction true.",
        hints: { '*': "Use addition to help! If the starting number is missing, add the other two numbers together." },
    },

    /* ─── Multiplication ───────────────────────────────────────── */
    'equal-groups': {
        instruction: "Let's multiply! Count the groups, count what's inside each group, and multiply them for the total.",
        hints: { '*': "Multiply the number of groups by the number of items in each group." },
    },
    'arrays': {
        instruction: "Let's build arrays! Count the rows, count the columns, and multiply them together.",
        hints: { '*': "Rows go across and columns go down. Rows times columns equals the total!" },
    },
    'square-numbers': {
        instruction: "Time for square numbers! Just multiply the number by itself.",
        hints: { '*': "Square means the number times itself, like five times five!" },
    },
    'times-table-map': {
        instruction: "Welcome to the Times Table Map! Multiply the row number by the column number to fill the cell.",
        hints: { '*': "Find the row on the left and the column on the top, then multiply them." },
    },
    'flashcards': {
        instruction: "Flash cards! Answer the multiplication problems as fast as you can.",
        hints: { '*': "If you get stuck, try skip counting or breaking the problem into smaller facts." },
    },
    'magic-square': {
        instruction: "Welcome to the Magic Square! Fill in the numbers so every row, column, and diagonal adds up to the magic total.",
        hints: { '*': "Find a line that only has one missing number, add what you know, and subtract from the magic total." },
    },

    /* ─── Division ─────────────────────────────────────────────── */
    'dot-grouper': {
        instruction: "Let's divide! Organize the dots so that every group has the exact same amount.",
        hints: { '*': "Deal the dots one by one into each group until they are all shared equally." },
    },
    'fair-share': {
        instruction: "Sharing is division! Divide the items equally so every group gets a fair share.",
        hints: { '*': "Give one item to each group, then go around again until everything is shared." },
    },
    'repeated-subtraction': {
        instruction: "Division is just subtraction! Keep subtracting the number until you hit zero, then count your steps.",
        hints: { '*': "Count how many times you subtract the number before reaching zero. That count is your answer!" },
    },
    'fact-family': {
        instruction: "Meet the fact family! Use multiplication and division to find the missing number.",
        hints: { '*': "Multiplication and division are connected. If you know three times four is twelve, twelve divided by four is three!" },
    },

    /* ─── Fractions ────────────────────────────────────────────── */
    'grid-painter': {
        instruction: "Time to paint fractions! Split the shape into equal pieces and color in the right amount.",
        hints: { '*': "Use the bottom number to split the shape, and the top number to color the pieces." },
    },
    'comparator': {
        instruction: "Which fraction is bigger? Look at the colored bars and choose the greater fraction.",
        hints: { '*': "The longer the bar, the bigger the fraction! Look closely at the visuals." },
    },
    'fraction-number-line': {
        instruction: "Place the fraction on the line! Tap the exact spot where the fraction belongs.",
        hints: { '*': "Imagine dividing the line into equal parts, then count forward to find the spot." },
    },
    'equivalent': {
        instruction: "Find the equivalent fraction! Multiply or divide the top and bottom by the same number.",
        hints: { '*': "Whatever you multiply or divide the top by, do the exact same to the bottom!" },
    },
    'mixed-numbers': {
        instruction: "Let's mix it up! Convert between mixed numbers and improper fractions.",
        hints: { '*': "Multiply the whole number by the bottom, then add the top to make an improper fraction!" },
    },

    /* ─── Algebraic Thinking ───────────────────────────────────── */
    'patterns': {
        instruction: "You're a pattern detective! Find the hidden rule and predict what comes next.",
        hints: { '*': "Look at what changes from one item to the next to find the rule, then apply it!" },
    },
    'balance-scale': {
        instruction: "Keep the scale balanced! Figure out the mystery weight to make both sides equal.",
        hints: { '*': "Add up the side you know, then subtract to find what's missing on the other side." },
    },
    'function-machine': {
        instruction: "Welcome to the Function Machine! Crack the secret rule and predict the output.",
        hints: { '*': "Compare the inputs and outputs to see if it's adding, subtracting, or multiplying." },
    },
    'missing-number': {
        instruction: "Find the missing number! Use the opposite operation to make the equation true.",
        hints: { '*': "If it's addition, try subtracting. The equation must always balance!" },
    },

    /* ─── Number Sense ─────────────────────────────────────────── */
    'primes': {
        instruction: "Is it prime? Decide if the number can only be divided by one and itself.",
        hints: { '*': "Try dividing by two, three, five, or seven. If none work, it's prime!" },
    },
    'negative-numbers': {
        instruction: "Let's go below zero! Use the number line to add and subtract negative numbers.",
        hints: { '*': "When you add, move right. When you subtract, move left on the number line!" },
    },
    'word-problems-ns': {
        instruction: "Brain teaser time! Read the story carefully, find the clue words, and solve.",
        hints: { '*': "Look for clue words like 'total' for adding or 'each' for multiplying to find the right operation." },
    },
}

