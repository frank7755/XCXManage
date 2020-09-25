import React, { Fragment } from 'react';
import styles from '~css/Cash/OnlineOrderDetails.module.less';
import { formatThousands } from '~js/utils/utils';
import request from '~js/utils/request';
import moment from 'moment';
import { Steps, Divider, Row, Col, Table, Button, Form, Modal, Input, message } from 'antd';
const { Step } = Steps;
const FormItem = Form.Item;
const { TextArea } = Input;

const status = {
  '1': '买家已经申请退款，等待卖家同意',
  '10': '卖家拒绝退款',
  '20': '卖家已经同意退货，等待买家退货，',
  '30': '买家已经退货，等待卖家确认收货',
  '40': '卖家未收到货,拒绝退款',
  '50': '退款关闭',
  '60': '退款成功',
};

@Form.create()
class Refund extends React.Component {
  state = {
    visible: false,
  };

  handleRefund = () => {
    const { onChange } = this.props;

    this.props.form.validateFields((err, value) => {
      if (!err) {
        request('/api/order_management/yz_order_seller_active', {
          method: 'post',
          body: {
            id: this.props.id,
            tid: this.props.tid,
            oid: this.props.oid,
            yz_token_info: this.props.yztoken,
            ...value,
          },
        }).then((payload) => {
          message.success('退款成功');
          this.setState({ visible: false });
          onChange && onChange();
        });
      }
    });
  };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const { price } = this.props;
    const { visible } = this.state;

    return (
      <Fragment>
        <Button disabled={this.props.disabled} onClick={this.showModal}>
          主动退款
        </Button>
        <Modal title="主动退款" visible={visible} onCancel={this.handleCancel} onOk={this.handleRefund}>
          <Form>
            <FormItem label="退款金额">
              {getFieldDecorator('refund_fee', {
                initialValue: price,
                rules: [
                  {
                    required: true,
                    message: '请输入退款金额',
                  },
                ],
              })(<Input placeholder="请输入退款金额" />)}
            </FormItem>
            <FormItem label="退款备注">
              {getFieldDecorator('desc', {
                rules: [
                  {
                    required: true,
                    message: '请输入退款备注',
                  },
                ],
              })(<TextArea placeholder="请输入退款备注" />)}
            </FormItem>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

class GoodsTable extends React.Component {
  columns = [
    {
      title: '商品',
      dataIndex: 'title',
    },
    {
      title: '单价',
      dataIndex: 'price',
      align: 'right',
    },
    {
      title: '商品',
      dataIndex: 'num',
      align: 'right',
    },
    {
      title: '小计',
      dataIndex: 'discount_price',
      align: 'right',
    },
    {
      title: '退款状态',
      dataIndex: 'refund_type',
      align: 'right',
      render: (refund_type, record) => {
        if (refund_type == '1') {
          return (
            <div className={styles.refund}>
              <p>{status[record.refund_state]}</p>
              <Refund
                disabled={record.status != null}
                price={record.discount_price}
                tid={this.props.tid}
                id={this.props.id}
                yztoken={this.props.yztoken}
                oid={record.oid}
                onChange={this.props.onChange}
              >
                主动退款
              </Refund>
            </div>
          );
        } else if (refund_type == null) {
          return (
            <Refund
              onChange={this.props.onChange}
              disabled={record.status != null}
              price={record.discount_price}
              tid={this.props.tid}
              id={this.props.id}
              yztoken={this.props.yztoken}
              oid={record.oid}
            >
              主动退款
            </Refund>
          );
        }
        return (
          <div className={styles.refund}>
            <p>{status['60']}</p>
            <Refund
              onChange={this.props.onChange}
              disabled={record.status != null}
              price={record.discount_price}
              tid={this.props.tid}
              yztoken={this.props.yztoken}
              id={this.props.id}
              oid={record.oid}
            >
              主动退款
            </Refund>
          </div>
        );
      },
    },
    {
      title: '发货状态',
      align: 'right',
      dataIndex: 'status',
      render: (status) => {
        if (status == '1') {
          return <span className="textSuccess">已发货</span>;
        } else if (status == null) {
          return <span className="textDelete">待发货</span>;
        }
        return <span className="textDelete">已退款</span>;
      },
    },
  ];
  render() {
    return <Table rowKey="oid" columns={this.columns} dataSource={this.props.data} pagination={false}></Table>;
  }
}

export default class App extends React.Component {
  state = {
    data: {},
  };

  refresh = () => {
    request('/api/order_management/goods_select', {
      method: 'post',
      body: {
        id: this.props.id,
        yz_token_info: this.props.yztoken,
        tid: this.props.match.params.id,
        type: 2,
      },
    }).then((payload) => this.setState({ data: payload.pageData }));
  };

  componentDidMount() {
    this.refresh();
  }

  render() {
    const { data } = this.state;

    return (
      <div className={styles.orderDetails}>
        <Divider>订单进度</Divider>
        <Steps>
          <Step
            title="买家下单"
            description={<p>{data.created && moment(data.created).format('YYYY-MM-DD')}</p>}
            status={data.created ? 'finish' : 'wait'}
          ></Step>
          <Step
            title="买家付款"
            description={<p>{data.pay_time && moment(data.pay_time).format('YYYY-MM-DD')}</p>}
            status={data.pay_time ? 'finish' : 'wait'}
          ></Step>
          <Step
            title="商家发货"
            description={<p>{data.consign_time && moment(data.consign_time).format('YYYY-MM-DD')}</p>}
            status={data.consign_time ? 'finish' : 'wait'}
          ></Step>
          <Step
            title="交易完成"
            description={<p>{data.success_time && moment(data.success_time).format('YYYY-MM-DD')}</p>}
            status={data.success_time ? 'finish' : 'wait'}
          ></Step>
        </Steps>
        <Divider>收货信息</Divider>
        <Row gutter={24} className={styles.orderInfo}>
          <Col span={8}>
            <h3>收货人信息</h3>
            <div>
              <p>
                <span>收货人：</span>
                {data.receiver_name}
              </p>
              <p>
                <span>联系电话：</span>
                {data.receiver_tel}
              </p>
              <p>
                <span>收货地址：</span>
                {data.address}
              </p>
            </div>
          </Col>
          <Col span={8}>
            <h3>付款信息</h3>
            <div>
              <p>
                <span>实付金额：</span>￥{formatThousands(data.discount_price)} 元
              </p>
              <p>
                <span>付款时间：</span>
                {data.pay_time && moment(data.pay_time).format('YYYY-MM-DD')}
              </p>
            </div>
          </Col>
          <Col span={8}>
            <h3>买家信息</h3>
            <div>
              <p>
                <span>买家：</span>
              </p>
              <p>
                <span>留言：</span>
                {data.buyer_message}
              </p>
            </div>
          </Col>
        </Row>
        <Divider>商品信息</Divider>
        <GoodsTable
          onChange={this.refresh}
          id={this.props.id}
          tid={data.tid}
          key="oid"
          data={data.oids}
          yztoken={this.props.yztoken}
        ></GoodsTable>
        <div className={styles.bottom}>
          <p>商品总价：￥{formatThousands(data.price)}</p>
          <p>
            实收金额：<span>￥{formatThousands(data.discount_price)}</span>
          </p>
        </div>
      </div>
    );
  }
}
