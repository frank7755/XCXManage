import React from 'react';
import { Input, Col, Row, Button, Select, DatePicker, Table, Form, Radio, message, Modal } from 'antd';
import request from '~js/utils/request';
import styles from '~css/Auth/Auth.module.less';

export default class App extends React.Component {
  handleClick = () => {
    request(`/api/open/get_openpre_auth_code?id=${this.props.id}`)
      .then((payload) => {
        window.open(payload.auth_url);
      })
      .catch((err) => message.error(err.message));
  };
  render() {
    return (
      <div className={styles.auth}>
        <h2 className="title">
          <span>授权</span>
        </h2>
        <Button type="primary" onClick={this.handleClick}>
          点击授权
        </Button>
      </div>
    );
  }
}
