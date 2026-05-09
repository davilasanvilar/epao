export type formFields = {
  value: string;
  error: string;
};

export interface IRequestForm {
  name: formFields;
  email: formFields;
  message: formFields;
}

export interface IRequest {
  name: string;
  email: string;
  message: string;
}

export const mapIRequestFormToFormData = (form: IRequestForm): FormData => {
  const formData = new FormData();
  formData.append("name", form.name.value);
  formData.append("email", form.email.value);
  formData.append("message", form.message.value);
  return formData;
};
