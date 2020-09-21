/**
 * @module Prefetch
 * @description 预取数据
 */

import React from 'react';
import { message, Spin } from 'antd';
import request from '~js/utils/request';

function getStyle(loading) {
  if (loading) return { minHeight: 360 };

  return null;
}

/**
 * @function prefetch
 */
export default function prefetch(entry, mapDataToProps = data => data, onError) {
  return Component => {
    return class Prefetch extends React.PureComponent {
      state = {
        data: null,
        loading: false
      };

      mounted = false;

      fetch = () => {
        this.setState({ loading: true });

        return request(entry)
          .then(payload => {
            if (this.mounted) {
              this.setState({
                loading: false,
                data: mapDataToProps(payload, this.fetch)
              });
            }
          })
          .catch(error => {
            if (typeof onError === 'function') {
              onError(error);
            } else {
              message.error(error.message);
            }

            if (this.mounted) {
              this.setState({ loading: false });
            }
          });
      };

      componentDidMount() {
        this.mounted = true;

        this.fetch();
      }

      componentWillUnmount() {
        this.mounted = false;
      }

      render() {
        const { data, loading } = this.state;

        return (
          <Spin spinning={loading} delay={150}>
            <div style={getStyle(loading)}>{data && <Component {...this.props} {...data} />}</div>
          </Spin>
        );
      }
    };
  };
}
