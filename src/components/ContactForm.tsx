'use client'

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Arrow } from './Icons'
import { ContactAudio } from '@/lib/contact-audio'
import {
  CONTACT_EMAIL,
  CONTACT_TOPICS,
  EMPTY_INQUIRY,
  ATTACHMENT_ACCEPT,
  fileSize,
  validateInquiry,
  validateAttachmentList,
  type Inquiry,
  type InquiryErrors,
} from '@/lib/contact'
import './contact-form.css'

const steps = ['The idea', 'About you', 'The send-off']
const headings = ['What’s on your mind?', 'Who’s behind the idea?', 'One last look. Then, hello.']
gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function ContactForm() {
  const root = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const draftId = useRef('')
  const dragDepth = useRef(0)
  const audio = useRef<ContactAudio | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [step, setStep] = useState(0)
  const [inquiry, setInquiry] = useState<Inquiry>({ ...EMPTY_INQUIRY })
  const [errors, setErrors] = useState<InquiryErrors>({})
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState<'draft' | 'sending' | 'sent'>('draft')
  const [sendError, setSendError] = useState('')
  const [reference, setReference] = useState('')
  const [sentFiles, setSentFiles] = useState(0)

  useEffect(() => {
    const feedback = new ContactAudio()
    audio.current = feedback
    try {
      const enabled = localStorage.getItem('rayab-contact-sound') !== 'off'
      setSoundEnabled(enabled)
      feedback.setEnabled(enabled)
    } catch {
      /* Storage is optional. */
    }
    const pause = () => {
      if (document.hidden) feedback.pause()
    }
    document.addEventListener('visibilitychange', pause)
    return () => {
      document.removeEventListener('visibilitychange', pause)
      feedback.dispose()
      audio.current = null
    }
  }, [])

  function toggleSound() {
    const enabled = !soundEnabled
    setSoundEnabled(enabled)
    audio.current?.setEnabled(enabled)
    if (enabled && status === 'sending') audio.current?.arm()
    try {
      localStorage.setItem('rayab-contact-sound', enabled ? 'on' : 'off')
    } catch {
      /* Optional. */
    }
  }

  useEffect(() => {
    let frame = 0
    let previous = 0
    const observer = new ResizeObserver(([entry]) => {
      if (Math.abs(entry.contentRect.height - previous) < 1) return
      previous = entry.contentRect.height
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => ScrollTrigger.refresh())
    })
    if (root.current) observer.observe(root.current)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.fromTo(
        '.inquiry-panel',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
      )
      if (status === 'sent')
        gsap.fromTo(
          '.inquiry-stamp',
          { rotation: -18, scale: 1.15, opacity: 0 },
          { rotation: -8, scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.4)' },
        )
    },
    { scope: root, dependencies: [step, status === 'sent'], revertOnUpdate: true },
  )

  function focusHeading() {
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true })
      heading.current?.scrollIntoView({
        block: 'nearest',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      })
    })
  }

  function change(field: keyof Inquiry, value: string) {
    setInquiry((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setSendError('')
    draftId.current = ''
  }

  function validatePart(part: number) {
    const all = validateInquiry(inquiry)
    const fields =
      part === 0
        ? (['subject', 'message', 'topic'] as const)
        : (['name', 'email', 'company'] as const)
    const current = Object.fromEntries(
      fields.filter((field) => all[field]).map((field) => [field, all[field]]),
    ) as InquiryErrors
    setErrors(current)
    if (Object.keys(current).length) {
      requestAnimationFrame(() =>
        document.getElementById(`inquiry-${Object.keys(current)[0]}`)?.focus(),
      )
      return false
    }
    return true
  }

  function visit(part: number) {
    if (status !== 'draft') return
    if (part > step && !validatePart(step)) return
    if (part === 2 && !validatePart(1)) {
      setStep(1)
      return
    }
    setStep(part)
    setSendError('')
    focusHeading()
  }

  function addFiles(incoming: File[]) {
    const combined = [...files]
    for (const file of incoming)
      if (
        !combined.some(
          (existing) =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified === file.lastModified,
        )
      )
        combined.push(file)
    const issue = validateAttachmentList(combined)
    setErrors((current) => ({ ...current, attachments: issue || undefined }))
    if (!issue) {
      setFiles(combined)
      draftId.current = ''
      setSendError('')
    }
  }

  function chooseFiles(event: ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(event.target.files || []))
    event.target.value = ''
  }

  function drag(event: DragEvent, kind: 'enter' | 'leave' | 'over' | 'drop') {
    if (!event.dataTransfer.types.includes('Files')) return
    event.preventDefault()
    if (kind === 'enter') {
      dragDepth.current++
      setDragging(true)
    }
    if (kind === 'leave') {
      dragDepth.current--
      if (dragDepth.current <= 0) setDragging(false)
    }
    if (kind === 'drop') {
      dragDepth.current = 0
      setDragging(false)
      addFiles(Array.from(event.dataTransfer.files))
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status !== 'draft') return
    if (step < 2) {
      if (validatePart(step)) {
        setStep(step + 1)
        focusHeading()
      }
      return
    }
    const issue = validateInquiry(inquiry)
    if (Object.keys(issue).length) {
      setErrors(issue)
      setStep(issue.subject || issue.message || issue.topic ? 0 : 1)
      focusHeading()
      return
    }
    audio.current?.arm()
    const body = new FormData()
    for (const [key, value] of Object.entries(inquiry)) body.set(key, value)
    const trap = event.currentTarget.elements.namedItem('website') as HTMLInputElement | null
    body.set('website', trap?.value || '')
    if (!draftId.current) draftId.current = crypto.randomUUID()
    body.set('submissionId', draftId.current)
    files.forEach((file) => body.append('attachments', file))
    setStatus('sending')
    setSendError('')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 45000)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body,
        signal: controller.signal,
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || result?.ok !== true || typeof result.reference !== 'string') {
        if (result?.fields) {
          setErrors(result.fields)
          setStep(result.fields.subject || result.fields.message || result.fields.topic ? 0 : 1)
          focusHeading()
        }
        throw new Error(
          result?.message ||
            'That message didn’t go through. Your draft is still here—try again, or email me directly.',
        )
      }
      setReference(result.reference)
      setSentFiles(files.length)
      setFiles([])
      setStatus('sent')
      audio.current?.play('success')
      focusHeading()
    } catch (error) {
      setStatus('draft')
      setSendError(
        error instanceof Error && error.name !== 'AbortError'
          ? error.message
          : 'Sending took longer than expected. Your draft is still here—try again, or email me directly.',
      )
      audio.current?.play('error')
    } finally {
      clearTimeout(timeout)
    }
  }

  function reset() {
    setInquiry({ ...EMPTY_INQUIRY })
    setErrors({})
    setFiles([])
    setStatus('draft')
    setStep(0)
    setReference('')
    setSendError('')
    draftId.current = ''
    focusHeading()
  }

  return (
    <section
      id="inquiry"
      className={`inquiry${status === 'sent' ? ' is-sent' : ''}`}
      ref={root}
      aria-label="Send an inquiry"
    >
      <div className="inquiry-topline">
        <span className="eyebrow">Open line / A good place to begin</span>
        <div className="inquiry-feedback-controls">
          <button
            type="button"
            className="inquiry-sound-toggle"
            aria-label="Submission sounds"
            aria-pressed={soundEnabled}
            onClick={toggleSound}
            title={soundEnabled ? 'Mute submission sounds' : 'Enable submission sounds'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M11 5 6 9H3v6h3l5 4V5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              {soundEnabled ? (
                <path
                  d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="m16 9 6 6m0-6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              )}
            </svg>
            Sound {soundEnabled ? 'on' : 'off'}
          </button>
          <span className="inquiry-draft-state">
            <i aria-hidden="true" />
            {status === 'sent' ? 'Dispatched' : status === 'sending' ? 'Sending' : 'Your draft'}
          </span>
        </div>
      </div>
      <div className="inquiry-body">
        <aside className="inquiry-aside">
          <span className="inquiry-aside-title">
            A little
            <br />
            introduction.
            <Arrow />
          </span>
          <ol className="inquiry-steps" aria-label="Inquiry steps">
            {steps.map((label, index) => (
              <li key={label}>
                <button
                  type="button"
                  aria-current={status !== 'sent' && step === index ? 'step' : undefined}
                  onClick={() => visit(index)}
                  disabled={status !== 'draft'}
                >
                  <span>{status === 'sent' || step > index ? '✓' : `0${index + 1}`}</span>
                  {label}
                </button>
              </li>
            ))}
          </ol>
          <div className="inquiry-address">
            <span className="eyebrow">On the other side</span>
            <a href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
              <Arrow />
            </a>
            <span>
              Yusuff Ridwan Akanni
              <br />
              Nigeria ↗ Worldwide
            </span>
          </div>
          <span className="inquiry-big-number" aria-hidden="true">
            {status === 'sent' ? '↗' : `0${step + 1}`}
          </span>
        </aside>
        <div className="inquiry-content">
          {status === 'sent' ? (
            <div className="inquiry-panel inquiry-success">
              <span className="eyebrow inquiry-small-label">A new conversation has begun</span>
              <h3 ref={heading} tabIndex={-1}>
                Message
                <br />
                <span>sent.</span>
              </h3>
              <div className="inquiry-stamp" aria-hidden="true">
                <Arrow />
                <span>
                  OPEN LINE
                  <br />
                  DISPATCHED
                </span>
              </div>
              <p className="inquiry-live" role="status">
                Thanks, {inquiry.name.trim().split(/\s+/)[0]}. I’ll reply to{' '}
                <strong>{inquiry.email}</strong>.
              </p>
              <div className="inquiry-receipt">
                <span>
                  To <strong>{CONTACT_EMAIL}</strong>
                </span>
                <span>
                  Re <strong>{inquiry.subject}</strong>
                </span>
                {sentFiles > 0 && (
                  <span>
                    Enclosed{' '}
                    <strong>
                      {sentFiles} {sentFiles === 1 ? 'file' : 'files'}
                    </strong>
                  </span>
                )}
                <span className="inquiry-reference">
                  Ref. {reference.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <button type="button" className="inquiry-text-button" onClick={reset}>
                Start another conversation <span aria-hidden="true">↗</span>
              </button>
            </div>
          ) : (
            <form
              action="/api/contact"
              method="post"
              encType="multipart/form-data"
              onSubmit={submit}
              noValidate
              aria-busy={status === 'sending'}
              className="inquiry-form"
            >
              <div className="inquiry-trap" aria-hidden="true">
                <label htmlFor="inquiry-website">Leave this field empty</label>
                <input
                  type="text"
                  id="inquiry-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              <div className="inquiry-panel" key={step}>
                <span className="eyebrow inquiry-small-label">
                  0{step + 1} / {steps[step]}
                </span>
                <h3 ref={heading} tabIndex={-1}>
                  {headings[step]}
                </h3>
                {step === 0 && (
                  <>
                    <fieldset className="inquiry-topics" id="inquiry-topic">
                      <legend>
                        What are we thinking about? <span>(optional)</span>
                      </legend>
                      <div>
                        {CONTACT_TOPICS.map((topic) => (
                          <button
                            type="button"
                            key={topic}
                            aria-pressed={inquiry.topic === topic}
                            onClick={() => change('topic', inquiry.topic === topic ? '' : topic)}
                          >
                            <span aria-hidden="true">{inquiry.topic === topic ? '↗' : '+'}</span>
                            {topic}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <div className="inquiry-field">
                      <label htmlFor="inquiry-subject">
                        Give it a name <span>/ Subject</span>
                      </label>
                      <input
                        id="inquiry-subject"
                        name="subject"
                        value={inquiry.subject}
                        onChange={(event) => change('subject', event.target.value)}
                        maxLength={120}
                        required
                        placeholder="A new idea. A big question. A simple hello."
                        aria-invalid={!!errors.subject}
                        aria-describedby={errors.subject ? 'inquiry-subject-error' : undefined}
                      />
                      {errors.subject && (
                        <span className="inquiry-field-error" id="inquiry-subject-error">
                          {errors.subject}
                        </span>
                      )}
                    </div>
                    <div className="inquiry-field">
                      <label htmlFor="inquiry-message">
                        Tell me a little more <span>/ Message</span>
                      </label>
                      <textarea
                        id="inquiry-message"
                        name="message"
                        value={inquiry.message}
                        onChange={(event) => change('message', event.target.value)}
                        maxLength={6000}
                        minLength={10}
                        required
                        rows={4}
                        placeholder="What do you have in mind? Where are you now, and where would you like to go?"
                        aria-invalid={!!errors.message}
                        aria-describedby={
                          errors.message ? 'inquiry-message-error' : 'inquiry-message-count'
                        }
                      />
                      <div className="inquiry-field-bottom">
                        {errors.message ? (
                          <span className="inquiry-field-error" id="inquiry-message-error">
                            {errors.message}
                          </span>
                        ) : (
                          <span>Rough ideas welcome.</span>
                        )}
                        <span id="inquiry-message-count">
                          {inquiry.message.length.toLocaleString()} / 6,000
                        </span>
                      </div>
                    </div>
                  </>
                )}
                {step === 1 && (
                  <>
                    <div className="inquiry-field-row">
                      <div className="inquiry-field">
                        <label htmlFor="inquiry-name">Your name</label>
                        <input
                          id="inquiry-name"
                          name="name"
                          autoComplete="name"
                          value={inquiry.name}
                          onChange={(event) => change('name', event.target.value)}
                          maxLength={80}
                          required
                          placeholder="The name behind the idea"
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? 'inquiry-name-error' : undefined}
                        />
                        {errors.name && (
                          <span className="inquiry-field-error" id="inquiry-name-error">
                            {errors.name}
                          </span>
                        )}
                      </div>
                      <div className="inquiry-field">
                        <label htmlFor="inquiry-email">Your email</label>
                        <input
                          id="inquiry-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          inputMode="email"
                          value={inquiry.email}
                          onChange={(event) => change('email', event.target.value)}
                          maxLength={254}
                          required
                          placeholder="Somewhere I can write back"
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? 'inquiry-email-error' : undefined}
                        />
                        {errors.email && (
                          <span className="inquiry-field-error" id="inquiry-email-error">
                            {errors.email}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="inquiry-field">
                      <label htmlFor="inquiry-company">
                        Company or studio <span>/ Optional</span>
                      </label>
                      <input
                        id="inquiry-company"
                        name="company"
                        autoComplete="organization"
                        value={inquiry.company}
                        onChange={(event) => change('company', event.target.value)}
                        maxLength={100}
                        placeholder="Independent is a good answer, too."
                        aria-invalid={!!errors.company}
                        aria-describedby={errors.company ? 'inquiry-company-error' : undefined}
                      />
                      {errors.company && (
                        <span className="inquiry-field-error" id="inquiry-company-error">
                          {errors.company}
                        </span>
                      )}
                    </div>
                    <div
                      className={`inquiry-dropzone${dragging ? ' is-dragging' : ''}`}
                      onDragEnter={(event) => drag(event, 'enter')}
                      onDragLeave={(event) => drag(event, 'leave')}
                      onDragOver={(event) => drag(event, 'over')}
                      onDrop={(event) => drag(event, 'drop')}
                    >
                      <input
                        type="file"
                        ref={fileInput}
                        accept={ATTACHMENT_ACCEPT}
                        multiple
                        onChange={chooseFiles}
                        tabIndex={-1}
                        className="inquiry-file-input"
                        aria-label="Select inquiry attachments"
                      />
                      <button
                        type="button"
                        id="inquiry-attachments"
                        onClick={() => fileInput.current?.click()}
                        aria-describedby={
                          errors.attachments
                            ? 'inquiry-file-hint inquiry-attachments-error'
                            : 'inquiry-file-hint'
                        }
                      >
                        <span className="inquiry-paperclip" aria-hidden="true">
                          ↳
                        </span>
                        <span>
                          {dragging
                            ? 'Drop your references here'
                            : 'A brief, a reference, a little context.'}
                          <span>
                            Drop files here, or choose files <span aria-hidden="true">↗</span>
                          </span>
                        </span>
                        <span className="inquiry-file-plus" aria-hidden="true">
                          +
                        </span>
                      </button>
                      <p id="inquiry-file-hint">
                        Optional · PDF, JPG, PNG, WebP, TXT · 3 files · 2 MB each / 3 MB total
                      </p>
                    </div>
                    {errors.attachments && (
                      <p
                        className="inquiry-field-error"
                        id="inquiry-attachments-error"
                        role="alert"
                      >
                        {errors.attachments}
                      </p>
                    )}
                    {files.length > 0 && (
                      <ul className="inquiry-files" aria-label="Selected attachments">
                        {files.map((file, index) => (
                          <li key={`${file.name}-${index}`}>
                            <span className="inquiry-file-ext">{file.name.split('.').pop()}</span>
                            <span className="inquiry-file-name">
                              {file.name}
                              <small>{fileSize(file.size)}</small>
                            </span>
                            <button
                              type="button"
                              aria-label={`Remove ${file.name}`}
                              onClick={() => {
                                setFiles((current) => current.filter((_, i) => i !== index))
                                setErrors((current) => ({ ...current, attachments: undefined }))
                                draftId.current = ''
                              }}
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
                {step === 2 && (
                  <div className="inquiry-letter">
                    <div className="inquiry-letter-route">
                      <span>
                        From{' '}
                        <strong>
                          {inquiry.name}
                          {inquiry.company ? ` / ${inquiry.company}` : ''}
                        </strong>
                        <small>{inquiry.email}</small>
                      </span>
                      <Arrow />
                      <span>
                        To <strong>Yusuff Ridwan Akanni</strong>
                        <small>{CONTACT_EMAIL}</small>
                      </span>
                    </div>
                    <div className="inquiry-letter-subject">
                      <span className="eyebrow">{inquiry.topic || 'A new conversation'}</span>
                      <h4>{inquiry.subject}</h4>
                    </div>
                    <p
                      className="inquiry-letter-message"
                      tabIndex={0}
                      aria-label="Message preview"
                      data-lenis-prevent
                    >
                      {inquiry.message}
                    </p>
                    {files.length > 0 && (
                      <div className="inquiry-enclosures">
                        <span>Enclosed</span>
                        {files.map((file, index) => (
                          <span key={index}>↳ {file.name}</span>
                        ))}
                      </div>
                    )}
                    <div className="inquiry-letter-signoff">
                      Good things start with a conversation.<span aria-hidden="true">↗</span>
                    </div>
                  </div>
                )}
              </div>
              {sendError && (
                <div className="inquiry-send-error" role="alert">
                  <p>{sendError}</p>
                  <a href={`mailto:${CONTACT_EMAIL}`}>
                    Email me directly <Arrow />
                  </a>
                </div>
              )}
              <div className="inquiry-form-foot">
                <div>
                  {step > 0 ? (
                    <button
                      type="button"
                      className="inquiry-back"
                      onClick={() => visit(step - 1)}
                      disabled={status === 'sending'}
                    >
                      <span aria-hidden="true">←</span>{' '}
                      {step === 2 ? 'Back to details' : 'Back to the idea'}
                    </button>
                  ) : (
                    <span className="inquiry-foot-note">An idea is enough to start.</span>
                  )}
                </div>
                <button
                  type="submit"
                  className={`inquiry-continue${status === 'sending' ? ' is-sending' : ''}`}
                  disabled={status === 'sending'}
                >
                  {status === 'sending'
                    ? 'Sending your message'
                    : step === 2
                      ? 'Send message'
                      : step === 1
                        ? 'Review your message'
                        : 'A little about you'}
                  <Arrow />
                </button>
              </div>
              <p className="inquiry-send-note">
                {step === 2
                  ? 'Your message goes to my inbox. I’ll reply to the email you shared.'
                  : 'Just a conversation. No mailing lists.'}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
