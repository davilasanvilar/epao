import React from "react";
import { ContactForm } from "./ContactForm";

export const GeneralRequestForm: React.FC = () => {
  const handleSubmit = async (formData: FormData) => {
    const response = await fetch("/api/submit-request", {
      method: "POST",
      body: formData,
    });

    await response.json();

    if (!response.ok) {
      throw new Error("Submission failed");
    }

    handleClose();
  };

  const handleClose = () => {
    // Close the modal when cancelled
    const modal = document.getElementById("contact-modal") as HTMLDialogElement | null;
    if (modal) {
      modal.close();
    }
  };

  return <ContactForm onSubmit={handleSubmit} onClose={handleClose} />;
};
