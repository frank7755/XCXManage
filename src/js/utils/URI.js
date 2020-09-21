/**
 * @module URI
 * @license MIT
 * @version 2018/03/28
 */

// Undefined
const UNDEFINED = void 0;
// Parse query regex
const PARSE_QUERY_REGEX = /(?:^|&)([^&=]*)(?:=([^&]*))?/g;
// Parse WHATWG URI regex
//
//     1.protocol                 2.user     3.pass     4.hostname         5.port      6.pathname 7.search 8.hash
//          |                       |           |            |                |              |       |       |
//   ---------------             --------    -------     ----------    ---------------   ----------------- -----
// /^([a-z0-9.+-]+:)?(?:\/\/)?(?:([^/:]*)(?::([^/]*))?@)?([^:?#/]*)(?::(\d*(?=$|[?#/])))?([^?#]*)(\?[^#]*)?(#.*)?/i
const WHATWG_URI_REGEX = /^([a-z0-9.+-]+:)?(?:\/\/)?(?:([^/:]*)(?::([^/]*))?@)?([^:?#/]*)(?::(\d*(?=$|[?#/])))?([^?#]*)(\?[^#]*)?(#.*)?/i;

/**
 * @function normalize
 * @param {string} value
 * @returns {string|null}
 */
function normalize(value) {
  if (value === UNDEFINED) return null;

  return value;
}

/**
 * @function isNotNull
 * @param {string|null} value
 * @returns {boolean}
 */
function isNotNull(value) {
  return value != null;
}

/**
 * @function encode
 * @param {string|null} value
 * @returns {string|null}
 */
function encode(value) {
  if (!value) return value;

  return encodeURIComponent(value);
}

/**
 * @function decode
 * @param {string|null} value
 * @returns {string|null}
 */
function decode(value) {
  if (!value) return value;

  return decodeURIComponent(value);
}

/**
 * @function parse
 * @param {string} search
 * @returns {Object}
 */
export function parse(search) {
  const query = {};

  if (!search) return query;

  search = search.replace(/^[?#]/, '');

  if (search) {
    while (true) {
      const matched = PARSE_QUERY_REGEX.exec(search);

      if (matched) {
        const key = decode(matched[1] || '');
        const value = decode(normalize(matched[2]));

        if (query.hasOwnProperty(key)) {
          if (!Array.isArray(query[key])) {
            query[key] = [query[key]];
          }

          query[key].push(value);
        } else {
          query[key] = value;
        }
      } else {
        break;
      }
    }
  }

  return query;
}

/**
 * @function stringify
 * @param {Object} param
 * @param {string} prefix
 * @returns {string}
 */
export function stringify(query, prefix = '') {
  let search = '';

  if (!query) return search;

  for (let key in query) {
    if (query.hasOwnProperty(key)) {
      const value = query[key];

      // Encode key
      key = encode(key);

      if (Array.isArray(value)) {
        value.forEach(item => {
          search += '&' + key;

          if (isNotNull(item)) {
            search += '=' + encode(item);
          }
        });
      } else {
        search += '&' + key;

        if (isNotNull(value)) {
          search += '=' + encode(value);
        }
      }
    }
  }

  return search.replace(/^&/, prefix);
}

/**
 * @class URI
 */
export default class URI {
  /**
   * @constructor
   * @param {string} URI
   */
  constructor(URI) {
    const context = this;
    const matched = WHATWG_URI_REGEX.exec(URI);

    // Normalize URI
    if (!matched) {
      throw Error('URI not a standard WHATWG URI.');
    }

    const [
      ,
      // Matched
      protocol,
      username,
      password,
      hostname,
      port,
      pathname,
      search,
      hash
    ] = matched;

    context.protocol = normalize(protocol);
    context.username = normalize(username);
    context.password = normalize(password);
    context.hostname = normalize(hostname);
    context.port = normalize(port);
    context.pathname = normalize(pathname);

    context.query = parse(search);
    context.fragment = parse(hash);
  }

  /**
   * @property search
   * @method get
   * @returns {string}
   */
  get search() {
    return stringify(this.query, '?');
  }

  /**
   * @property hash
   * @method get
   * @returns {string}
   */
  get hash() {
    return stringify(this.fragment, '#');
  }

  /**
   * @method toURI
   * @returns {string}
   */
  toURI() {
    let URI = '';
    const context = this;
    const protocol = context.protocol;
    const username = context.username;
    const password = context.password;
    const hostname = context.hostname;
    const port = context.port;

    if (isNotNull(protocol)) {
      URI += protocol;
    }

    if (isNotNull(protocol)) {
      URI += '//';
    }

    if (isNotNull(username)) {
      URI += username;
    }

    if (isNotNull(password)) {
      URI += ':' + password;
    }

    if (isNotNull(username) || isNotNull(password)) {
      URI += '@';
    }

    if (isNotNull(hostname)) {
      URI += hostname;
    }

    if (isNotNull(port)) {
      URI += ':' + port;
    }

    URI += context.pathname + context.search + context.hash;

    return URI;
  }

  /**
   * @method toString
   * @returns {string}
   */
  toString() {
    return this.toURI();
  }
}
