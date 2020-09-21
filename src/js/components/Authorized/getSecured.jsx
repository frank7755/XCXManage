import React from 'react';

/**
 * 默认不能访问任何页面
 * default is "NULL"
 */
const Exception403 = () => 403;

export const isComponentClass = component => {
  if (!component) return false;

  const proto = Object.getPrototypeOf(component);

  if (proto === React.Component || proto === Function.prototype) return true;

  return isComponentClass(proto);
};

// Determine whether the incoming component has been instantiated
// AuthorizedRoute is already instantiated
// Authorized  render is already instantiated, children is no instantiated
// Secured is not instantiated
const checkIsInstantiation = target => {
  if (isComponentClass(target)) {
    const Target = target;

    return function SecuredAuthorized(props) {
      return <Target {...props} />;
    };
  }

  if (React.isValidElement(target)) {
    return function SecuredAuthorized(props) {
      return React.cloneElement(target, props);
    };
  }

  return function SecuredAuthorized() {
    return target;
  };
};

export default function getSecured(checkPermissions) {
  /**
   * @description 用于判断是否拥有权限访问此 view 权限
   * @description authority 支持传入 string, () => boolean | Promise
   * @example 'user' 只有 user 用户能访问
   * @example 'user,admin' user 和 admin 都能访问
   * @example () = >boolean 返回 true 能访问, 返回 false 不能访问
   * @example Promise then 能访问  catch 不能访问
   * @example authority support incoming string, () => boolean | Promise
   * @example 'user' only user user can access
   * @example 'user, admin' user and admin can access
   * @example () => boolean true to be able to visit, return false can not be accessed
   * @example Promise then can not access the visit to catch
   * @param {string | function | Promise} authority
   * @param {ReactNode} error 非必需参数
   */
  return (authority, error) => {
    /**
     * conversion into a class
     * 防止传入字符串时找不到 staticContext 造成报错
     * String parameters can cause staticContext not found error
     */
    let classError = false;

    if (error) {
      classError = () => error;
    }

    if (!authority) {
      throw new Error('authority is required');
    }

    return function decideAuthority(target) {
      const component = checkPermissions(authority, target, classError || Exception403);

      return checkIsInstantiation(component);
    };
  };
}
