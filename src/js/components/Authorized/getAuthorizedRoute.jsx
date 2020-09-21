import React from 'react';
import { Redirect, Route } from 'react-router';

export default function getAuthorizedRoute(Authorized) {
  return function AuthorizedRoute({ component: Component, render, authority, redirectPath, ...rest }) {
    return (
      <Authorized
        authority={authority}
        noMatch={<Route {...rest} render={() => <Redirect to={{ pathname: redirectPath }} />} />}
      >
        <Route {...rest} render={props => (Component ? <Component {...props} /> : render(props))} />
      </Authorized>
    );
  };
}
