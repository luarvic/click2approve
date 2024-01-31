export interface IUserAccount {
  username: string;
  password: string;
  passwordConfirmation: string;
  token: string;
}

export class UserAccount implements IUserAccount {
  username: string;
  password: string;
  passwordConfirmation: string;
  token: string;

  constructor(
    username: string = "",
    password: string = "",
    passwordConfirmation: string = "",
    token: string = ""
  ) {
    this.username = username;
    this.password = password;
    this.passwordConfirmation = passwordConfirmation;
    this.token = token;
  }
}
