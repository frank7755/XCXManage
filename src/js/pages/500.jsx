import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

export default class App extends React.Component {
  render() {
    return (
      <Result
        status="500"
        title="500"
        subTitle="服务器发生了错误"
        extra={
          <Link to="/">
            <Button type="primary">返回首页</Button>
          </Link>
        }
      />
    );
  }
}
