import React, { Fragment } from 'react';
import { store } from '~js/utils/utils';
import { history } from '~js/utils/utils';
import request from '~js/utils/request';
import { message, Layout, Menu, Icon, Dropdown, Avatar, Modal, Form, Input, Button } from 'antd';
import styles from '~css/Forget.module.less';
import Md5 from '~js/utils/md5.js';

const FormItem = Form.Item;

@Form.create()
export default class App extends React.Component {
  state = { disabled: false, count: 90, change: false };

  handleMessage = () => {
    if (this.props.form.getFieldValue('telnumber')) {
      request('/api/get_duanxin', {
        method: 'post',
        body: {
          telnumber: this.props.form.getFieldValue('telnumber'),
          type: 2,
        },
      })
        .then((payload) => (this.timerID = setInterval(() => this.tick(), 1000)))
        .catch((error) => message.error(error.message));
    } else {
      message.error('请输入手机号码');
    }
  };

  tick = () => {
    const { count } = this.state;

    if (count > 0) {
      this.setState({ count: --this.state.count, disabled: true });
    } else {
      clearInterval(this.timerID);
      this.setState({ count: 90, disabled: false });
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        request('/api/login/forger_user', {
          method: 'post',
          body: {
            ...values,
            pwd: Md5(values.pwd),
          },
        })
          .then((payload) => {
            message.success('修改成功');
            history.push('/login');
          })
          .catch((error) => message.error(error.message));
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { count } = this.state;

    return (
      <div className={styles.forget}>
        <div className={styles.top}>
          <h2>找回密码</h2>
        </div>
        <div className={styles.content}>
          <Form onSubmit={this.handleSubmit}>
            <FormItem>
              {getFieldDecorator('telnumber', {
                rules: [
                  {
                    required: true,
                    message: '请输入手机号',
                  },
                  {
                    pattern: /^1[3456789]\d{9}$/,
                    message: '请输入正确的手机号',
                  },
                ],
              })(
                <Input
                  maxLength={11}
                  prefix={<Icon type="phone" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="请输入手机号"
                />
              )}
            </FormItem>
            <FormItem>
              <div className={styles.message}>
                {getFieldDecorator('code', {
                  rules: [{ required: true, message: '请输入短信验证码' }],
                })(
                  <Input
                    className={styles.captchaInput}
                    prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    type="text"
                    placeholder="请输入短信验证码"
                  />
                )}
                <Button type="primary" onClick={this.handleMessage} disabled={this.state.disabled}>
                  {count == 90 ? '发送验证码' : `(${count}s)后重试`}
                </Button>
              </div>
            </FormItem>
            <FormItem>
              {getFieldDecorator('pwd', {
                rules: [{ required: true, message: '请输入新密码' }],
              })(
                <Input
                  prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  maxLength={16}
                  type="password"
                  placeholder="请输入新密码"
                />
              )}
            </FormItem>
            <FormItem label="">
              <Button type="primary" htmlType="submit">
                确定
              </Button>
            </FormItem>
          </Form>
        </div>
      </div>
    );
  }
}
