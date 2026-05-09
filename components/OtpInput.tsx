'use client'

import { useRef, useState, useCallback, KeyboardEvent, ClipboardEvent } from 'react'

interface OtpInputProps {
  length?: number
  onComplete: (code: string) => void
  disabled?: boolean
}

export function OtpInput({ length = 6, onComplete, disabled = false }: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''))
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const focus = useCallback((i: number) => {
    refs.current[Math.max(0, Math.min(length - 1, i))]?.focus()
  }, [length])

  function handleChange(i: number, val: string) {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = digit
    setDigits(next)
    if (digit) {
      if (i < length - 1) focus(i + 1)
      if (next.every(d => d !== '')) onComplete(next.join(''))
    }
  }

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (digits[i]) {
        const next = [...digits]; next[i] = ''; setDigits(next)
      } else {
        focus(i - 1)
        const next = [...digits]; next[Math.max(0, i - 1)] = ''; setDigits(next)
      }
    } else if (e.key === 'ArrowLeft') { e.preventDefault(); focus(i - 1) }
    else if (e.key === 'ArrowRight') { e.preventDefault(); focus(i + 1) }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    const next = Array(length).fill('')
    for (let j = 0; j < pasted.length; j++) next[j] = pasted[j]
    setDigits(next)
    focus(Math.min(pasted.length, length - 1))
    if (pasted.length === length) onComplete(pasted)
  }

  return (
    <div className="flex gap-2 justify-center" role="group" aria-label="OTP input">
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i]}
          disabled={disabled}
          autoFocus={i === 0}
          aria-label={`OTP digit ${i + 1} of ${length}`}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          className={[
            'w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none',
            digits[i]
              ? 'bg-violet-50 border-[#422D83] text-[#422D83]'
              : 'bg-white border-gray-200 text-gray-900',
            'focus:border-[#422D83] focus:bg-violet-50/50',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
          ].filter(Boolean).join(' ')}
        />
      ))}
    </div>
  )
}
