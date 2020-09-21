/**
 * @module utils
 * @description 工具包
 */

import { createHashHistory } from 'history';
import { debounce as originDebounce } from 'throttle-debounce';

// history
export const history = createHashHistory();

/**
 * @function typpy
 * @description Gets the type of the input value or compares it with a provided type
 * @param {any} input The input value
 * @param {Function} target The target type
 * @returns {boolean}
 */
export function typpy(input, target) {
  // If input is NaN, use special check
  if (input !== input) return target !== target;

  // Null
  if (null === input) return target === null;

  // Undefined
  if (undefined === input) return target === undefined;

  // Other
  return input.constructor === target;
}

/**
 * @function getLocationOrigin
 * @returns {string}
 */
export function getLocationOrigin() {
  return window.location.origin || `${window.location.protocol}//${window.location.hostname}`;
}

/**
 * @function formatThousands
 * @param {number} number
 * @param {number} fixed
 * @returns {string}
 */
export function formatThousands(number, fixed = 2) {
  number = Number(number) || 0;

  if (window.Intl) {
    return new window.Intl.NumberFormat('en-us', {
      minimumFractionDigits: fixed,
      maximumFractionDigits: fixed
    }).format(number);
  }

  const parts = String(Number(number).toFixed(fixed)).split('.');

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
}

/**
 * @function createMarkup
 * @param {string} html
 * @returns {Object}
 */
export function createMarkup(html) {
  return { __html: html };
}

/**
 * @function debounce
 * @description debounce decorator
 * @param {number} delay
 */
export function debounce(delay, atBegin = false) {
  return function debounce(target, name, descriptor) {
    const { initializer } = descriptor;

    if (initializer) {
      descriptor.initializer = function() {
        const value = initializer.call(this);

        return originDebounce(delay, atBegin, value);
      };
    } else {
      const { value } = descriptor;

      descriptor.value = originDebounce(delay, atBegin, value);
    }

    return descriptor;
  };
}

const URL_RE = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export function isURL(path) {
  return URL_RE.test(path);
}

export function redirect(url) {
  return (window.location.hash = url);
}

export function postMessage(message) {
  return window.postMessage(message, getLocationOrigin());
}

export const store = {
  has(key) {
    return self.localStorage.hasOwnProperty(key);
  },
  set(key, value) {
    return self.localStorage.setItem(key, value);
  },
  get(key) {
    return self.localStorage.getItem(key);
  },
  remove(key) {
    return self.localStorage.removeItem(key);
  }
};

export function encrypt(value) {
  return self.btoa(unescape(encodeURIComponent(value)));
}

export function decrypt(value) {
  try {
    return decodeURIComponent(escape(self.atob(value)));
  } catch (error) {
    return '';
  }
}

// /**
//  * @function LCGRandom
//  * @param {number} seed
//  * @returns {number}
//  * @see https://gist.github.com/Protonk/5389384
//  */
// export function LCGRandom(seed = 0) {
//   return ((seed * 11 + 17) % 25) / 25;
// }

/**
 * @function LCGRandom
 * @param {number} seed
 * @returns {number}
 * @see https://www.zhihu.com/question/22818104
 */
function LCGRandom(seed = 0) {
  return ((seed * 9301 + 49297) % 233280) / 233280;
}

/**
 * @function getUserAvatar
 * @param {any} user
 * @returns {number}
 */
export function getUserAvatar(user) {
  if (!user) return 0;

  const seed = Array.from(user).reduce((acc, cur) => acc + cur.charCodeAt(), 0);

  return Math.floor(LCGRandom(seed) * 200);
}
