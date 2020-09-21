import getSecured from './getSecured';
import getAuthorized from './getAuthorized';
import getAuthorizedRoute from './getAuthorizedRoute';
import getCheckPermissions from './getCheckPermissions';

export default function authorized(currentAuthority) {
  const checkPermissions = getCheckPermissions(currentAuthority);

  const secured = getSecured(checkPermissions);
  const Authorized = getAuthorized(checkPermissions);
  const AuthorizedRoute = getAuthorizedRoute(Authorized);

  Authorized.secured = secured;
  Authorized.check = checkPermissions;
  Authorized.AuthorizedRoute = AuthorizedRoute;

  return Authorized;
}
