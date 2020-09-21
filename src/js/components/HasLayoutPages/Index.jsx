import React, { Fragment } from 'react';
import request from '~js/utils/request';
import { message, Layout, Menu, Icon, Dropdown, Avatar, Modal, Form, Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import { store } from '~js/utils/utils';
import defaultMenu from '~js/pages/menu.js';
import { withRouter } from 'react-router-dom';
import styles from './Index.module.less';
import Md5 from '~js/utils/md5.js';

const storeToken = 'userToken';
const storeYzToken = 'YZtoken';
const userId = 'userId';
const name = 'userName';
const tel = 'telnumber';
const shopName = 'shopName';
const role = 'userRole';
const shopType = 'shopType';
const FormItem = Form.Item;

@Form.create()
class ChangePassword extends React.Component {
  state = { visible: false };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  handlePwd = () => {
    const { form } = this.props;
    form.validateFields((err, value) => {
      if (!err) {
        if (value.pwd == value.pwd1) {
          request('/api/login/update_user', {
            method: 'post',
            body: {
              pwd: Md5(value.pwd),
              telnumber: store.get(tel),
            },
          })
            .then((payload) => {
              message.success('修改成功');
              this.setState({ visible: false });
            })
            .catch((error) => {
              message.error(error.message);
              this.props.history.push('/login');
            });
        } else {
          form.setFields({
            pwd1: {
              value: value.pwd1,
              errors: [new Error('2次输入密码不一致')],
            },
          });
        }
      }
    });
  };

  render() {
    const { visible } = this.state;
    const { getFieldDecorator } = this.props.form;

    return (
      <Fragment>
        <a onClick={this.showModal}>
          <Icon type="lock" style={{ marginRight: 5 }}></Icon>修改密码
        </a>
        <Modal title="修改密码" visible={visible} onOk={this.handlePwd} closable onCancel={this.handleCancel}>
          <Form onChange={this.handlChange}>
            <FormItem label="输入密码">
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
            </FormItem>
            <FormItem label="确认密码">
              {getFieldDecorator('pwd1', {
                rules: [{ required: true, message: '请输入密码' }],
              })(
                <Input
                  prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  maxLength={16}
                  type="password"
                  placeholder="请输入密码"
                />
              )}
            </FormItem>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

class App extends React.Component {
  state = {
    draw: false,
    openKeys: ['8'],
    menu: '',
  };

  onOpenChange = (openKeys) => {
    this.setState({ openKeys });
  };

  getMenu = () => {
    if (store.get(role) == '1') {
      if (store.get(shopType) == '1') {
        this.setState({ menu: 'food' });
      } else if (store.get(shopType) == '2') {
        this.setState({ menu: 'retail' });
      }
    } else {
      if (store.get(shopType) == '2') {
        this.setState({ menu: 'retailStaff' });
      }
    }
  };

  componentDidMount() {
    const { menu } = this.state;
    if (
      menu &&
      defaultMenu[menu].filter(({ children }) => children.some(({ src }) => this.props.location.pathname == src)).length > 0
    ) {
      this.setState({
        openKeys: [
          defaultMenu[menu]
            .filter((item) => item.children.some(({ src }) => this.props.location.pathname == src))[0]
            .key.toString(),
        ],
      });
    } else {
      this.setState({ openKeys: [] });
    }
  }

  handleLogout = () => {
    request('/api/login_out').then(this.props.history.push('/login'));
    store.remove(storeToken);
    store.remove(storeYzToken);
    store.remove(userId);
    store.remove(name);
    store.remove(shopName);
    store.remove(tel);
    store.remove(role);
  };

  componentWillMount() {
    this.getMenu();
    setTimeout(
      () =>
        request('/api/login_check', {
          method: 'post',
          body: {
            id: store.get(userId),
            token_info: store.get(storeToken),
          },
        })
          .then((payload) => this.setState({ draw: true }))
          .catch((error) => {
            message.error(error.message);
            this.props.history.push('/login');
          }),
      0
    );
  }

  handleSwap = () => {
    const { history } = this.props;

    history.push('/shop');
  };

  render() {
    const { SubMenu } = Menu;
    const { Header, Content, Sider } = Layout;
    const { draw, menu } = this.state;
    const path = this.props.location.pathname;

    const userSlideMenu = (
      <Menu className={styles.dropDown}>
        <Menu.Item>
          <Link to="/">
            <Icon type="home" style={{ marginRight: 5 }}></Icon>返回主页
          </Link>
        </Menu.Item>
        <Menu.Item>
          <ChangePassword></ChangePassword>
        </Menu.Item>
        <Menu.Item onClick={this.handleLogout}>
          <a>
            <Icon type="logout" style={{ marginRight: 5 }}></Icon>退出登录
          </a>
        </Menu.Item>
      </Menu>
    );

    const wechatOverLay = (
      <Menu style={{ width: '200px', textAlign: 'center' }}>
        <Menu.Item>
          <p>请使用微信扫描二维码</p>
          <Avatar src={require('~images/wechatpro.png')} size={180} style={{ display: 'block', margin: '10px auto' }}></Avatar>
        </Menu.Item>
      </Menu>
    );

    return draw ? (
      <Layout style={{ height: '100%', overflow: 'hidden', minWidth: '1440px' }}>
        <Sider
          className={styles.slider}
          width={200}
          style={{
            height: '100vh',
            position: 'fixed',
            left: 0,
            zIndex: 99,
          }}
          theme="dark"
        >
          <div className={styles.logo}>
            <Link to="/">
              <img src={require('~images/logo.png')}></img>
            </Link>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            className={styles.menu}
            defaultSelectedKeys={'/'}
            onOpenChange={this.onOpenChange}
            onSelect={this.handleSelect}
            defaultOpenKeys={this.state.openKeys}
            selectedKeys={[`${path}`]}
          >
            {defaultMenu[menu].map((nav) => (
              <SubMenu
                key={nav.key}
                title={
                  <div>
                    {nav.icon}
                    <span>{nav.title}</span>
                  </div>
                }
              >
                {nav.children &&
                  nav.children.map((subnav) => (
                    <Menu.Item key={subnav.src}>
                      <Link to={subnav.src}>{subnav.title}</Link>
                    </Menu.Item>
                  ))}
              </SubMenu>
            ))}
          </Menu>
        </Sider>
        <Layout style={{ marginLeft: 200 }}>
          <Header className={styles.header}>
            <h2>
              {store.get(shopName)}
              {store.get(role) == '1' ? (
                <Button type="ghost" icon="sync" style={{ marginLeft: 15 }} onClick={this.handleSwap}>
                  切换店铺
                </Button>
              ) : (
                ''
              )}
            </h2>
            <ul>
              <Dropdown overlay={wechatOverLay} placement="bottomRight">
                <li>
                  <Avatar src={require('~images/programe.jpg')} size={30} style={{ marginRight: 10 }} />
                  <span>小程序</span>
                </li>
              </Dropdown>
              <Dropdown overlay={userSlideMenu}>
                <li>
                  <Avatar style={{ backgroundColor: '#00d0f9', marginRight: 10 }} icon="user" />
                  {store.get(tel)}
                </li>
              </Dropdown>
            </ul>
          </Header>
          <Content
            style={{
              padding: 24,
              height: '100%',
              minHeight: 'auto',
              overflow: 'auto',
            }}
          >
            {this.props.children(
              store.get(userId),
              store.get(name),
              store.get(tel),
              store.get(storeToken),
              store.get(storeYzToken)
            )}
          </Content>
        </Layout>
      </Layout>
    ) : null;
  }
}

export default withRouter(App);
