import React from 'react';
import { Spin } from 'antd';
import { Redirect } from 'react-router';

/**
 * @function PageLoading
 * @param {Object} params
 */
export default function PageLoading({ error, timedOut, pastDelay }) {
  // When the loader has errored
  if (error) {
    if (process.env.DEBUG) {
      // ANSI Regexp
      const ANSI_REGEX = /[\u001B\u009B][[\]()#;?]*(?:(?:(?:[a-zA-Z\d]*(?:;[a-zA-Z\d]*)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PRZcf-ntqry=><~]))/g;

      return (
        <pre
          style={{
            top: 0,
            left: 0,
            padding: 10,
            fontSize: 16,
            color: '#fff',
            width: '100vw',
            height: '100vh',
            position: 'fixed',
            zIndex: 2147483647,
            background: 'rgba(0, 0, 0, .8)',
            fontFamily: '"Ubuntu Mono", Consolas, monospace'
          }}
        >
          {(error.stack || error.message).replace(ANSI_REGEX, '')}
        </pre>
      );
    }

    return <Redirect to="/500" />;
  }

  // When the loader taken longer than the timeout
  if (timedOut) {
    return <Redirect to="/404" />;
  }

  // When the loader has taken longer than the delay
  if (pastDelay) {
    return (
      <Spin>
        <div style={{ minHeight: 360 }} />
      </Spin>
    );
  }

  return null;
}
