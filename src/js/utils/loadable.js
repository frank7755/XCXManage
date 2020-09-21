import Loadable from 'react-loadable';
import PageLoading from '~js/components/PageLoading';

/**
 * @function loadable
 * @param {function} loader
 * @param {ReactNode} Loading
 */
export default function loadable(loader, loading = PageLoading, delay = 150) {
  return Loadable({ loading, loader, delay });
}
