import React from "react";
import { ContactForm } from "./ContactForm";
import type { IRequest } from "../../types/contact";

export const GeneralRequestForm: React.FC = () => {
  const handleSubmit = async (data: IRequest) => {
    // Simulate API call
    await new Promise((resolve, reject) => setTimeout(resolve, 2000));
    console.log("Submitted!", data);

    // Close the modal after successful submission
    const modal = document.getElementById(
      "contact-modal",
    ) as HTMLDialogElement | null;
    if (modal) {
      modal.close();
    }
  };

  const handleCancel = () => {
    // Close the modal when cancelled
    const modal = document.getElementById(
      "contact-modal",
    ) as HTMLDialogElement | null;
    if (modal) {
      modal.close();
    }
  };

  return <ContactForm onSubmit={handleSubmit} onCancel={handleCancel} />;
};
