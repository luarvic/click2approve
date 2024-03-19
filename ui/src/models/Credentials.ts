export interface ICredentials {
  email: string;
  password: string;
  passwordConfirmation: string | undefined;
}

export class Credentials implements ICredentials {
  email: string;
  password: string;
  passwordConfirmation: string | undefined;

  constructor(
    email: string,
    password: string,
    passwordConfirmation: string | undefined = undefined
  ) {
    this.email = email;
    this.password = password;
    this.passwordConfirmation = passwordConfirmation;
  }
}
