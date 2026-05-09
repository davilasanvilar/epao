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

export const mapIRequestFormToIRequest = (form: IRequestForm): IRequest => {
  return {
    name: form.name.value,
    email: form.email.value,
    message: form.message.value,
  };
};
