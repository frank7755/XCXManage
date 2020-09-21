import React, { Fragment } from 'react';
import styles from '~css/login.module.less';
import { Form, Icon, Input, Button, Checkbox, message, Avatar, Select } from 'antd';
import request from '~js/utils/request';
import { store } from '~js/utils/utils';
import { history } from '~js/utils/utils';
import { Link } from 'react-router-dom';
import Md5 from '~js/utils/md5.js';

const { Option } = Select;

@Form.create()
class RegisterForm extends React.Component {
  state = {
    url: null,
    count: 90,
    disabled: false,
    shopOptions: [],
    checkedName: '',
  };

  componentDidMount() {
    this.handleCaptcha();
    request('api/kdt_select').then((payload) =>
      this.setState({
        shopOptions: payload.pageData,
      })
    );
  }

  handleCaptcha = () => {
    request('/api/testGetCaptcha')
      .then((payload) => this.setState({ url: payload.url }))
      .catch((error) => message.error(error.message));
  };

  handleSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        request('/api/login/create', {
          method: 'POST',
          body: { ...values, pwd: Md5(values.pwd), yz_shop_name: this.state.checkedName },
          notify: true,
        })
          .then((payload) => {
            const { history } = this.props;

            history.push('/login');
          })
          .catch((error) => message.error(error.message));
      }
    });
  };

  handleMessage = () => {
    if (this.props.form.getFieldValue('telnumber')) {
      request('/api/get_duanxin', {
        method: 'post',
        body: {
          telnumber: this.props.form.getFieldValue('telnumber'),
          type: 1,
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
  handleChange = (a, b) => {
    this.setState({ checkedName: b.props.dataref.kdt_name });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { url, count, shopOptions } = this.state;
    return (
      <div className={styles.registerFormBox}>
        <h2>帐号注册</h2>
        <Form onSubmit={this.handleSubmit} className={styles.loginForm}>
          <Form.Item>
            {getFieldDecorator('telnumber', {
              rules: [
                { required: true, message: '请输入手机号' },
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
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('pwd', {
              rules: [{ required: true, message: '请输入密码' }],
            })(
              <Input
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                maxLength={16}
                type="password"
                placeholder="请输入密码"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('user_name', {
              rules: [{ required: true, message: '请输入姓名' }],
            })(
              <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} type="text" placeholder="请输入姓名" />
            )}
          </Form.Item>
          <Form.Item>
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
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('yz_shop_id', {
              rules: [{ required: true, message: '请输入密码' }],
            })(
              <Select placeholder="请选择商城" onChange={this.handleChange}>
                {shopOptions &&
                  shopOptions.map((item) => (
                    <Option key={item.kdt_id} dataref={item} value={item.kdt_id}>
                      {item.kdt_name}
                    </Option>
                  ))}
              </Select>
            )}
          </Form.Item>
          {/* <Form.Item>
            <div className={styles.captchaBox}>
              {getFieldDecorator('code', {
                rules: [{ required: true, message: '请输入验证码' }]
              })(
                <Input
                  className={styles.captchaInput}
                  prefix={<Icon type="picture" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  type="text"
                  placeholder="请输入验证码"
                />
              )}
              {url ? (
                <img src={url} className={styles.captchaImg} onClick={this.handleCaptcha} />
              ) : (
                <span className={styles.imgPlaceHolder}></span>
              )}
            </div>
          </Form.Item> */}
          <Button type="primary" htmlType="submit" className={styles.registerButton}>
            注册
          </Button>
          <Link to="/login" className={styles.loginHref}>
            帐号登录
          </Link>
        </Form>
      </div>
    );
  }
}

const storeAccount = 'loginName';
const storeAccountState = 'loginRememberState';
const storeToken = 'userToken';
const storeYzToken = 'YZtoken';
const userId = 'userId';
const name = 'userName';
const shopName = 'shopName';
const tel = 'telnumber';
const role = 'userRole';
const shopType = 'shopType';
const sn = 'sn';

@Form.create()
export default class App extends React.Component {
  state = {
    account: store.get(storeAccount),
    remember: store.get(storeAccountState) != 0,
  };

  componentDidMount() {
    store.remove(storeToken);
    store.remove(storeYzToken);
    store.remove(userId);
    store.remove(tel);
    store.remove(shopName);
    store.remove(name);
    store.remove(role);
    store.remove(shopType);
    store.remove(sn);
  }

  handleRemember = (e) => {
    const { checked } = e.target;

    if (!checked) {
      store.remove(storeAccount);
    }
    this.setState({ remember: checked });

    store.set(storeAccountState, checked ? 1 : 0);
  };

  handleSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { remember } = this.state;
        if (remember) {
          store.set(storeAccount, values.telnumber);
        } else {
          store.remove(storeAccount);
        }
        request('/api/login_user', {
          method: 'POST',
          body: { ...values, pwd: Md5(values.pwd) },
        })
          .then((payload) => {
            const { history } = this.props;

            store.set(storeToken, payload.token_info);
            store.set(storeYzToken, payload.yz_token_info);
            store.set(userId, payload.id);
            store.set(tel, payload.telnumber);
            store.set(shopName, payload.shop_name);
            store.set(name, payload.user_name);
            store.set(role, payload.user_role);
            store.set(shopType, payload.shop_type);

            if (payload.user_role == '1') {
              history.push('/shop');
            } else {
              history.push('/cashcenter');
            }
          })
          .catch((error) => message.error(error.message));
      }
    });
  };

  getErrorMessage() {
    const { form } = this.props;
    const { getFieldsError } = form;

    const error = getFieldsError(['telnumber', 'pwd']);

    if (error.username) {
      return error.username[0];
    }

    if (error.pwd) {
      return error.password[0];
    }

    return null;
  }

  render() {
    const { type } = this.props.match.params;
    const { getFieldDecorator } = this.props.form;
    const { history } = this.props;

    return (
      <div className={styles.body}>
        {type === 'login' ? (
          <div className={styles.loginFormBox}>
            <img src={require('~images/logo.png')} className={styles.logo} />
            <Form onSubmit={this.handleSubmit} className={styles.loginForm}>
              <Form.Item>
                {getFieldDecorator('telnumber', {
                  initialValue: store.get(storeAccount),
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
              </Form.Item>
              <Form.Item>
                {getFieldDecorator('pwd', {
                  rules: [{ required: true, message: '请输入密码' }],
                })(
                  <Input
                    prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    maxLength={16}
                    type="password"
                    placeholder="请输入密码"
                  />
                )}
              </Form.Item>
              <Form.Item>
                {getFieldDecorator('remember', {
                  valuePropName: 'checked',
                  initialValue: this.state.remember,
                })(<Checkbox onChange={this.handleRemember}>记住密码</Checkbox>)}
                <Link className={styles.loginForgot} to="/forget">
                  忘记密码
                </Link>
                <Button type="primary" htmlType="submit" className={styles.loginButton}>
                  登录
                </Button>
                <Link to="/register">注册帐号</Link>
              </Form.Item>
            </Form>
          </div>
        ) : (
          <RegisterForm history={history}></RegisterForm>
        )}
        <div className={styles.bottomIcp}>版权所有：武汉市微蚁云网络科技有限公司 鄂ICP备20004598号</div>
      </div>
    );
  }
}
