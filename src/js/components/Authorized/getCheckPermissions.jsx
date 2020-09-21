import React from 'react';
import PromiseRender from './PromiseRender';

/**
 * @function getCheckPermissions
 * @param { 你的权限 | Your permission description } currentAuthority
 */
export default function getCheckPermissions(currentAuthority) {
  /**
   * @function checkPermissions
   * @description 通用权限检查方法
   * @description Common check permissions method
   * @param { 权限判定 | Permission judgment } authority
   * @param { 通过的组件 | Passing components } target
   * @param { 未通过的组件 | no pass components } Exception
   */
  return (authority, target, Exception) => {
    // 没有判定权限.默认查看所有
    // Retirement authority, return target;
    if (authority == null) {
      return target;
    }

    // Promise 处理
    if (authority instanceof Promise) {
      return <PromiseRender ok={target} error={Exception} promise={authority} />;
    }

    // Function 处理
    if (typeof authority === 'function') {
      try {
        const bool = authority(currentAuthority);

        // 函数执行后返回值是 Promise
        if (bool instanceof Promise) {
          return <PromiseRender ok={target} error={Exception} promise={bool} />;
        }

        if (bool) return target;

        return Exception;
      } catch (error) {
        throw error;
      }
    }

    // 数组处理
    if (Array.isArray(authority)) {
      if (Array.isArray(currentAuthority)) {
        if (currentAuthority.some(item => authority.includes(item))) {
          return target;
        }
      } else if (authority.includes(currentAuthority)) {
        return target;
      }

      return Exception;
    }

    // 其它处理
    if (Array.isArray(currentAuthority)) {
      if (currentAuthority.some(item => authority === item)) {
        return target;
      }
    } else if (authority === currentAuthority) {
      return target;
    }

    return Exception;
  };
}
