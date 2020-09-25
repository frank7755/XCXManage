import React, { Fragment } from 'react';
import styles from '~css/Settings/PrintSettings.module.less';
import { store } from '~js/utils/utils';
import moment from 'moment';
import request from '~js/utils/request';
import { Form, Modal, Button, Input, Select, Popconfirm, message } from 'antd';

const FormItem = Form.Item;
const { Option } = Select;
const title = {
  1: '添加打印机',
  2: '修改打印机',
  3: '声音设置',
  4: '内容设置',
  5: '清空内容',
  6: '打印机状态',
};
const status = {
  0: '离线',
  1: '在线正常',
  2: '在线异常 ',
};
const printSN = 'printSN';
const shopName = 'shopName';

@Form.create()
class PrintAction extends React.Component {
  state = { visible: false };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = (e) => {
    const { type } = this.props;
    this.props.form.validateFields((error, values) => {
      if (!error) {
        request('/api/catering/xprint', {
          method: 'post',
          body: {
            ...values,
            type: type,
            id: store.get('userId'),
          },
        })
          .then((payload) => {
            if (type == 6) {
              if (payload == 1) {
                message.success(status[payload]);
              } else {
                message.error(status[payload]);
              }
            } else if (type == 1) {
              store.set(printSN, values.sn);
              message.success(payload);
            } else {
              message.success(payload);
            }

            this.setState({
              visible: false,
            });

            this.props.form.resetFields();
          })
          .catch((error) => message.error(error.message));
      }
    });
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { visible } = this.state;
    const { type } = this.props;

    return (
      <Fragment>
        {type == 1 && (
          <Button type="primary" onClick={this.showModal}>
            添加
          </Button>
        )}
        {type == 2 && (
          <Button type="primary" onClick={this.showModal}>
            修改
          </Button>
        )}
        {type == 3 && (
          <Button type="primary" onClick={this.showModal}>
            声音设置
          </Button>
        )}
        {type == 5 && (
          <Button type="danger" onClick={this.showModal}>
            清空内容
          </Button>
        )}
        {type == 6 && (
          <Button type="primary" onClick={this.showModal}>
            查看状态
          </Button>
        )}
        <Modal title={title[type]} visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
          <Form>
            <FormItem label="打印机sn号">
              {getFieldDecorator('sn', {
                rules: [
                  {
                    required: true,
                    message: '请填写打印机sn号',
                  },
                ],
              })(<Input type="text"></Input>)}
            </FormItem>
            <FormItem label="店铺名称">
              {getFieldDecorator('name', {
                initialValue: store.get('shopName'),
                rules: [
                  {
                    required: true,
                    message: '请填写打印机sn号',
                  },
                ],
              })(<Input type="text"></Input>)}
            </FormItem>
            {type == 3 && (
              <FormItem label="声音选择">
                {getFieldDecorator('voicetype', {
                  initialValue: 4,
                  rules: [
                    {
                      required: true,
                      message: '请填写打印机sn号',
                    },
                  ],
                })(
                  <Select type="text">
                    <Option value={0}>真人语音（大）</Option>
                    <Option value={1}>真人语音（中）</Option>
                    <Option value={2}>真人语音（小）</Option>
                    <Option value={3}>嘀嘀声</Option>
                    <Option value={4}>静音</Option>
                  </Select>
                )}
              </FormItem>
            )}
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

class CheckInfo extends React.Component {
  state = { visible: false, data: null };

  showModal = () => {
    request('/api/catering/xprint', {
      method: 'post',
      body: {
        id: store.get('userId'),
        type: 7,
      },
    })
      .then((payload) => {
        this.setState({ visible: true, data: payload });
      })
      .catch((error) => message.error(error.message));
  };
  handleOk = () => {
    this.setState({
      visible: false,
    });
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const { visible, data } = this.state;

    return (
      <Fragment>
        <Button type="primary" onClick={this.showModal}>
          打印机信息查询
        </Button>
        <Modal title="打印机信息" visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
          {data && (
            <div className={styles.printInfo}>
              <p>
                <span>店铺名称:</span>
                {data.name}
              </p>
              <p>
                <span>打印机SN:</span>
                {data.sn}
              </p>
              <p>
                <span>打印机声音:</span>
                {data.voicetype}
              </p>
              <p>
                <span>添加时间:</span>
                {moment(data.created).format('YYYY-MM-DD')}
              </p>
            </div>
          )}
        </Modal>
      </Fragment>
    );
  }
}

export default class App extends React.Component {
  render() {
    return (
      <div className={styles.print}>
        <h2 className="title">
          <span>打印机设置</span>
        </h2>
        <div className={styles.settingButtons}>
          <PrintAction type={1}></PrintAction>
          <PrintAction type={2}></PrintAction>
          <PrintAction type={3}></PrintAction>
          <PrintAction type={4}></PrintAction>
          <PrintAction type={5}></PrintAction>
          <PrintAction type={6}></PrintAction>
          <CheckInfo></CheckInfo>
        </div>
      </div>
    );
  }
}
