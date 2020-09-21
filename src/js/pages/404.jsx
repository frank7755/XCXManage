import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

export default class App extends React.Component {
  render() {
    return (
      <Result
        status="404"
        title="404"
        subTitle="此页面未找到"
        extra={
          <Link to="/">
            <Button type="primary">返回首页</Button>
          </Link>
        }
      />
    );
  }
}
