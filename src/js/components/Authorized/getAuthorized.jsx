import React, { Fragment } from 'react';

export default function getAuthorized(checkPermissions) {
  return function Authorized({ authority, children, noMatch = null }) {
    const childrenRender = children == null ? null : children;
    const dom = checkPermissions(authority, childrenRender, noMatch);

    return <Fragment>{dom}</Fragment>;
  };
}
