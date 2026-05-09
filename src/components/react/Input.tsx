import React from 'react';
import styles from './Input.module.css';

interface InputProps {
  id: string;
  placeholder?: string;
  label?: string;
  textarea?: boolean;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const Input: React.FC<InputProps> = ({ id, placeholder, label, textarea, value, error, onChange }) => {
  return (
    <div className={styles.inputGroup}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      {textarea ? (
        <textarea
          id={id}
          placeholder={placeholder}
          className={`${styles.textarea} ${error ? styles.error : ''}`}
          value={value}
          onChange={onChange}
        />
      ) : (
        <input
          type="text"
          id={id}
          placeholder={placeholder}
          className={`${styles.input} ${error ? styles.error : ''}`}
          value={value}
          onChange={onChange}
        />
      )}
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};
