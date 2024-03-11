export interface IUserAccount {
  email: string;
  password: string;
  passwordConfirmation: string;
  token: string;
}

export class UserAccount implements IUserAccount {
  email: string;
  password: string;
  passwordConfirmation: string;
  token: string;

  constructor(
    email: string = "",
    password: string = "",
    passwordConfirmation: string = "",
    token: string = ""
  ) {
    this.email = email;
    this.password = password;
    this.passwordConfirmation = passwordConfirmation;
    this.token = token;
  }
}
