import { Email } from './Email';
import { Password } from './Password';

export interface LoginCredentialsProps {
  email: Email;
  password: Password;
}

export class LoginCredentials {
  private readonly _email: Email;
  private readonly _password: Password;

  private constructor(props: LoginCredentialsProps) {
    this._email = props.email;
    this._password = props.password;
  }

  static create(props: LoginCredentialsProps): LoginCredentials {
    return new LoginCredentials(props);
  }

  get email(): Email {
    return this._email;
  }

  get password(): Password {
    return this._password;
  }

  equals(other: LoginCredentials): boolean {
    return this._email.equals(other._email) && this._password.equals(other._password);
  }

  toJSON() {
    return {
      email: this._email.toString(),
      password: this._password.toString()
    };
  }

  toString(): string {
    return `LoginCredentials(email=${this._email.toString()})`;
  }
} 