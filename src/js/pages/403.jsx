import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

export default class App extends React.Component {
  render() {
    return (
      <Result
        status="403"
        title="403"
        subTitle="无权访问"
        extra={
          <Link to="/">
            <Button type="primary">返回首页</Button>
          </Link>
        }
      />
    );
  }
}
