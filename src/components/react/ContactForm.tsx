import React, { useState } from "react";
import { Input } from "./Input";
import { type IRequestForm, mapIRequestFormToFormData } from "../../types/contact";
import { showSnackbar } from "../../utils/snackbar";
import styles from "./ContactForm.module.css";
import { Turnstile } from "@marsidev/react-turnstile";

interface ContactFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  onClose: () => void;
}

const initialFormState: IRequestForm = {
  name: { value: "", error: "" },
  email: { value: "", error: "" },
  message: { value: "", error: "" },
  token: "",
};

export const ContactForm: React.FC<ContactFormProps> = ({
  onSubmit,
  onClose,
}: ContactFormProps) => {
  const [form, setForm] = useState<IRequestForm>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [hideTurnstile, setHideTurnstile] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (field: keyof IRequestForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: { value, error: "" },
    }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    let isValid = true;
    const newForm = { ...form };

    // Validate Name
    if (!newForm.name.value.trim()) {
      newForm.name.error = "Name is required";
      isValid = false;
    }

    // Validate Email
    if (!newForm.email.value.trim()) {
      newForm.email.error = "Email is required";
      isValid = false;
    } else if (!validateEmail(newForm.email.value)) {
      newForm.email.error = "Invalid email format";
      isValid = false;
    }

    // Validate Message
    if (!newForm.message.value.trim()) {
      newForm.message.error = "Message is required";
      isValid = false;
    }

    setForm(newForm);

    if (!isValid) return;

    setLoading(true);
    const requestData = mapIRequestFormToFormData(newForm);

    try {
      await onSubmit(requestData);
      showSnackbar("Your request has been received", "success");
      setForm(initialFormState); // Reset on success if needed
    } catch (error) {
      showSnackbar("We could not send your request, try again", "error");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = Object.values(form).every(
    (field) => !field.error && field.value.trim() !== "",
  );

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Input
        id="name"
        label="Name"
        placeholder="Name"
        value={form.name.value}
        error={form.name.error}
        onChange={(e) => handleChange("name", e.target.value)}
      />
      <Input
        id="email"
        label="Email"
        placeholder="Email"
        value={form.email.value}
        error={form.email.error}
        onChange={(e) => handleChange("email", e.target.value)}
      />
      <Input
        id="message"
        label="Message"
        placeholder="Message"
        textarea
        value={form.message.value}
        error={form.message.error}
        onChange={(e) => handleChange("message", e.target.value)}
      />

      <div className={styles.turnstileWrapper + (hideTurnstile ? " " + styles.hideTurnstile : "")}>
        <Turnstile
          style={{ margin: "0 auto", borderRadius: "12px" }}
          siteKey="0x4AAAAAADMOOW5NVkZ5sokj"
          onSuccess={(token) => {
            setHideTurnstile(true);
            setForm((prev) => ({ ...prev, token }));
          }}
        />
      </div>

      <div className={styles.buttonContainer}>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonOutline}`}
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`${styles.button} ${styles.buttonPrimary}`}
          disabled={loading || !isFormValid}
        >
          {loading ? (
            <svg
              className={styles.spinner}
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M10 14l11 -11" />
              <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
            </svg>
          )}
          Send
        </button>
      </div>
    </form>
  );
};
