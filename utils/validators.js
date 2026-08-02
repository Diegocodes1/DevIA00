export function validateEmail(email) {
  return /.+@.+\..+/.test(email);
}

export function validatePassword(password) {
  return password.length >= 6;
}
