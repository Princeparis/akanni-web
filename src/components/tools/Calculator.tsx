'use client'
import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { calculate, formatNumber, type AngleMode } from '@/lib/creative-tools'
import { reducedMotion } from './shared'
export default function Calculator() {
  const root = useRef<HTMLDivElement>(null),
    input = useRef<HTMLInputElement>(null)
  const [expression, setExpression] = useState('sqrt(144) + 2^3')
  const [answer, setAnswer] = useState<number | null>(20)
  const [mode, setMode] = useState<AngleMode>('DEG'),
    [memory, setMemory] = useState(0)
  const [history, setHistory] = useState<{ expression: string; result: number; mode: AngleMode }[]>(
    [],
  )
  const [error, setError] = useState(''),
    [revision, setRevision] = useState(0)
  const { contextSafe } = useGSAP({ scope: root })
  useGSAP(
    () => {
      if (reducedMotion()) return
      gsap.fromTo(
        '.calc-answer-inner',
        { yPercent: 105, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.65, ease: 'expo.out' },
      )
    },
    { scope: root, dependencies: [revision], revertOnUpdate: true },
  )
  const solve = () => {
    try {
      const result = calculate(expression, mode)
      setAnswer(result)
      setError('')
      setRevision((value) => value + 1)
      setHistory((values) => [{ expression, result, mode }, ...values].slice(0, 8))
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Check the expression.')
    }
  }
  const append = (value: string) => {
    setExpression((previous) => previous + value)
    setError('')
    input.current?.focus({ preventScroll: true })
  }
  const press = contextSafe((button: HTMLButtonElement) => {
    if (!reducedMotion())
      gsap.fromTo(
        button,
        { scale: 0.92 },
        { scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.6)', overwrite: true },
      )
  })
  const keys = [
    'sin(',
    'cos(',
    'tan(',
    '(',
    ')',
    'ln(',
    'log(',
    'sqrt(',
    '^',
    '!',
    '7',
    '8',
    '9',
    '/',
    '⌫',
    '4',
    '5',
    '6',
    '*',
    'AC',
    '1',
    '2',
    '3',
    '-',
    '%',
    '0',
    '.',
    'pi',
    '+',
    '=',
  ]
  return (
    <div className="calculator-layout" ref={root}>
      <section className="calculator-machine" aria-label="Scientific calculator">
        <div className="calc-top">
          <span>SUM / Precision instrument</span>
          <button
            onClick={() => setMode((value) => (value === 'DEG' ? 'RAD' : 'DEG'))}
            aria-label="Change angle mode"
          >
            {mode} ↻
          </button>
        </div>
        <label className="sr-only" htmlFor="calculator-expression">
          Expression
        </label>
        <input
          ref={input}
          id="calculator-expression"
          className="calc-expression"
          value={expression}
          spellCheck={false}
          autoComplete="off"
          onChange={(event) => {
            setExpression(event.target.value)
            setError('')
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              solve()
            }
            if (event.key === 'Escape') {
              setExpression('')
              setError('')
            }
          }}
        />
        <div className="calc-answer" aria-label="Result">
          <span className="calc-answer-inner">{answer === null ? '—' : formatNumber(answer)}</span>
        </div>
        <p className="calc-error" role="alert">
          {error}
        </p>
        <div className="calc-memory">
          {['MC', 'MR', 'M+', 'M−'].map((key) => (
            <button
              key={key}
              onClick={() => {
                if (key === 'MC') setMemory(0)
                else if (key === 'MR') append(String(memory))
                else if (answer !== null) {
                  const next = key === 'M+' ? memory + answer : memory - answer
                  if (Number.isFinite(next)) setMemory(next)
                  else setError('Memory exceeds the finite number range.')
                }
              }}
            >
              {key}
            </button>
          ))}
          <span>Memory {formatNumber(memory)}</span>
        </div>
        <div className="calc-keypad">
          {keys.map((key) => (
            <button
              key={key}
              className={key === '=' ? 'calc-equals' : /^[0-9.]$/.test(key) ? 'calc-number' : ''}
              aria-label={
                key === '='
                  ? 'Calculate'
                  : key === '⌫'
                    ? 'Delete last character'
                    : key === 'AC'
                      ? 'Clear expression'
                      : key
              }
              onClick={(event) => {
                press(event.currentTarget)
                if (key === '=') solve()
                else if (key === 'AC') {
                  setExpression('')
                  setAnswer(null)
                  setError('')
                } else if (key === '⌫') setExpression((value) => value.slice(0, -1))
                else append(key)
              }}
            >
              {key === 'sqrt('
                ? '√'
                : key === '*'
                  ? '×'
                  : key === '/'
                    ? '÷'
                    : key === 'pi'
                      ? 'π'
                      : key.length > 1 && key.endsWith('(')
                        ? key.slice(0, -1)
                        : key}
            </button>
          ))}
        </div>
        <div className="calc-hint">
          Enter to calculate · Escape to clear · π, e, ^, ! supported. Results use floating-point
          precision.
        </div>
      </section>
      <aside className="calc-history">
        <div className="tool-panel-heading">
          <span>Recent calculations</span>
          <button onClick={() => setHistory([])}>Clear history</button>
        </div>
        {history.length ? (
          history.map((item, index) => (
            <button
              className="calc-history-item"
              key={index}
              onClick={() => {
                setExpression(item.expression)
                setMode(item.mode)
                setAnswer(item.result)
                setError('')
                setRevision((value) => value + 1)
              }}
            >
              <span>
                {item.expression} <small>{item.mode}</small>
              </span>
              <strong>= {formatNumber(item.result)}</strong>
            </button>
          ))
        ) : (
          <div className="calc-empty">
            <span>01 → ∞</span>
            <p>Your next idea starts with a number.</p>
            <small>Calculate something. Reuse it here.</small>
          </div>
        )}
        <p className="tool-small">
          History stays here while you use the calculator and clears when you leave. All
          calculations happen locally.
        </p>
      </aside>
    </div>
  )
}
