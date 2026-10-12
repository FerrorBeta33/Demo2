/* eslint-disable jsx-a11y/label-has-associated-control */
import { FormEvent, useState } from 'react';

type Operation = 'add' | 'subtract' | 'multiply' | 'divide';
type SubmissionStatus = 'idle' | 'submitting' | 'success';

type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

const operationLabels: Record<Operation, string> = {
  add: 'Addition (+)',
  subtract: 'Subtraction (−)',
  multiply: 'Multiplication (×)',
  divide: 'Division (÷)',
};

export function calculate(left: number, right: number, operation: Operation): number {
  if (operation === 'add') return left + right;
  if (operation === 'subtract') return left - right;
  if (operation === 'multiply') return left * right;
  if (right === 0) throw new Error('Division by zero is not allowed.');
  return left / right;
}

export function mockSubmitContact(data: ContactFormData): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(), 250);
  });
}

function CalculatorPage() {
  const [leftInput, setLeftInput] = useState('');
  const [rightInput, setRightInput] = useState('');
  const [operation, setOperation] = useState<Operation>('add');
  const [result, setResult] = useState<number | null>(null);
  const [calculationError, setCalculationError] = useState('');
  const [contact, setContact] = useState<ContactFormData>({ name: '', email: '', phone: '', message: '' });
  const [emailError, setEmailError] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');

  const handleCalculate = () => {
    const left = Number(leftInput);
    const right = Number(rightInput);

    if (leftInput.trim() === '' || rightInput.trim() === '' || !Number.isFinite(left) || !Number.isFinite(right)) {
      setResult(null);
      setCalculationError('Enter two valid numbers to calculate a result.');
      return;
    }

    try {
      setResult(calculate(left, right, operation));
      setCalculationError('');
    } catch (error) {
      setResult(null);
      setCalculationError(error instanceof Error ? error.message : 'Unable to calculate this result.');
    }
  };

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email);

    if (!emailIsValid) {
      setEmailError('Enter a valid email address before submitting.');
      setSubmissionStatus('idle');
      return;
    }

    setEmailError('');
    setSubmissionStatus('submitting');
    await mockSubmitContact(contact);
    setSubmissionStatus('success');
  };

  return (
    <main className="calculator-layout">
      <section className="calculator-panel" aria-labelledby="calculator-title">
        <div className="section-heading">
          <p className="eyebrow">Quick calculation</p>
          <h1 id="calculator-title">Make the numbers clear.</h1>
          <p className="section-copy">
            Run a simple calculation, then leave a note if you want to continue the conversation.
          </p>
        </div>

        <div className="calculator-form">
          <div className="number-field">
            <label htmlFor="left-number">First number</label>
            <input
              id="left-number"
              inputMode="decimal"
              type="number"
              value={leftInput}
              onChange={(event) => setLeftInput(event.target.value)}
            />
          </div>

          <div className="operation-field">
            <label htmlFor="operation">Operation</label>
            <select
              id="operation"
              value={operation}
              onChange={(event) => setOperation(event.target.value as Operation)}
            >
              {Object.entries(operationLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="number-field">
            <label htmlFor="right-number">Second number</label>
            <input
              id="right-number"
              inputMode="decimal"
              type="number"
              value={rightInput}
              onChange={(event) => setRightInput(event.target.value)}
            />
          </div>
        </div>

        <button className="primary-button" type="button" onClick={handleCalculate}>
          Calculate result
        </button>

        <div className={`result-panel${result === null ? ' result-panel-empty' : ''}`} aria-live="polite">
          <span className="result-label">Result</span>
          {result === null ? <strong>Waiting for your inputs</strong> : <strong>{result}</strong>}
        </div>

        {calculationError && (
          <p className="error-message" role="alert">
            {calculationError}
          </p>
        )}
      </section>

      <section className="contact-panel" aria-labelledby="contact-title">
        <div className="section-heading">
          <p className="eyebrow">Next step</p>
          <h2 id="contact-title">Stay in touch</h2>
          <p className="section-copy">This demo uses mock submission behavior. Your details are not sent or stored.</p>
        </div>

        <form className="contact-form" onSubmit={handleContactSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="contact-name">Name</label>
            <input
              id="contact-name"
              type="text"
              value={contact.name}
              onChange={(event) => setContact({ ...contact, name: event.target.value })}
            />
          </div>
          <div className="form-field">
            <label htmlFor="contact-email">Email</label>
            <input
              id="contact-email"
              type="email"
              value={contact.email}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? 'contact-email-error' : undefined}
              onChange={(event) => {
                setContact({ ...contact, email: event.target.value });
                setEmailError('');
                setSubmissionStatus('idle');
              }}
            />
            {emailError && (
              <span className="error-message" id="contact-email-error" role="alert">
                {emailError}
              </span>
            )}
          </div>
          <div className="form-field">
            <label htmlFor="contact-phone">Phone</label>
            <input
              id="contact-phone"
              type="tel"
              value={contact.phone}
              onChange={(event) => setContact({ ...contact, phone: event.target.value })}
            />
          </div>
          <div className="form-field">
            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              value={contact.message}
              onChange={(event) => setContact({ ...contact, message: event.target.value })}
            />
          </div>
          <button className="primary-button" type="submit" disabled={submissionStatus === 'submitting'}>
            {submissionStatus === 'submitting' ? 'Sending mock submission…' : 'Send message'}
          </button>
          <p className="form-status" aria-live="polite" role="status">
            {submissionStatus === 'success' ? 'Thanks — your mock submission was successful.' : ''}
          </p>
        </form>
      </section>
    </main>
  );
}

export default CalculatorPage;
