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
  1: '买家已经申请退款，等待卖家同意',
  10: '卖家拒绝退款',
  20: '卖家已经同意退货，等待买家退货，',
  30: '买家已经退货，等待卖家确认收货',
  40: '卖家未收到货,拒绝退款',
  50: '退款关闭',
  60: '退款成功',
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
        request('/api/secapi/pay/store_refund', {
          method: 'post',
          body: {
            id: this.props.id,
            tid: this.props.tid,
            oid: this.props.oid,
            ...value,
          },
          headers: { 'Content-Type': 'application/json;' },
        }).then((payload) => {
          message.success('退货成功');
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
    const { num } = this.props;
    const { visible } = this.state;

    return (
      <Fragment>
        <Button disabled={this.props.disabled} onClick={this.showModal}>
          线下退货
        </Button>
        <Modal title="线下退货" visible={visible} onCancel={this.handleCancel} onOk={this.handleRefund}>
          <Form>
            <FormItem label="退货数量">
              {getFieldDecorator('num', {
                initialValue: num,
                rules: [
                  {
                    required: true,
                    message: '请输入退货数量',
                  },
                ],
              })(<Input placeholder="请输入退货数量" />)}
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
      render: (title, record) => {
        return (
          <Fragment>
            <p style={{ marginBottom: 10, display: 'inline-block', color: '#000' }}>{title}</p>
            {record.sku_properties_name && <p style={{ margin: 0, color: '#666' }}>{record.sku_properties_name}</p>}
          </Fragment>
        );
      },
    },
    {
      title: '单价',
      dataIndex: 'price',
    },
    {
      title: '数量',
      dataIndex: 'num',
    },
    {
      title: '小计',
      dataIndex: 'payment',
    },
    {
      title: '运单号',
      dataIndex: 'delivery_order',
    },
    {
      title: '退款状态',
      dataIndex: 'refund_type',
      align: 'center',
      render: (refund_type, record) => {
        const { outData } = this.props;
        if (outData.express_mode == '线下') {
          return (
            <Refund
              url="/api/secapi/pay/store_refund"
              tid={outData.tid}
              id={this.props.id}
              oid={record.oid}
              num={record.num}
              onChange={this.props.onChange}
              title="线下退货"
            ></Refund>
          );
        }
      },
    },
  ];
  render() {
    return <Table rowKey="sku_id" columns={this.columns} dataSource={this.props.data} pagination={false}></Table>;
  }
}

export default class App extends React.Component {
  state = {
    data: {},
  };

  refresh = () => {
    request('/api/catering/order_management_selectdef', {
      method: 'post',
      body: {
        id: this.props.id,
        tid: this.props.match.params.id,
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
                <span>实付金额：</span>￥{formatThousands(data.payment)} 元
              </p>
              <p>
                <span>付款时间：</span>
                {data.pay_time && moment(data.pay_time).format('YYYY-MM-DD')}
              </p>
            </div>
          </Col>
          <Col span={8}>
            <h3>配送</h3>
            <div>
              <p>
                <span>配送单号：</span>
              </p>
            </div>
          </Col>
        </Row>
        <Divider>商品信息</Divider>
        <GoodsTable onChange={this.refresh} id={this.props.id} key="oid" outData={data} data={data.order}></GoodsTable>
        <div className={styles.bottom}>
          <p>商品总价：￥{formatThousands(data.total_fee)}</p>
          <p>
            实收金额：<span>￥{formatThousands(data.payment)}</span>
          </p>
        </div>
      </div>
    );
  }
}
