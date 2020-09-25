import React, { Fragment } from 'react';
import { formatThousands } from '~js/utils/utils';
import moment from 'moment';
import request from '~js/utils/request';
import styles from '~css/Cash/OrderAction.module.less';
import { Icon, Button, Avatar, message, Popconfirm, Modal, Input, Form } from 'antd';

const { TextArea } = Input;
const FormItem = Form.Item;

const status = {
  '1': '买家发起维权',
  '10': '卖家拒绝退款',
  '20': '卖家已经同意退货，等待买家退货',
  '30': '买家已经退货，等待卖家确认收货',
  '40': '卖家未收到货,拒绝退款',
  '50': '退款关闭',
  '60': '退款成功'
};

class RefuseRefund extends React.Component {
  state = { visible: false, value: '' };

  refuseRefund = () => {
    const { type, id, refund_id, tid, onChange } = this.props;
    request('/api/order_management/yz_order_refund', {
      method: 'post',
      body: {
        id: id,
        type: type,
        yz_token_info: this.props.yztoken,
        refund_id: refund_id,
        tid: tid,
        remark: this.state.value
      }
    })
      .then(payload => {
        onChange && onChange();
        message.success('已拒绝退款');
        this.setState({ remark: '', visible: false });
      })
      .catch(err => message.error(err.message));
  };

  showModal = () => {
    this.setState({
      visible: true
    });
  };

  handleOk = e => {
    this.setState({
      visible: false
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false
    });
  };
  handleChange = e => {
    this.setState({
      value: e.target.value
    });
  };

  render() {
    const { value, visible } = this.state;
    const { type } = this.props;

    return (
      <Fragment>
        {type == 3 && (
          <Button type="red" onClick={this.showModal}>
            拒绝退款
          </Button>
        )}
        {type == 1 && (
          <Button type="red" onClick={this.showModal}>
            拒绝退货
          </Button>
        )}
        <Modal title={type == 1 ? '退货' : '退款'} visible={visible} onOk={this.refuseRefund} onCancel={this.handleCancel}>
          <p>拒绝原因:</p>
          <p>
            <TextArea type="text" onChange={this.handleChange} value={value}></TextArea>
          </p>
        </Modal>
      </Fragment>
    );
  }
}

@Form.create()
class AccessGoods extends React.Component {
  state = { visible: false };

  AccessGoods = () => {
    this.props.form.validateFields((err, value) => {
      const { onChange } = this.props;
      if (!err) {
        request('/api/order_management/yz_order_refund', {
          method: 'post',
          body: {
            id: this.props.id,
            type: 4,
            yz_token_info: this.props.yztoken,
            refund_id: this.props.refund_id,
            tid: this.props.tid,
            ...value
          }
        })
          .then(payload => {
            onChange && onChange();
          })
          .catch(err => message.error(err.message));
      }
    });
  };

  showModal = () => {
    this.setState({
      visible: true
    });
  };

  handleOk = e => {
    this.setState({
      visible: false
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false
    });
  };
  handleChange = e => {
    this.setState({
      value: e.target.value
    });
  };

  render() {
    const { visible } = this.state;
    const { getFieldDecorator } = this.props.form;

    return (
      <Fragment>
        <Button type="primary" onClick={this.showModal}>
          同意退货，发送退货地址
        </Button>
        <Modal title="退款" visible={visible} onOk={this.AccessGoods} onCancel={this.handleCancel}>
          <Form>
            <FormItem label="收货人">
              {getFieldDecorator('name', {
                rules: [
                  {
                    required: true,
                    message: '请输入收货人'
                  }
                ]
              })(<Input type="text" placeholder="请输入收货人"></Input>)}
            </FormItem>
            <FormItem label="收货电话">
              {getFieldDecorator('mobile', {
                rules: [
                  {
                    required: true,
                    message: '请输入收货电话'
                  }
                ]
              })(<Input type="text" placeholder="请输入收货电话"></Input>)}
            </FormItem>
            <FormItem label="地址">
              {getFieldDecorator('address', {
                rules: [
                  {
                    required: true,
                    message: '请输入收货地址'
                  }
                ]
              })(<Input type="text" placeholder="请输入收货地址"></Input>)}
            </FormItem>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

class GetLastTime extends React.Component {
  state = {
    days: '',
    hours: '',
    minutes: '',
    seconds: ''
  };

  componentDidMount() {
    this.getLastTime(moment(this.props.time));
  }

  getLastTime = time => {
    let endTime = moment(time).add(7, 'days');

    const tick = () => {
      let currentTime = moment();

      if (currentTime.isBefore(endTime)) {
        const days = endTime.diff(currentTime, 'days');
        const hours = endTime.diff(currentTime, 'hours') - days * 24;
        const minutes = endTime.diff(currentTime, 'minutes') - days * 24 * 60 - hours * 60;
        const seconds = endTime.diff(currentTime, 'seconds') - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60;

        this.setState({
          days,
          hours: hours < 10 ? '0' + hours : hours,
          minutes: minutes < 10 ? '0' + minutes : minutes,
          seconds: seconds < 10 ? '0' + seconds : seconds
        });

        setTimeout(tick, 1000 - new Date().getMilliseconds());
      }
    };

    tick();
  };
  render() {
    const { days, hours, minutes, seconds } = this.state;

    return <p style={{ marginBottom: 10 }}>{`剩余操作时间 ${days} 天 ${hours} 小时 ${minutes} 分钟 ${seconds} 秒`}</p>;
  }
}

class ActionType extends React.Component {
  accessRefund = type => {
    const { onChange } = this.props;
    request('/api/order_management/yz_order_refund', {
      method: 'post',
      body: {
        id: this.props.id,
        type: type,
        yz_token_info: this.props.yztoken,
        refund_id: this.props.refund_id,
        tid: this.props.tid,
        oid: type == 2 && this.props.oid
      }
    })
      .then(payload => {
        onChange && onChange();
      })
      .catch(err => message.error(err.message));
  };

  render() {
    const { refund_state, return_goods, startTime } = this.props;
    const { id, tid, refund_id } = this.props;
    return (
      <Fragment>
        {refund_state == '1' ? (
          return_goods ? (
            <div className={styles.action}>
              <Icon type="info-circle" style={{ fontSize: 20, color: '#006acc', marginTop: 3 }} />
              <div>
                <h2>{status[refund_state]}</h2>
                <p style={{ marginBottom: 5 }}>收到买家退货申请，请尽快处理。</p>
                <div style={{ paddingTop: 15 }}>
                  <AccessGoods
                    id={id}
                    refund_id={refund_id}
                    tid={tid}
                    onChange={this.props.onChange}
                    yztoken={this.props.yztoken}
                  ></AccessGoods>
                  <RefuseRefund
                    id={id}
                    type={3}
                    refund_id={refund_id}
                    yztoken={this.props.yztoken}
                    tid={tid}
                    onChange={this.props.onChange}
                  ></RefuseRefund>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.action}>
              <Icon type="info-circle" style={{ fontSize: 20, color: '#006acc', marginTop: 3 }} />
              <div>
                <h2>{status[refund_state]}</h2>
                <p style={{ marginBottom: 5 }}>收到买家仅退款申请，请尽快处理。</p>
                <GetLastTime time={startTime}></GetLastTime>
                <div style={{ paddingTop: 15 }}>
                  <Popconfirm title="确定同意退款？" onConfirm={() => this.accessRefund(5)} okText="确定" cancelText="取消">
                    <Button type="primary">同意买家退款</Button>
                  </Popconfirm>
                  <RefuseRefund
                    id={id}
                    type={3}
                    refund_id={refund_id}
                    yztoken={this.props.yztoken}
                    tid={tid}
                    onChange={this.props.onChange}
                  ></RefuseRefund>
                </div>
              </div>
            </div>
          )
        ) : (
          ''
        )}
        {refund_state == '10' && (
          <div className={styles.action}>
            <Icon type="stop" style={{ fontSize: 20, color: '#fc5050', marginTop: 3 }} />
            <div>
              <h2>{status[refund_state]}</h2>
              <p style={{ marginBottom: 5 }}>你已拒绝本次退款申请，买家修改退货申请后，需要你重新处理</p>
              <p style={{ marginBottom: 5 }}>买家在6天23小时59分钟30秒内未响应，退款申请将自动撤销</p>
              <div style={{ paddingTop: 15 }}>
                <Popconfirm title="确定同意退款？" onConfirm={() => this.accessRefund(5)} okText="确定" cancelText="取消">
                  <Button type="primary">同意买家退款</Button>
                </Popconfirm>
              </div>
            </div>
          </div>
        )}
        {refund_state == '20' && (
          <div className={styles.action}>
            <Icon type="info-circle" style={{ fontSize: 20, color: '#006acc', marginTop: 3 }} />
            <div>
              <h2>{status[refund_state]}</h2>
            </div>
          </div>
        )}
        {refund_state == '30' && (
          <div className={styles.action}>
            <Icon type="info-circle" style={{ fontSize: 20, color: '#006acc', marginTop: 3 }} />
            <div>
              <h2>{status[refund_state]}</h2>
              <p style={{ marginBottom: 5 }}>你已拒绝本次退款申请，买家修改退货申请后，需要你重新处理。</p>
              <p style={{ marginBottom: 5 }}>买家在6天21小时42分钟08秒内未响应，退款申请将自动撤销。</p>
              <div style={{ paddingTop: 15 }}>
                <Popconfirm title="确定收货并同意退款？" onConfirm={() => this.accessRefund(2)} okText="确定" cancelText="取消">
                  <Button type="primary">确认收货并退款</Button>
                </Popconfirm>
                <RefuseRefund
                  id={id}
                  type={1}
                  yztoken={this.props.token}
                  refund_id={refund_id}
                  tid={tid}
                  onChange={this.props.onChange}
                ></RefuseRefund>
              </div>
            </div>
          </div>
        )}
        {refund_state == '40' && (
          <div className={styles.action}>
            <Icon type="stop" style={{ fontSize: 20, color: '#fc5050', marginTop: 3 }} />
            <div>
              <h2>{status[refund_state]}</h2>
            </div>
          </div>
        )}
        {refund_state == '50' && (
          <div className={styles.action}>
            <Icon type="stop" style={{ fontSize: 20, color: '#fc5050', marginTop: 3 }} />
            <div>
              <h2>{status[refund_state]}</h2>
            </div>
          </div>
        )}
        {refund_state == '60' && (
          <div className={styles.action}>
            <Icon type="check-circle" style={{ fontSize: 20, color: '#31c105', marginTop: 3 }} />
            <div>
              <h2>{status[refund_state]}</h2>
            </div>
          </div>
        )}
      </Fragment>
    );
  }
}

export default class App extends React.Component {
  state = { data: {} };

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    request('/api/order_management/goods_select', {
      method: 'post',
      body: {
        yz_token_info: this.props.yztoken,
        id: this.props.id,
        type: 3,
        refund_id: this.props.match.params.id
      }
    }).then(payload => this.setState({ data: payload.pageData }));
  };

  render() {
    const { data } = this.state;

    return (
      <div className={styles.orderAction}>
        <div className={styles.actionTop}>
          <div className={styles.info}>
            <h2>售后维权</h2>
            <div className={styles.infoTitle}>
              <Avatar size={40} shape="square" src={data.pic_path && data.pic_path}>
                {data.pic_path || '图'}
              </Avatar>
              <p>{data.title}</p>
            </div>
            <ul className={styles.infoDetails}>
              <li>
                期望结果：<span className="textHighLight">{data.return_goods ? '退货退款' : '仅退款'}</span>
              </li>
              <li>
                退款金额：<span className="textHighLight">￥{formatThousands(data.refund_fee)}</span>元
              </li>
              <li>
                维权原因：<span className="textHighLight">{data.reasonname}</span>
              </li>
              <li>维权编号：{data.refund_id}</li>
              <li>订单编号：{data.tid}</li>
              <li>付款时间：{moment(data.pay_time).format('YYYY-MM-DD')}</li>
              <li>
                实付金额：<span className="textHighLight">￥{formatThousands(data.payment)}</span>元
              </li>
            </ul>
          </div>
          <ActionType
            onChange={this.getData}
            id={this.props.id}
            refund_id={data.refund_id}
            yztoken={this.props.yztoken}
            tid={data.tid}
            oid={data.oid}
            startTime={data.refund_messages && data.refund_messages[0].created}
            refund_state={data.refund_state}
            return_goods={data.return_goods}
          ></ActionType>
        </div>
        <div className={styles.actionBottom}>
          <h2>协商记录</h2>
          <ul className={styles.messageList}>
            {data.refund_messages &&
              data.refund_messages.map((item, index) => (
                <li key={index}>
                  <h2>
                    {item.owner_role == 3 && '卖家'}
                    {item.owner_role == 2 && '买家'}
                    <span style={{ marginLeft: 12, fontWeight: 'normal' }}>{item.created}</span>
                  </h2>
                  <div>
                    {item.content.split('，').map((item, index) => (
                      <p key={index}>{item}</p>
                    ))}
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
    );
  }
}
