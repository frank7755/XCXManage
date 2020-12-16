import '~css/reset-pc.less';
import '~css/antd.less';
import React, { Fragment } from 'react';
import loadable from '~js/utils/loadable';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import ReactDOM from 'react-dom';
import routes from './route';
import { history } from '~js/utils/utils.js';
import { ConfigProvider } from 'antd'; //全局语言包配置
import zhCN from 'antd/es/locale/zh_CN';
import './index.css';
import 'moment/locale/zh-cn';

const HasLayoutPages = loadable(() => import('~js/components/HasLayoutPages/Index.jsx'));

const NoLayoutPages = [];
const LayoutPages = [];
Object.keys(routes).forEach((path) => {
  const route = routes[path];
  const { layout = true, exact = true, ...restProps } = route;
  const props = { key: path, path, exact, ...restProps };

  if (layout) {
    LayoutPages.push(props);
  } else {
    NoLayoutPages.push(props);
  }
});

class App extends React.Component {
  render() {
    return (
      <ConfigProvider locale={zhCN}>
        <Router history={history}>
          <Switch>
            {NoLayoutPages.map(({ component: Component, ...restProps }) => (
              <Route {...restProps} render={(props) => <Component {...props} />} />
            ))}
            <Route
              render={(props) => (
                <HasLayoutPages {...props}>
                  {(id, username, telnumber, token, shoptype) => (
                    <Switch>
                      {LayoutPages.map(({ component: Component, ...restProps }) => (
                        <Route
                          {...restProps}
                          render={(props) => (
                            <Fragment>
                              <Component
                                id={id}
                                user_name={username}
                                shoptype={shoptype}
                                telnumber={telnumber}
                                token={token}
                                {...props}
                              />
                            </Fragment>
                          )}
                        />
                      ))}
                      <Redirect to="/404"></Redirect>
                    </Switch>
                  )}
                </HasLayoutPages>
              )}
            />
          </Switch>
        </Router>
      </ConfigProvider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
