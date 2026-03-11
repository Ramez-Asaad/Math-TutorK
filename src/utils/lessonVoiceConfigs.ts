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
        instruction:
            "Hello there, superstar! Welcome to Dot Counter, one of my favorite games. " +
            "Here's how it works: I've scattered some colorful shapes across your screen — dots, stars, hearts, and squares, all bouncing around! " +
            "Your job is to count every single shape you see, no matter what color or type it is. Count them carefully, one by one, from top to bottom or left to right — whatever helps you keep track. " +
            "Once you've got your number, type it on the number pad on the right side of the screen. " +
            "If you get it right, you'll earn ten points and we'll move on to the next round with a different number of shapes. " +
            "If you make a mistake, don't worry at all — just try again! There are ten rounds in total, and each one gets a little trickier. " +
            "This game helps you practice one of the most important skills in all of math: careful counting. " +
            "Take your time, be patient with yourself, and remember — you've got this! Ready? Let's count!",
        hints: {
            '*': "Here's a helpful trick: try touching or pointing at each shape one by one as you count. Start from the top-left corner and work your way across and down, row by row. That way you won't accidentally count the same shape twice or miss any hiding in the corners!",
        },
    },
    'number-line': {
        instruction:
            "Welcome to the Number Line Adventure! A number line is like a long road where numbers live in order — " +
            "the smallest numbers are on the left, and they grow bigger as you move to the right. " +
            "In this game, you'll see a number line stretched across the screen with some numbers already marked on it. " +
            "I'll ask you to find a specific number, and you need to tap the exact right spot on the line where that number belongs. " +
            "Think about where the number falls between the numbers you can already see. Is it closer to the left number or the right number? " +
            "For example, if you see five on the left and ten on the right, and I ask you to find seven, it would be a little past the middle! " +
            "Number lines are super important because they help you understand how numbers relate to each other — which ones are bigger, which are smaller, and how far apart they are. " +
            "Take your time, look carefully, and tap when you're confident. Let's explore the number line together!",
        hints: {
            '*': "Look at the numbers on either side of the gap. The missing number fits right between them. Count up from the left number until you reach the right number — the missing one is in that sequence!",
        },
    },
    'comparison': {
        instruction:
            "Time to play the Comparison Game — one of the coolest ways to train your math brain! " +
            "Here's what happens: I'll show you two groups of objects side by side on the screen. " +
            "Your mission is to look at both groups very carefully and decide which group has MORE objects, which one has FEWER, or if they're exactly the SAME amount. " +
            "The trick is to count each group separately first. Count the left group, remember that number, then count the right group. " +
            "Now compare: if the left number is bigger, the left group has more. If the right number is bigger, the right group wins. And if they're equal — it's a tie! " +
            "Comparing numbers is a skill you use every single day, like figuring out who has more candies or which pile of blocks is bigger. " +
            "Don't rush — accuracy is more important than speed here. Look closely, count carefully, and make your choice. You're going to be amazing at this!",
        hints: {
            '*': "Count each side carefully, one by one. Write the numbers down if it helps! Then compare the two totals. Which number is bigger? That's the side with more!",
        },
    },
    'skip-counting': {
        instruction:
            "Let's learn skip counting — it's like taking big hops along the number line instead of tiny steps! " +
            "Instead of counting one, two, three, four, five, you might skip count by twos: two, four, six, eight, ten! " +
            "Or by fives: five, ten, fifteen, twenty! See how much faster that is? " +
            "In this game, I'll show you a sequence of numbers that follows a skip counting pattern. But one number is missing! " +
            "Your job is to figure out the pattern — how much are we jumping each time? — and then fill in the missing number. " +
            "Look at the difference between each pair of numbers. If they go up by three, then three is your magic jump number. " +
            "Add that same jump to the last number before the gap, and you've found your answer! " +
            "Skip counting is a secret superpower that makes multiplication SO much easier later on. " +
            "Look at the pattern, find the jump, fill in the blank. You can totally do this — hop, hop, hop!",
        hints: {
            '*': "Look at how much bigger each number gets compared to the one before it. That's your jump size! Now add that same amount to the last number you see before the gap.",
        },
    },

    /* ─── Place Value ──────────────────────────────────────────── */
    'dot-builder': {
        instruction:
            "Welcome to the Building Zone — this is where we learn about place value, one of the biggest ideas in math! " +
            "Every number is made up of different parts: ones, tens, hundreds, and sometimes even thousands. " +
            "In this game, I'll show you a target number, and you need to build it using special place-value blocks. " +
            "A tiny block is worth one, a long stick is worth ten, and a big flat square is worth one hundred. " +
            "Think about it like this: if the target is three hundred and forty-two, you need three hundreds-squares, four tens-sticks, and two ones-blocks. " +
            "Click the buttons to add the right number of each type of block, and watch your number come alive on the screen! " +
            "Understanding place value is like having a map of how numbers are built — once you get it, everything in math becomes clearer. " +
            "Break the number apart in your mind, build each part, and let's see that target number appear! " +
            "Take your time and think about each digit. Ready to build?",
        hints: {
            '*': "Break the number into parts. Look at each digit: the leftmost digit tells you hundreds, the middle digit tells you tens, and the rightmost digit tells you ones. Build each part separately!",
        },
    },
    'expanded-form': {
        instruction:
            "Let's take a big number and stretch it apart like a telescope! This is called expanded form, and it's how mathematicians look inside a number to see what it's really made of. " +
            "Every digit in a number has a special value based on its position. The digit in the ones place is just itself, the digit in the tens place is worth ten times itself, " +
            "the hundreds digit is worth a hundred times itself, and so on! " +
            "For example, the number four hundred and fifty-three in expanded form is four hundred plus fifty plus three, or 400 + 50 + 3. " +
            "In this game, I'll give you a number and you'll use the steppers to set how many thousands, hundreds, tens, and ones make it up. " +
            "Start with the biggest place value first, then work your way down. It's like cracking a secret code — each digit hides its true value! " +
            "This skill will help you add and subtract bigger numbers with confidence. " +
            "Focus on one place at a time, and you'll crack the code in no time!",
        hints: {
            '*': "Start with the biggest place. What's the thousands digit? Multiply it by one thousand. Then move to hundreds, tens, and finally ones. Each digit times its place value gives you the answer!",
        },
    },
    'hieroglyphs': {
        instruction:
            "Pack your bags — we're traveling back in time to ancient Egypt! Thousands of years ago, the Egyptians used special picture symbols called hieroglyphs to write their numbers. " +
            "Each hieroglyph stood for a different value: a simple line meant one, a heel bone meant ten, a coiled rope meant one hundred, and a lotus flower meant one thousand! " +
            "In this game, you'll see a collection of hieroglyph symbols on the screen, and a key on the right side tells you what each symbol is worth. " +
            "Your job is to look at each hieroglyph, find its value in the key, and then add all the values together to figure out the secret number. " +
            "It's exactly like place value but with cool ancient symbols instead of digits! " +
            "This game connects you to real history — you're doing the same math that Egyptian scribes did thousands of years ago. " +
            "Match each symbol to the key, add everything up, and decode the mystery number. You're an explorer and a mathematician!",
        hints: {
            '*': "Look at the key on the right side of the screen. Match each symbol you see to its value in the key. Write down each value if it helps, then add them all together for the total!",
        },
    },
    'rounding': {
        instruction:
            "Time to play the Rounding Game! Rounding is when you take a number and simplify it to the nearest ten, hundred, or other place value. " +
            "It's super useful in real life — when someone asks 'about how many,' you round! " +
            "Here's the golden rule: look at the digit right after the place you're rounding to. If that digit is five or more, you round UP to the next ten. " +
            "If it's less than five, you round DOWN and stay where you are. " +
            "For example, twenty-seven rounds up to thirty because seven is more than five. But twenty-three rounds down to twenty because three is less than five. " +
            "In this game, I'll show you a number sitting on a number line between two tens. Your job is to decide which ten it's closer to. " +
            "Is it closer to the left ten or the right ten? That's where it rounds to! " +
            "Look at the ones digit, apply the rule, and make your choice. Rounding is one of those skills that makes you feel like a math wizard. Let's round!",
        hints: {
            '*': "Check the ones digit — that's the key! If it's 5, 6, 7, 8, or 9, round UP to the next ten. If it's 0, 1, 2, 3, or 4, round DOWN. The ones digit tells you everything!",
        },
    },

    /* ─── Addition ─────────────────────────────────────────────── */
    'combining': {
        instruction:
            "It's Combining Time — this is where addition comes alive! " +
            "You'll see two groups of fun objects on the screen, sitting apart from each other. Maybe it's apples and oranges, or stars and moons! " +
            "First, count how many objects are in the first group. Then count the second group. " +
            "Now comes the fun part: press the plus button to push them all together into one big group! " +
            "Watch as they slide together. Now count the combined group — that total is your answer! " +
            "Addition is just putting things together. When you combine three apples with four apples, you get seven apples. " +
            "This game helps you SEE what addition really means, not just work with numbers on paper. " +
            "Every time you combine groups, you're building a deeper understanding of how numbers work together. " +
            "Count each group, combine them, count the total, and type your answer. Let's combine!",
        hints: {
            '*': "Count the objects in each group first — say those numbers out loud if it helps! Then add the two numbers together. The total of both groups is your answer. You've got this!",
        },
    },
    'number-bonds': {
        instruction:
            "Number bonds are like puzzle pieces that fit together to make a whole number! " +
            "Think of it this way: every number can be split into two smaller numbers that add up to it. " +
            "For example, the number ten can be split into seven and three, or six and four, or five and five — so many ways! " +
            "In this game, I'll give you a total number at the top. You'll see two circles below it connected by lines, like branches of a tree. " +
            "Use the slider to decide how to split the total into two parts. Both parts must be more than zero! " +
            "Drag the slider to find a split you like, then press the check button. Any valid split where both numbers are greater than zero counts as correct. " +
            "Number bonds are incredibly powerful because they help you add and subtract faster in your head. " +
            "Once you know all the ways to break apart ten, for example, mental math becomes so much easier. " +
            "Slide, split, and check — you're training your brain to think flexibly about numbers!",
        hints: {
            '*': "Any split works as long as both parts are more than zero and they add up to the total! Try moving the slider to different positions. The two circles should always add up to the number at the top.",
        },
    },
    'making-ten': {
        instruction:
            "Making ten is a SUPERPOWER in math — seriously, once you learn this trick, adding big numbers becomes so much easier! " +
            "Here's the idea: ten is a very special number because our whole number system is based on groups of ten. " +
            "When you add numbers, try to make a ten first, then deal with what's left over. " +
            "For example, if you add eight plus five, you can take two from the five to make the eight into ten, and then you have three left over. Ten plus three is thirteen! " +
            "In this game, you'll see a ten frame — a special grid with ten spaces arranged in two rows of five. " +
            "Some counters are already placed. Your job is to move counters to fill up the ten frame completely first, then count the extras. " +
            "Look at how many empty spaces the frame has — that tells you how many more you need to reach ten. " +
            "Fill those spaces, count what's left outside, and combine ten plus the leftovers for your answer. " +
            "Practice this over and over and you'll become a mental math champion!",
        hints: {
            '*': "Look at the ten frame carefully. How many empty spaces remain? Fill those empty spaces first to complete the ten. Then count whatever counters are left outside the frame. Your answer is ten plus the extras!",
        },
    },
    'column-addition': {
        instruction:
            "Let's learn column addition — this is how the pros add numbers that are too big to do in your head! " +
            "The trick is to stack the numbers one on top of the other, lining up the ones with the ones, the tens with the tens, and the hundreds with the hundreds. " +
            "Now you work from RIGHT to LEFT, starting with the ones column. Add the digits in that column together. " +
            "If the total is less than ten, write it down. But here's the exciting part: if the total is ten or more, " +
            "you write down just the ones digit and CARRY the extra ten over to the next column — like giving a gift to the column next door! " +
            "Then move to the tens column. Add those digits plus any carry from before. Same rules apply! " +
            "Keep going column by column until you've added them all. " +
            "This method works for numbers of ANY size — once you learn it, you can add numbers in the thousands, millions, or even billions! " +
            "Focus on one column at a time, don't forget your carries, and you'll nail it. Ready to add like a pro?",
        hints: {
            '*': "Work from right to left, one column at a time. Add the digits in each column. If you get ten or more, write the ones digit below the line and carry the one to the next column. Don't forget the carry!",
        },
    },
    'addition-word-problems': {
        instruction:
            "Story time meets math time — this is where numbers come alive in real-world situations! " +
            "I'll tell you a short story, and hidden inside that story are numbers and a math problem waiting to be solved. " +
            "Your job is to read the story carefully — maybe read it twice to make sure you understand what's happening. " +
            "Then find the important numbers in the story and figure out what to do with them. " +
            "Look for clue words like 'altogether,' 'total,' 'in all,' 'combined,' or 'how many' — those words usually mean you need to add! " +
            "For example: 'Layla has four stickers and her friend gives her three more. How many stickers does Layla have now?' " +
            "The clue is 'how many now' — that means add four plus three to get seven! " +
            "Word problems teach you to use math in real life, not just with plain numbers. " +
            "Every story has a secret equation hiding inside it. Read carefully, find the numbers, add them up, and type your answer. You're a word problem detective!",
        hints: {
            '*': "Read the story slowly one more time. Underline or remember the important numbers. Look for clue words like 'total,' 'altogether,' or 'how many.' Those words tell you to add the numbers together!",
        },
    },

    /* ─── Subtraction ──────────────────────────────────────────── */
    'takeaway': {
        instruction:
            "It's takeaway time — the opposite of adding! Subtraction means taking some objects away from a group and seeing what's left. " +
            "You'll see a group of fun objects on the screen. First, count them all to know your starting number. " +
            "Then I'll tell you how many to remove. Tap on the objects to make them disappear — watch them fly away one by one! " +
            "After you've removed the right amount, count the objects that are still there. That number is your answer! " +
            "Real life is full of subtraction: If you have eight cookies and eat three, how many are left? Eight take away three is five! " +
            "The key is to start with the total, remove the amount shown, and count what remains. " +
            "Don't rush when tapping — make sure you remove exactly the right number, no more and no less. " +
            "Each round has different objects and different amounts, so stay sharp. You're going to be a takeaway champion!",
        hints: {
            '*': "Start with the total number of objects. Take away the amount shown by tapping them. Then carefully count everything that's still on the screen. The leftover amount is your answer!",
        },
    },
    'number-line-jumps': {
        instruction:
            "Get ready to jump BACKWARDS on the number line! In addition, you jump forward to add. But in subtraction, you jump backward to take away! " +
            "Here's how it works: find the starting number on the number line. That's where you begin your journey. " +
            "Now, the second number tells you how many jumps backward to make. Each jump is one step to the left. " +
            "For example, if you start at twelve and subtract four, you jump back four spaces: twelve, eleven, ten, nine, eight. You land on eight! " +
            "In this game, you'll tap backward along the number line, counting each jump. Where you land is your answer! " +
            "This is a fantastic way to visualize subtraction — you can actually SEE the numbers getting smaller as you move left. " +
            "The number line is like a ruler that helps your brain picture what subtraction does. " +
            "Start at the big number, jump back by the small number, and land on your answer. Let's go jumping!",
        hints: {
            '*': "Find the starting number on the line — that's the bigger number. Now count backwards by the amount you're subtracting. Each step left is minus one. Where did you land? That's your answer!",
        },
    },
    'ten-frame': {
        instruction:
            "The ten frame is a powerful tool for subtraction! You'll see a frame with two rows of five spaces, and some of those spaces have colored circles in them. " +
            "Count the filled circles first — that's your starting number. " +
            "Now, I'll ask you to remove a certain number of circles. Click on them to take them away. " +
            "After removing the right amount, count how many circles are still in the frame. That remaining number is your answer! " +
            "The ten frame is special because it makes numbers visual. You can see groups of five at a glance, which makes counting faster. " +
            "For example, if you see a full row of five and three more, you instantly know that's eight — no counting needed! " +
            "After removing some circles, use the same trick: a full row is five, plus whatever extras are in the other row. " +
            "This game builds your number sense and helps you subtract quickly and confidently. " +
            "Count the filled ones, remove the right amount, count what's left. Simple and powerful!",
        hints: {
            '*': "Count all the filled circles first. Now remove the number shown — click them to take them away. Count the circles still there. Remember, a full row is always five, so use that to count faster!",
        },
    },
    'column-subtraction': {
        instruction:
            "Column subtraction is the big-number version of takeaway — it lets you subtract numbers that are way too large to do in your head! " +
            "Just like column addition, you stack the numbers with the bigger one on top and the smaller one below, lining up the columns neatly. " +
            "Start from the RIGHT side, in the ones column. Subtract the bottom digit from the top digit. " +
            "But here's where it gets interesting: what if the top digit is SMALLER than the bottom digit? You can't subtract a bigger number from a smaller one! " +
            "That's when you BORROW from the column next door. Take one ten from the tens column and add it to your ones column — that gives you ten extra to work with. " +
            "Don't forget to reduce the tens column by one after borrowing! " +
            "Keep going column by column, borrowing when needed, until you've subtracted everything. " +
            "This method works for numbers of any size. Practice the borrowing — that's the trickiest part — and you'll master it. " +
            "One column at a time, borrow when needed, and you're golden!",
        hints: {
            '*': "If the top digit is smaller than the bottom digit in any column, you need to borrow! Take ten from the column to the left, add it to your current column, then subtract. Don't forget to reduce the column you borrowed from!",
        },
    },
    'missing-number-subtraction': {
        instruction:
            "Put on your detective hat — there's a mystery number hiding in this subtraction equation! " +
            "You'll see a subtraction problem, but one of the numbers is replaced by a question mark. It could be the first number, the second number, or even the answer! " +
            "Your mission is to use the numbers you CAN see to figure out the missing one. " +
            "Here's the detective trick: subtraction and addition are opposites, like two sides of the same coin. " +
            "If the answer is missing, just subtract normally. If the number being subtracted is missing, take the answer and see what you need to add to get the starting number. " +
            "If the first number is missing, add the other two numbers together! " +
            "For example: something minus five equals three. What's the something? Well, three plus five is eight, so the answer is eight! " +
            "This game trains you to think flexibly about numbers and operations. " +
            "Look at what you know, use the inverse operation, and crack the case. Detective mode: ON!",
        hints: {
            '*': "Use the opposite operation to find the mystery number! If the answer is missing, subtract normally. If another number is missing, try adding the two numbers you know. Addition and subtraction are a team!",
        },
    },

    /* ─── Multiplication ───────────────────────────────────────── */
    'equal-groups': {
        instruction:
            "Welcome to Equal Groups — this is where multiplication begins! Multiplication is really just a faster way of adding the same number over and over. " +
            "In this game, you'll see several groups of objects, and every group has the SAME number of items inside. " +
            "Your job has three steps: first, count how many groups there are. Second, count how many items are in each group. " +
            "Third, multiply those two numbers together to find the grand total! " +
            "For example, if you see four groups and each group has three stars, that's four times three, which equals twelve stars altogether! " +
            "You can also think of it as adding three plus three plus three plus three — four groups of three. " +
            "This game helps you understand that multiplication is NOT some scary new thing — it's just a shortcut for repeated addition. " +
            "Count the groups, count what's inside each one, multiply, and type your answer. " +
            "You're about to become a multiplication master!",
        hints: {
            '*': "How many groups do you see? Count them. Now how many items are in each group? Count those too. Multiply group count times items per group. If you're stuck, add the group size over and over — that's what multiply means!",
        },
    },
    'arrays': {
        instruction:
            "Let's build arrays — perfectly organized rows and columns of objects, like soldiers standing in formation or seeds planted in a garden! " +
            "An array is a special arrangement where objects are lined up in straight rows going across AND straight columns going down. " +
            "To find the total number of objects, you count the rows, count the columns, and multiply them together! " +
            "For example, three rows of five columns means three times five, which is fifteen objects total. " +
            "You can also count it as five plus five plus five — three groups of five! " +
            "Arrays are everywhere in real life: egg cartons, chocolate boxes, tiles on a floor, windows on a building. " +
            "In this game, you'll see an array and need to figure out the multiplication it represents. " +
            "Count across for columns, count down for rows, multiply them, and type the product. " +
            "Once you understand arrays, you'll see multiplication patterns everywhere you look!",
        hints: {
            '*': "Count straight across one row to find the number of columns. Count straight down one column to find the number of rows. Now multiply: rows times columns equals the total. It's beautiful math!",
        },
    },
    'square-numbers': {
        instruction:
            "Square numbers are extra special and super cool — a square number is what you get when you multiply a number by ITSELF! " +
            "Two times two is four, so four is a square number. Three times three is nine — another square number! " +
            "They're called 'square' numbers because if you arrange that many dots, they form a perfect square shape. " +
            "Four dots make a two-by-two square. Nine dots make a three-by-three square. Sixteen dots make a four-by-four square! " +
            "In this game, I'll show you a number and you need to SQUARE it — multiply it by itself. " +
            "Watch the visual grow on the screen as you type your answer — you'll see the square take shape! " +
            "Here are some to memorize: one squared is one, two squared is four, three squared is nine, four squared is sixteen, " +
            "five squared is twenty-five, six squared is thirty-six, seven squared is forty-nine, eight squared is sixty-four, nine squared is eighty-one, and ten squared is one hundred! " +
            "Type the square of each number I give you. Let's see those squares grow!",
        hints: {
            '*': "Take the number shown and multiply it by itself. That's what squaring means! For example, five squared means five times five, which is twenty-five. The number times itself — that's your answer!",
        },
    },
    'times-table-map': {
        instruction:
            "Welcome to the Times Table Map — a giant magical grid that holds EVERY multiplication fact you'll ever need! " +
            "The grid has numbers going across the top and numbers going down the left side. " +
            "When a row and a column cross each other, the number in that cell is the PRODUCT of the row number and the column number. " +
            "For example, if you're in row three and column seven, the answer is three times seven, which is twenty-one. " +
            "In this game, a cell in the grid will light up, and you need to figure out what number goes there by multiplying the row and column headers. " +
            "This grid is like a treasure map — every cell holds a multiplication fact, and the more facts you know by heart, the faster you'll be at math! " +
            "Look for patterns: notice how the twos column goes two, four, six, eight — that's skip counting by twos! " +
            "Every column and row follows a skip-counting pattern. Find the row, find the column, multiply them together. " +
            "Master this map and you'll conquer multiplication forever!",
        hints: {
            '*': "Find the row number on the left side and the column number on the top. Multiply those two numbers together — that's the product that belongs in the highlighted cell!",
        },
    },
    'flashcards': {
        instruction:
            "Flash cards — the ultimate speed challenge! In this game, multiplication problems pop up one after another, and your goal is to answer them as fast as you can. " +
            "Each flashcard shows a multiplication problem like six times seven, and you type the answer on the number pad. " +
            "The faster you answer correctly, the more points you earn! But accuracy matters too — a wrong answer doesn't earn any points. " +
            "This game is all about building fluency. The more you practice, the faster these facts will come to your brain. " +
            "Eventually, you'll see seven times eight and INSTANTLY know it's fifty-six, without even thinking about it! " +
            "If you get stuck on a tough one, try skip counting. For four times six, count by fours: four, eight, twelve, sixteen, twenty, twenty-four! " +
            "Or break it into easier facts: four times six is the same as four times five plus four times one, which is twenty plus four, which equals twenty-four! " +
            "Speed and accuracy — let's see how fast your math brain can go! Ready, set, flash!",
        hints: {
            '*': "If you're stuck, try skip counting! For three times seven, count by threes seven times: three, six, nine, twelve, fifteen, eighteen, twenty-one. Or break it into smaller facts you already know!",
        },
    },
    'magic-square': {
        instruction:
            "Welcome to the Magic Square puzzle — one of the oldest and most fascinating puzzles in all of mathematics! " +
            "A magic square is a grid where you fill in numbers so that every row, every column, AND every diagonal all add up to the same total. " +
            "That special total is called the 'magic number' or 'magic constant,' and I'll show it to you at the top of the puzzle. " +
            "Some numbers are already filled in as clues. Your job is to figure out the missing numbers that make the magic work. " +
            "Here's a strategy: find a row, column, or diagonal that already has all but one number filled in. " +
            "Add up the numbers that are already there, then subtract from the magic total. The difference is your missing number! " +
            "Then use that number to help solve more rows and columns, like a chain reaction! " +
            "Magic squares are a beautiful blend of arithmetic and logic. They've been studied for thousands of years in many cultures around the world. " +
            "Think carefully, use addition and subtraction, and fill in every cell. Can you make the magic happen?",
        hints: {
            '*': "Find a row, column, or diagonal that only has one missing number. Add up the known numbers in that line, then subtract from the magic total. The difference is your missing number! Use each solved number to unlock more.",
        },
    },

    /* ─── Division ─────────────────────────────────────────────── */
    'dot-grouper': {
        instruction:
            "Group the dots into equal teams — this is what division is all about! Division means splitting a total into groups that are all exactly the same size. " +
            "You'll see a bunch of dots scattered on the screen, and I'll tell you how many groups to make. " +
            "Your job is to organize the dots so every group has the SAME number. No group gets more, no group gets less — perfectly equal! " +
            "Think of it like dealing cards: give one dot to the first group, one to the second, one to the third, and keep going around until all the dots are used up. " +
            "When you're done, count how many dots are in each group. That number is the QUOTIENT — the answer to the division problem! " +
            "For example, twelve dots divided into three groups means each group gets four dots, because twelve divided by three is four. " +
            "Division is the fair way to share things equally. It's the opposite of multiplication, and it shows up everywhere in real life. " +
            "Drag the dots around, make sure every group is equal, and discover the answer!",
        hints: {
            '*': "Try dealing dots one at a time into each group, like dealing cards in a card game. Go around and around until every dot is placed. Then count how many are in each group — they should all be the same!",
        },
    },
    'fair-share': {
        instruction:
            "Sharing is caring, and fair sharing is DIVISION! In this game, you need to divide items equally among groups so everyone gets exactly the same amount. " +
            "Imagine you have fifteen cookies and three friends. How do you share them fairly? Each friend gets five cookies, because fifteen divided by three is five! " +
            "I'll show you some items and some groups. Your job is to figure out how many items each group gets when everything is divided equally. " +
            "Think of it as dealing out the items one by one: one for group one, one for group two, one for group three, then back to group one, and so on. " +
            "Keep going until every item is given away. Then count how many each group received. " +
            "Fair sharing is one of the most important math concepts you'll ever learn. You use it when splitting pizza, sharing toys, dividing candy, or even splitting a bill! " +
            "Count the total items, count the groups, figure out how many each group gets. Fair and square!",
        hints: {
            '*': "Give one item to each group, then go around again. Keep dealing until everything is shared out equally. Count how many each group ended up with — that's your answer!",
        },
    },
    'repeated-subtraction': {
        instruction:
            "Here's a cool secret: division is really just subtraction done over and over! Watch — I'll show you how it works. " +
            "Let's say you want to divide twenty by five. Start with twenty. Subtract five: you get fifteen. That's one subtraction. " +
            "Subtract five again: you get ten. That's two subtractions. Subtract five again: you get five. Three subtractions. " +
            "Subtract five one more time: you get zero. Four subtractions total. So twenty divided by five is FOUR! " +
            "See? You just counted how many times you subtracted five before reaching zero. That count IS the division answer! " +
            "In this game, you'll subtract the same number over and over from a starting number until you reach zero. " +
            "Each time you subtract, it counts as one step. The total number of steps is your quotient! " +
            "This method shows you WHY division works — it's not just a rule to memorize, it's a process you can SEE. " +
            "Subtract, subtract, subtract, count the steps, and that's your answer!",
        hints: {
            '*': "Keep subtracting the divisor from the total, then from the result, and keep going until you hit zero. Count each subtraction you made. That count is your division answer!",
        },
    },
    'fact-family': {
        instruction:
            "Meet the fact family — three numbers that are all related through multiplication and division, like a real family! " +
            "Every multiply fact has a matching division fact. If you know that three times four equals twelve, " +
            "you also know that four times three equals twelve, twelve divided by three equals four, AND twelve divided by four equals three! " +
            "See? One set of three numbers gives you FOUR related facts. That's a fact family! " +
            "In this game, I'll give you part of a fact family and you need to figure out the rest. " +
            "Maybe I'll show you three times something equals twelve — what's the something? It's four! " +
            "Or twelve divided by something equals three — the something is four again! " +
            "The beauty of fact families is that knowing one fact automatically gives you three more for free. " +
            "Think of multiplication and division as best friends who always help each other out. " +
            "Figure out the relationships, complete the family, and see how multiplication and division are two sides of the same coin!",
        hints: {
            '*': "If you know the multiplication fact, just flip it around for division! Three times four is twelve means twelve divided by four is three. Multiplication and division always come in pairs. Use one to find the other!",
        },
    },

    /* ─── Fractions ────────────────────────────────────────────── */
    'grid-painter': {
        instruction:
            "Grab your virtual paint brush — it's time to paint fractions! Fractions have two parts: a numerator on top and a denominator on the bottom. " +
            "The DENOMINATOR tells you how many TOTAL equal pieces the shape is divided into. The NUMERATOR tells you how many pieces to color in! " +
            "But here's the creative part: the shape starts as one big piece. You need to use the split tools on the left to divide it! " +
            "The 'divide by two' button cuts each piece in half. 'Divide by three' splits each piece into thirds. 'Divide by five' makes fifths! " +
            "Once you've split the shape into the right number of total pieces matching the denominator, click on individual pieces to paint them with your chosen color. " +
            "Paint exactly as many pieces as the numerator says! You can pick different colors from the palette, and use the eraser to unpaint mistakes. " +
            "When you're done, hit Check to see if you shaded the correct fraction. " +
            "This game makes fractions visual and hands-on. You're literally BUILDING the fraction with your own clicks! " +
            "Split the shape, paint the right number of pieces, and create a fraction masterpiece!",
        hints: {
            '*': "First, use the split tools to divide the shape into the right number of total pieces — that should match the denominator (bottom number). Then click to paint pieces — paint exactly as many as the numerator (top number) says!",
        },
    },
    'comparator': {
        instruction:
            "Which fraction is bigger? That's the million-dollar question, and this game helps you answer it with confidence! " +
            "You'll see two fractions displayed as colored bars side by side. The longer the bar, the bigger the fraction! " +
            "Your job is to look at both bars carefully and decide: which fraction is greater? Or are they the same? " +
            "Here are some comparison tips: if two fractions have the SAME denominator (same bottom number), " +
            "the one with the bigger numerator (top number) is larger. Three-fifths is bigger than two-fifths! " +
            "If they have the SAME numerator, the one with the SMALLER denominator is actually bigger. " +
            "One-third is bigger than one-fifth because thirds are bigger pieces than fifths! " +
            "Look at the visual bars to confirm your thinking — your eyes don't lie! " +
            "This game trains your fraction intuition so you'll eventually compare fractions in your head without any visuals at all. " +
            "Compare the bars, think about the numbers, and pick the bigger fraction!",
        hints: {
            '*': "Look at the colored bars — the longer bar represents the bigger fraction. If the denominators match, the bigger numerator wins. If the numerators match, the smaller denominator wins. The bars always show the truth!",
        },
    },
    'fraction-number-line': {
        instruction:
            "Place the fraction on the number line — this game connects fractions to the number line you already know and love! " +
            "You'll see a number line stretching from zero to one. Your job is to tap the exact spot where the given fraction belongs. " +
            "Here's how to think about it: the DENOMINATOR tells you how many equal segments to divide the line into. " +
            "If the denominator is four, imagine cutting the line from zero to one into four equal pieces. " +
            "The NUMERATOR tells you how many of those pieces to count from zero. If the fraction is three-fourths, count three pieces from zero and tap there! " +
            "One-half is always in the middle. One-fourth is halfway between zero and one-half. Three-fourths is halfway between one-half and one. " +
            "These landmarks can help you estimate where other fractions go! " +
            "Placing fractions on a number line is one of the best ways to truly understand what a fraction MEANS — it's a specific point between zero and one. " +
            "Divide the line mentally, count the segments, and tap the right spot!",
        hints: {
            '*': "Imagine slicing the line from zero to one into equal parts — the number of parts matches the denominator. Then count from zero the number of parts equal to the numerator. That's your tap spot!",
        },
    },
    'equivalent': {
        instruction:
            "Equivalent fractions are fractions that look completely different but are actually the SAME value — they're masters of disguise! " +
            "For example, one-half and two-fourths are equivalent. They look different, but they represent exactly the same amount! " +
            "Here's the magic trick: if you multiply BOTH the numerator and denominator by the same number, the fraction's value doesn't change. " +
            "One-half times two over two gives you two-fourths. One-half times three over three gives you three-sixths. They're all the same! " +
            "You can also go the other way: divide both the numerator and denominator by the same number to SIMPLIFY a fraction. " +
            "Four-eighths simplified is two-fourths, which simplifies further to one-half! " +
            "In this game, I'll show you a fraction and ask you to find its equivalent. Multiply or divide both parts by the same number. " +
            "This is one of the most powerful fraction skills because it lets you compare, add, and subtract fractions by finding common denominators. " +
            "Same value, different look — find the fraction's twin and prove they're equivalent!",
        hints: {
            '*': "Multiply or divide both the top number and bottom number by the same value. The fraction stays equal! For example, multiply both by two, or divide both by three. Whatever you do to one, do to the other!",
        },
    },
    'mixed-numbers': {
        instruction:
            "Mixed numbers have a WHOLE part and a FRACTION part living together — like one and a half, two and three-quarters, or five and two-thirds! " +
            "Sometimes you need to convert a mixed number into an IMPROPER fraction (where the numerator is bigger than the denominator), and vice versa. " +
            "Here's how to go from mixed to improper: multiply the whole number by the denominator, then add the numerator. " +
            "That gives you the new numerator, and the denominator stays the same! " +
            "For example, two and three-fourths: two times four is eight, plus three is eleven. So it becomes eleven-fourths! " +
            "To go the other way — improper to mixed — divide the numerator by the denominator. " +
            "The quotient is the whole number, and the remainder becomes the new numerator! " +
            "For example, eleven divided by four is two remainder three, so eleven-fourths is two and three-fourths! " +
            "In this game, you'll practice switching between mixed numbers and improper fractions. It's easier than it sounds, I promise! " +
            "Follow the steps, do the math, and switch like a pro!",
        hints: {
            '*': "Mixed to improper: multiply the whole number by the denominator, add the numerator — that's your new top number. Keep the same denominator. Improper to mixed: divide top by bottom. Quotient is the whole part, remainder is the new numerator!",
        },
    },

    /* ─── Algebraic Thinking ───────────────────────────────────── */
    'patterns': {
        instruction:
            "Patterns are everywhere — in wallpaper, music, seasons, and especially in math! In this game, you're a pattern detective. " +
            "I'll show you a sequence of shapes, colors, or numbers that follow a hidden rule. " +
            "Your mission is to figure out what the pattern is, and then predict what comes NEXT! " +
            "Some patterns repeat: red, blue, red, blue, red, blue — what comes next? Red! " +
            "Some patterns grow: two, four, six, eight — what comes next? Ten, because we're adding two each time! " +
            "Some alternate: circle, square, circle, square — you can see where this is going! " +
            "The key is to look at how each item relates to the one before it. What's changing? What's staying the same? What's the rule? " +
            "Once you spot the rule, applying it to find the next item is easy. " +
            "Pattern recognition is one of the foundations of all mathematics and even computer science. When you find patterns, you find order in chaos! " +
            "Study the sequence carefully, find the rule, and pick the next item. You're a pattern master!",
        hints: {
            '*': "Look at how each item changes from one to the next. Is it repeating in a cycle? Adding a fixed amount? Alternating between types? Once you find the rule, apply it to the last item to get the answer!",
        },
    },
    'balance-scale': {
        instruction:
            "The balance scale needs to be perfectly balanced — like a seesaw at the playground! One side has weights on it, and the other side has a mystery weight. " +
            "A balanced scale means both sides are EXACTLY equal. If the left side weighs fifteen, the right side must also weigh fifteen! " +
            "In this game, you can see the known weights on one side and need to figure out the mystery weight that makes them balance. " +
            "This is actually ALGEBRA! The mystery weight is like a variable — let's call it X. " +
            "The equation is: known side equals unknown side. Solve for the mystery weight! " +
            "For example, if one side has five and three, that's eight total. The other side has some weight plus two — what's the mystery? " +
            "Eight equals mystery plus two. Mystery equals eight minus two. Mystery equals six! " +
            "The balance scale makes algebra feel natural — you're not solving scary equations, you're just keeping a scale balanced. " +
            "Add up the known side, then figure out what's missing on the other side. Keep it balanced, and you win!",
        hints: {
            '*': "Add up all the weights on the side you know. The other side must equal the same total. Subtract the known weights from that total to find the mystery weight. Balance means both sides are equal!",
        },
    },
    'function-machine': {
        instruction:
            "Welcome to the Function Machine — a mysterious box where numbers go in one side and different numbers come out the other! " +
            "Inside the machine is a secret rule. Maybe it adds five to every number. Maybe it multiplies by two. Maybe it subtracts three! " +
            "Your job is to study the inputs and outputs, crack the secret rule, and then predict what output the machine will give for a new input. " +
            "For example, if two goes in and six comes out, three goes in and nine comes out, four goes in and twelve comes out — what's the rule? " +
            "The machine multiplies by three! Two times three is six, three times three is nine, four times three is twelve! " +
            "Look at several input-output pairs to confirm your guess. Make sure your rule works for ALL of them, not just one. " +
            "Function machines teach you to think about relationships between numbers — how one number transforms into another. " +
            "This is the foundation of algebra and even programming! " +
            "Study the patterns, crack the rule, and predict the output. You're a code breaker!",
        hints: {
            '*': "Compare each input to its output. What operation transforms the input into the output? Does it work for ALL the pairs you see? Adding? Multiplying? Subtracting? Check every pair to confirm your rule!",
        },
    },
    'missing-number': {
        instruction:
            "There's a blank hiding in this equation — a mystery number that makes everything work perfectly! " +
            "You'll see a math equation with one number replaced by a question mark. It could be anywhere: the first number, the second number, or the result. " +
            "Your goal is to figure out which number makes the equation TRUE. " +
            "The secret weapon is using INVERSE operations — the opposite of each operation. " +
            "If the equation uses addition, use subtraction to find the missing number. If it uses subtraction, use addition! " +
            "For example: something plus seven equals twelve. To find the something, subtract seven from twelve. The answer is five! " +
            "Or: nine minus something equals four. To find the something, subtract four from nine. The answer is five! " +
            "Think of the equation as a balance: both sides must be equal. Use what you know to figure out what you don't. " +
            "This is real algebra — solving for an unknown variable. And you're doing it right now! " +
            "Look at the equation, find the gap, use inverse operations, and fill in the missing number!",
        hints: {
            '*': "Use the opposite operation to find the mystery number! Addition is the opposite of subtraction. If the equation says plus and you need the missing number, subtract. If it says minus, add! The equation must balance!",
        },
    },

    /* ─── Number Sense ─────────────────────────────────────────── */
    'primes': {
        instruction:
            "Prime numbers are the superstars of the number world — they're special because they can ONLY be divided evenly by one and themselves! " +
            "Two is prime (only one and two divide it). Three is prime. Five is prime. Seven is prime. Eleven is prime. " +
            "But four is NOT prime because two goes into four evenly. Six is not prime because two AND three go into it. " +
            "How do you test if a number is prime? Try dividing it by small numbers: two, three, five, seven. " +
            "If none of them divide evenly, the number is prime! " +
            "Quick tip: any even number bigger than two is NOT prime (because two divides it). Any number ending in zero or five (besides five itself) is NOT prime. " +
            "In this game, I'll show you numbers and you decide: is it PRIME or COMPOSITE (not prime)? " +
            "Prime numbers are like the building blocks of all other numbers — every number can be built by multiplying primes together. " +
            "This is called the Fundamental Theorem of Arithmetic, and it's one of the most beautiful ideas in math! " +
            "Test each number carefully and make your call. Think like a mathematician!",
        hints: {
            '*': "Try dividing by two, three, five, and seven. If ANY of them divide evenly with no remainder, the number is NOT prime. If none of them work, it IS prime! Even numbers bigger than two are never prime.",
        },
    },
    'negative-numbers': {
        instruction:
            "Let's explore the mysterious land BELOW zero! Negative numbers are numbers less than zero, and they live on the LEFT side of the number line. " +
            "Think of a thermometer: zero degrees is freezing, and temperatures below zero are negative — like minus five or minus ten. Brrr! " +
            "On a number line, positive numbers go to the right and negative numbers go to the left. " +
            "An interesting rule: the further left you go, the SMALLER the number gets. So minus ten is actually less than minus three! " +
            "When you add a positive number to a negative number, you move RIGHT on the number line. " +
            "When you subtract from a negative number, you move even further LEFT. " +
            "For example, minus three plus five means start at minus three and jump five to the right. You land on two! " +
            "In this game, you'll navigate the number line through both positive and negative territory. " +
            "Negative numbers aren't scary — they're just numbers that live on the other side of zero. " +
            "Think of the number line, figure out your position, and find the answer!",
        hints: {
            '*': "Picture a number line in your mind. Negative numbers are to the left of zero. When you add, move right. When you subtract, move left. Count the spaces carefully — where do you end up?",
        },
    },
    'word-problems-ns': {
        instruction:
            "Time for a brain-teasing word problem that tests your number sense — your deep understanding of how numbers work! " +
            "These aren't simple 'add two numbers' problems. They require you to read carefully, think about what's happening, and choose the right operation. " +
            "Here's your strategy: read the problem once to get the big picture. Then read it AGAIN, slowly, focusing on the numbers and what's happening to them. " +
            "Look for clue words! 'How many in all' or 'total' means ADDITION. 'How many left' or 'remaining' means SUBTRACTION. " +
            "'Each group gets' or 'shared equally' means DIVISION. 'Times as many' or 'total in groups' means MULTIPLICATION. " +
            "Once you figure out the operation, set up the math and solve it. " +
            "Some problems might need TWO steps! For example: 'Tom has five bags with four apples each. He gives away three apples. How many are left?' " +
            "Step one: five times four is twenty. Step two: twenty minus three is seventeen! " +
            "Word problems are the ultimate test because they're just like real life. " +
            "Read carefully, find the clue words, choose the operation, solve, and type your answer!",
        hints: {
            '*': "Read it again slowly! Circle the important numbers in your mind. Look for clue words: 'total' means add, 'left' means subtract, 'each' means multiply or divide, 'difference' means subtract. The clue words always give away the operation!",
        },
    },
}
