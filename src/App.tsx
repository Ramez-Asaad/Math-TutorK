import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './screens/Home'
// Counting lessons
import { DotCounter } from './categories/counting/DotCounter'
import { NumberLineWalker } from './categories/counting/NumberLineWalker'
import { Comparison } from './categories/counting/Comparison'
import { SkipCounting } from './categories/counting/SkipCounting'
// Place Value lessons
import { DotBuilder } from './categories/place-value/DotBuilder'
import { ExpandedForm } from './categories/place-value/ExpandedForm'
import { Hieroglyphs } from './categories/place-value/Hieroglyphs'
import { Rounding } from './categories/place-value/Rounding'
// Addition lessons
import { ObjectCombining } from './categories/addition/ObjectCombining'
import { NumberBonds } from './categories/addition/NumberBonds'
import { MakingTen } from './categories/addition/MakingTen'
import { ColumnAddition } from './categories/addition/ColumnAddition'
import { AdditionWordProblems } from './categories/addition/AdditionWordProblems'
// Subtraction lessons
import { ObjectTakeaway } from './categories/subtraction/ObjectTakeaway'
import { NumberLineJumpsBack } from './categories/subtraction/NumberLineJumpsBack'
import { TenFrame } from './categories/subtraction/TenFrame'
import { ColumnSubtraction } from './categories/subtraction/ColumnSubtraction'
import { MissingNumberSubtraction } from './categories/subtraction/MissingNumberSubtraction'
// Multiplication lessons
import { EqualGroups } from './categories/multiplication/EqualGroups'
import { ArrayBuilder } from './categories/multiplication/ArrayBuilder'
import { SquareNumbers } from './categories/multiplication/SquareNumbers'
import { TimesTableMap } from './categories/multiplication/TimesTableMap'
import { Flashcards } from './categories/multiplication/Flashcards'
import { MagicSquare } from './categories/multiplication/MagicSquare'
// Division lessons
import { DotGrouper } from './categories/division/DotGrouper'
import { FairShare } from './categories/division/FairShare'
import { RepeatedSubtraction } from './categories/division/RepeatedSubtraction'
import { FactFamily } from './categories/division/FactFamily'
// Fractions lessons
import { GridPainter } from './categories/fractions/GridPainter'
import { FractionComparator } from './categories/fractions/FractionComparator'
import { FractionNumberLine } from './categories/fractions/FractionNumberLine'
import { EquivalentFractions } from './categories/fractions/EquivalentFractions'
import { MixedNumbers } from './categories/fractions/MixedNumbers'
// Algebraic Thinking lessons
import { PatternSequencer } from './categories/algebraic/PatternSequencer'
import { BalanceScale } from './categories/algebraic/BalanceScale'
import { FunctionMachine } from './categories/algebraic/FunctionMachine'
import { MissingNumberEq } from './categories/algebraic/MissingNumberEq'
// Number Sense lessons
import { Primes } from './categories/number-sense/Primes'
import { NegativeNumbers } from './categories/number-sense/NegativeNumbers'
import { WordProblems } from './categories/number-sense/WordProblems'

function App() {
  return (
    <BrowserRouter>
      <div className="w-screen h-screen overflow-hidden">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* ── Counting ── */}
          <Route path="/counting/dot-counter" element={<DotCounter />} />
          <Route path="/counting/number-line" element={<NumberLineWalker />} />
          <Route path="/counting/comparison" element={<Comparison />} />
          <Route path="/counting/skip-counting" element={<SkipCounting />} />

          {/* ── Place Value ── */}
          <Route path="/place-value/dot-builder" element={<DotBuilder />} />
          <Route path="/place-value/expanded-form" element={<ExpandedForm />} />
          <Route path="/place-value/hieroglyphs" element={<Hieroglyphs />} />
          <Route path="/place-value/rounding" element={<Rounding />} />

          {/* ── Addition ── */}
          <Route path="/addition/combining" element={<ObjectCombining />} />
          <Route path="/addition/number-bonds" element={<NumberBonds />} />
          <Route path="/addition/making-ten" element={<MakingTen />} />
          <Route path="/addition/column-addition" element={<ColumnAddition />} />
          <Route path="/addition/word-problems" element={<AdditionWordProblems />} />

          {/* ── Subtraction ── */}
          <Route path="/subtraction/takeaway" element={<ObjectTakeaway />} />
          <Route path="/subtraction/number-line" element={<NumberLineJumpsBack />} />
          <Route path="/subtraction/ten-frame" element={<TenFrame />} />
          <Route path="/subtraction/column-subtraction" element={<ColumnSubtraction />} />
          <Route path="/subtraction/missing-number" element={<MissingNumberSubtraction />} />

          {/* ── Multiplication ── */}
          <Route path="/multiplication/equal-groups" element={<EqualGroups />} />
          <Route path="/multiplication/arrays" element={<ArrayBuilder />} />
          <Route path="/multiplication/square-numbers" element={<SquareNumbers />} />
          <Route path="/multiplication/times-table-map" element={<TimesTableMap />} />
          <Route path="/multiplication/flashcards" element={<Flashcards />} />
          <Route path="/multiplication/magic-square" element={<MagicSquare />} />

          {/* ── Division ── */}
          <Route path="/division/dot-grouper" element={<DotGrouper />} />
          <Route path="/division/fair-share" element={<FairShare />} />
          <Route path="/division/repeated-subtraction" element={<RepeatedSubtraction />} />
          <Route path="/division/fact-family" element={<FactFamily />} />

          {/* ── Fractions ── */}
          <Route path="/fractions/grid-painter" element={<GridPainter />} />
          <Route path="/fractions/comparator" element={<FractionComparator />} />
          <Route path="/fractions/number-line" element={<FractionNumberLine />} />
          <Route path="/fractions/equivalent" element={<EquivalentFractions />} />
          <Route path="/fractions/mixed-numbers" element={<MixedNumbers />} />

          {/* ── Algebraic Thinking ── */}
          <Route path="/algebraic/patterns" element={<PatternSequencer />} />
          <Route path="/algebraic/balance-scale" element={<BalanceScale />} />
          <Route path="/algebraic/function-machine" element={<FunctionMachine />} />
          <Route path="/algebraic/missing-number" element={<MissingNumberEq />} />

          {/* ── Number Sense ── */}
          <Route path="/number-sense/primes" element={<Primes />} />
          <Route path="/number-sense/negative-numbers" element={<NegativeNumbers />} />
          <Route path="/number-sense/word-problems" element={<WordProblems />} />

          {/* Fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
