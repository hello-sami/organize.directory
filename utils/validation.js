// Shared client-side validation helpers.

/**
 * Validates an email address format.
 * Mirrors the spec the browser's `type="email"` uses, but stricter on TLDs.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
     if (!email) return false;
     const re =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
     return re.test(String(email).toLowerCase());
}
