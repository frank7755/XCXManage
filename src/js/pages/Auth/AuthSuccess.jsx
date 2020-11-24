import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import styles from '~css/Auth/AuthSuccess.module.less';

export default class App extends React.Component {
  render() {
    return (
      <div className={styles.authSuccess}>
        <img src={require('~images/success.png')} />
        <p>授权成功，点击按钮返回页面可正常开始你的项目配置</p>
        <div className={styles.action}>
          <Link to="/wxManage">
            <Button type="primary" onClick={this.handleClick}>
              确定
            </Button>
          </Link>
        </div>
      </div>
    );
  }
}
