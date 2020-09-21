/**
 * @module request
 * @description 站点异步请求函数
 */

import { message } from 'antd';
import { history } from '~js/utils/utils';
import URI, { stringify } from '~js/utils/URI';

const STATUS_TEXT = {
  401: '未经授权',
  403: '无权操作',
  404: '接口未找到',
  500: '服务器错误',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时'
};

/**
 * @function jsonType
 * @param {string} type
 * @returns {boolean}
 */
function jsonType(type) {
  return type && /^application\/json(?:;|$)/i.test(type);
}

/**
 * @function unauthorized
 * @returns {string}
 */
function unauthorized() {
  return history.push('/login');
}

/**
 * @function jsonParser
 * @param {Response} response
 * @param {boolean} notify
 * @returns {Promise}
 */
function jsonParser(response, notify) {
  return response
    .json()
    .catch(error => {
      error.code = response.status;
      error.message = '数据解析失败';

      throw error;
    })
    .then(json => {
      switch (json.code) {
        case 200:
          if (notify) {
            message.success(json.msg);
          }

          // 操作成功
          return json.payload;
        case 401:
          // 需要登录认证
          unauthorized();
        default:
          // 其它错误，403 等
          const error = new Error(json.msg);

          error.code = json.code;

          throw error;
      }
    });
}

/**
 * @function request
 * @param {string} url
 * @param {Object} [options]
 * @returns {Promise}
 */
export default function request(url, options) {
  options = options || {};
  options.cache = options.cache === true;
  options.credentials = options.credentials || 'include';

  const query = options.query;
  const cache = options.cache;
  const notify = options.notify === true;

  delete options.query;
  delete options.cache;
  delete options.notify;

  url = new URI(url);
  url.query = Object.assign(url.query, query);

  // Disable cache
  if (!cache) url.query._ = Date.now();

  // Get url
  url = url.toURI();

  // Format headers
  const headers = (options.headers = new Headers(options.headers || {}));

  // Set XMLHttpRequest header
  headers.set('X-Requested-With', 'XMLHttpRequest');

  // Set post/put headers body
  if (/POST|PUT/i.test(options.method)) {
    // Set post/put headers body
    if (!headers.has('Content-Type')) {
      // Set content type
      headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

      // Stringify body
      options.body = options.body ? stringify(options.body) : null;
    } else if (jsonType(headers.get('Content-Type'))) {
      // Stringify body
      options.body = options.body ? JSON.stringify(options.body) : null;
    }
  }

  // Sent request
  return fetch(url, options).then(response => {
    switch (response.status) {
      case 200:
        // 获取类型
        const type = response.headers.get('Content-Type');

        // 根据类型解析返回结果
        return jsonType(type) ? jsonParser(response, notify) : response.text();
      case 401:
        // 需要登录认证
        unauthorized();
      default:
        // 其它错误，403，404，500 等
        const { status } = response;
        const error = new Error(STATUS_TEXT[status] || '未知错误');

        error.code = status;

        throw error;
    }
  });
}
