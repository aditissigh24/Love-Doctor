'use client';

import { useState, useRef } from 'react';
import styles from './styles/LeadCapture.module.css';
import { trackClientEvent, getDistinctId } from '@/services/mixpanel-client';
import { MIXPANEL_EVENTS } from '@/config/mixpanel';

export default function LeadCapture() {
  const [formData, setFormData] = useState({
    situation: '',
    name: '',
    ageRange: '',
    gender: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formStartTime = useRef<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Calculate form completion time
    const formCompletionTime = formStartTime.current 
      ? Math.round((Date.now() - formStartTime.current) / 1000)
      : undefined;
    
    try {
      // Submit to API
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          formCompletionTime,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit form');
      }
      
      const data = await response.json();
      
      console.log('Form submitted:', data);
      setIsSubmitted(true);
      
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          situation: '',
          name: '',
          ageRange: '',
          gender: '',
        });
        formStartTime.current = null;
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Track error
      trackClientEvent(MIXPANEL_EVENTS.FORM_ERROR, {
        error_type: 'submission_failed',
        field_name: 'form',
      });
      
      alert('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFocus = (fieldName: string, fieldType: string) => {
    // Track form start time on first field focus
    if (!formStartTime.current) {
      formStartTime.current = Date.now();
    }
    
    // Track field focus
    trackClientEvent(MIXPANEL_EVENTS.FORM_FIELD_FOCUS, {
      field_name: fieldName,
      field_type: fieldType,
    });
  };

  return (
    <section className={styles.leadCapture}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Get your situation <span className={styles.gradientText}>decoded</span>
          </h2>
          <p className={styles.subtitle}>
            Share what&apos;s happening. We&apos;ll match you with someone who gets it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.badges}>
            <span className={styles.badge}>🔒 100% confidential</span>
            <span className={styles.badge}>⚡ Non-judgmental</span>
            <span className={styles.badge}>💜 Just Clarity</span>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="situation" className={styles.label}>
              What&apos;s happening? *
            </label>
            <textarea
              id="situation"
              name="situation"
              value={formData.situation}
              onChange={handleChange}
              onFocus={() => handleFocus('situation', 'textarea')}
              required
              rows={5}
              placeholder="Tell us about your love life. No need to be a writer here. Just share."
              className={styles.textarea}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Your first name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => handleFocus('name', 'text')}
                required
                placeholder="e.g., Priya"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="ageRange" className={styles.label}>
                Age range *
              </label>
              <select
                id="ageRange"
                name="ageRange"
                value={formData.ageRange}
                onChange={handleChange}
                onFocus={() => handleFocus('ageRange', 'select')}
                required
                className={styles.select}
              >
                <option value="">Select age</option>
                <option value="18-24">18-24</option>
                <option value="25-29">25-29</option>
                <option value="30-34">30-34</option>
                <option value="35-39">35-39</option>
                <option value="40+">40+</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Gender *</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                  required
                  className={styles.radio}
                />
                <span>Male</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                  required
                  className={styles.radio}
                />
                <span>Female</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="gender"
                  value="other"
                  checked={formData.gender === 'other'}
                  onChange={handleChange}
                  required
                  className={styles.radio}
                />
                <span>Other</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitted || isSubmitting}
          >
            {isSubmitted ? '✓ Submitted!' : isSubmitting ? 'Submitting...' : 'Decode My Situation'}
          </button>

          <p className={styles.disclaimer}>
            Completely confidential. No spam or calls. Promise.
          </p>
        </form>
      </div>
    </section>
  );
}

