import React, { Fragment } from 'react';
import request from '~js/utils/request';
import { store } from '~js/utils/utils';
import moment from 'moment';
import { formatThousands } from '~js/utils/utils';
import styles from '~css/Cash/OnlineOrder.module.less';
import { Pagination, Button, Modal, Form, Input, message, DatePicker, Select, Row, Alert, Col, Table, Radio } from 'antd';
import {
  getCurrMonth,
  getCurrWeek,
  getDatePickerValue,
  getLastWeek,
  getToday,
  getLast7Days,
  getYesterday,
} from '~js/utils/date-fns';
import { Link } from 'react-router-dom';
const { Option } = Select;
const { RangePicker } = DatePicker;

const FormItem = Form.Item;

@Form.create()
class SendGoods extends React.Component {
  state = {
    visible: false,
    express: [],
    type: 'express',
  };

  showModal = () => {
    request('/api/kuaidi_sel', {
      method: 'post',
    }).then((payload) => this.setState({ express: payload.pageData }));
    this.setState({
      visible: true,
    });
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };

  handleDirectSend = () => {
    const { outData, onChange } = this.props;
    request('/api/wx_confirm_developers', {
      method: 'post',
      body: {
        id: this.props.id,
        express_type: outData.express_type,
        tid: outData.tid,
      },
      headers: { 'Content-Type': 'application/json;' },
    }).then((payload) => {
      message.success('发货成功！');
      onChange && onChange();
    });
  };

  handleSend = () => {
    const { onChange } = this.props;

    this.props.form.validateFields((err, value) => {
      if (!err) {
        const { outData } = this.props;
        request('/api/wx_confirm_developers', {
          method: 'post',
          body: {
            id: this.props.id,
            express_type: outData.express_type,
            tid: outData.tid,
            ...value,
          },
          headers: { 'Content-Type': 'application/json;' },
        })
          .then((payload) => {
            message.success('发货成功');
            onChange && onChange();
            this.setState({ visible: false });
          })
          .catch((error) => message.error(error.message));
      }
    });
  };

  render() {
    const { visible, express } = this.state;
    const { getFieldDecorator } = this.props.form;
    const { outData } = this.props;

    return (
      <Fragment>
        <Button type="default" onClick={outData.express_type == 0 ? this.showModal : this.handleDirectSend}>
          发货
        </Button>
        <Modal
          visible={visible}
          title="订单发货"
          onCancel={this.handleCancel}
          width={800}
          className={styles.sendGoodsModal}
          onOk={this.handleSend}
        >
          <Alert
            description={
              <div className={styles.warningText}>
                <p>1.中通、申通、圆通、百世、韵达快递公司已恢复运营支持发货，详情查看经营提醒公告；</p>
                <p>2.同城建议使用达达、蜂鸟配送以保证运力，详情查看同城配送建议公告；</p>
              </div>
            }
            type="warning"
            showIcon
          />
          <h3 className={styles.tableTitle}>选择商品</h3>
          <div className={styles.customerInfo}>
            <span>配送信息</span>
            <section>
              <p>
                <span>收货人：</span>
                {outData.receiver_name + ' ' + outData.receiver_tel}
              </p>
              <p>
                <span>收货地址：</span>
                {outData.address}
              </p>
            </section>
          </div>

          <div className={styles.customerInfo}>
            <span>快递</span>
            <section>
              <FormItem label="物流公司">
                {getFieldDecorator('delivery_id', {
                  rules: [{ required: true, message: '请选择物流公司' }],
                })(
                  <Select style={{ width: '100%' }} placeholder="请选择快递">
                    {express &&
                      express.map((item) => (
                        <Option key={item.delivery_id} value={item.delivery_id}>
                          {item.delivery_name}
                        </Option>
                      ))}
                  </Select>
                )}
              </FormItem>
              <FormItem label="快递单号">
                {getFieldDecorator('delivery_order', {
                  rules: [{ required: true, message: '请输入快递单号' }],
                })(<Input type="text" style={{ width: '100%' }} placeholder="请输入快递单号"></Input>)}
              </FormItem>
            </section>
          </div>
        </Modal>
      </Fragment>
    );
  }
}

@Form.create()
class OrderList extends React.Component {
  state = {
    listData: [],
    total: null,
    current: 1,
  };

  componentDidMount() {
    this.handleSearch();
  }

  getDateRanges() {
    return {
      今天: getToday(),
      昨天: getYesterday(),
      本周: getCurrWeek(),
      上周: getLastWeek(),
      本月: getCurrMonth(),
    };
  }

  fetch = (page, pageSize) => {
    this.props.form.validateFields((err, value) => {
      const { dateRange, ...rest } = value;
      const [start_time, end_time] = value.dateRange;

      if (!err) {
        request('/api/order_management/select', {
          method: 'post',
          body: {
            id: this.props.id,
            type: 1,
            start_time: start_time,
            end_time: end_time,
            page: page || 1,
            pageSize: pageSize || 20,
            ...rest,
          },
        }).then((payload) => {
          this.setState({ listData: payload.pageData, total: payload.total, current: payload.page });
        });
      }
    });
  };

  handleSearch = () => {
    this.fetch();
  };

  handleRest = () => {
    this.props.form.resetFields();
    this.fetch();
  };

  render() {
    const { listData, total, current } = this.state;
    const { getFieldDecorator } = this.props.form;

    return (
      <Fragment>
        <h2 className="title">
          <span>线上商品</span>
        </h2>
        <Form onSubmit={this.handleSearch} onReset={this.handleRest}>
          <Row gutter={32} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <span className={styles.rowItem}>
                <label>订单号：</label>
                {getFieldDecorator('tid')(<Input placeholder="请输入订单号" style={{ width: 'calc(100% - 80px)' }} />)}
              </span>
            </Col>
            <Col span={8}>
              <span className={styles.rowItem}>
                <label>商品名称：</label>
                {getFieldDecorator('title')(<Input placeholder="请输入商品名称" style={{ width: 'calc(100% - 80px)' }} />)}
              </span>
            </Col>
            <Col span={8}>
              <span className={styles.rowItem}>
                <label>选择日期：</label>
                {getFieldDecorator('dateRange', {
                  initialValue: [moment().subtract(0.5, 'year'), moment()],
                })(<RangePicker allowClear={false} style={{ width: 'calc(100% - 80px)' }} ranges={this.getDateRanges()} />)}
              </span>
            </Col>
          </Row>
          <Row gutter={32} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <span className={styles.rowItem}>
                <label>订单状态：</label>
                {getFieldDecorator('status', { initialValue: '' })(
                  <Select style={{ width: 'calc(100% - 80px)' }}>
                    <Option value="">全部</Option>
                    <Option value="WAIT_BUYER_PAY">待支付</Option>
                    <Option value="WAIT_SELLER_SEND_GOODS">待发货</Option>
                    <Option value="WAIT_BUYER_CONFIRM_GOODS">已发货</Option>
                    <Option value="TRADE_SUCCESS">已完成</Option>
                    <Option value="TRADE_REFUND">已退款</Option>
                    <Option value="TRADE_CLOSED">已关闭</Option>
                  </Select>
                )}
              </span>
            </Col>
            <Col span={8}>
              <span className={styles.rowItem}>
                <label>配送单号：</label>
                {getFieldDecorator('delivery_id')(
                  <Input placeholder="请输入配送单号" style={{ width: 'calc(100% - 80px)' }} />
                )}
              </span>
            </Col>
          </Row>
          <Row style={{ marginBottom: 24 }}>
            <Col span={8}>
              <span className={styles.rowItem}>
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
                <Button type="gray" htmlType="reset">
                  重置
                </Button>
              </span>
            </Col>
          </Row>
        </Form>
        <div className={styles.orderList}>
          <ul className={styles.listHeader}>
            <li>商品</li>
            <li>单价(元) / 数量</li>
            <li className={styles.send}>配送方式/配送单号</li>
            <li>买家 / 收货人</li>
            <li>实收金额(元)</li>
            <li>订单状态</li>
            <li>操作</li>
          </ul>
          {listData &&
            listData.map((item) => (
              <ListItemTable
                status_str={item.status_str}
                data={item.order}
                key={item.tid}
                showHeader={false}
                len={item.order.length}
                outData={item}
                onChange={this.fetch}
                id={this.props.id}
              ></ListItemTable>
            ))}
        </div>
        {listData.length ? (
          <Pagination
            className={styles.pagination}
            current={current}
            pageSize={20}
            showQuickJumper
            total={total}
            onChange={(page, pageSize) => this.fetch(page, pageSize)}
          ></Pagination>
        ) : (
          ''
        )}
      </Fragment>
    );
  }
}

@Form.create()
class ListItemTable extends React.Component {
  state = {
    selectedRowKeys: [],
    expressData: null,
    visible: false,
    ExpressModal: false,
    refundShow: false,
  };

  expressType = {
    0: '快递发货',
    1: '到店自提',
    2: '同城配送',
    9: '虚拟商品',
    3: '收银台下单',
    4: '扫码下单',
  };

  status_str = {
    WAIT_BUYER_PAY: 'textEdit',
    WAIT_SELLER_SEND_GOODS: 'textEdit',
    WAIT_BUYER_CONFIRM_GOODS: 'textHighLight',
    TRADE_SUCCESS: 'textSuccess',
    TRADE_REFUND: 'textDelete',
    TRADE_CLOSED: 'textDelete',
  };

  showPayModal = () => {
    this.setState({ visible: true });
  };

  renderContent = (val, record, index) => {
    if (index == 0) {
      return {
        children: this.props.val,
        props: {
          rowSpan: this.props.len,
        },
      };
    }
    return {
      children: this.props.price,
      props: {
        rowSpan: 0,
      },
    };
  };

  columns = [
    {
      title: '商品',
      dataIndex: 'title',
      width: '35%',
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
      title: '单价 / 数量',
      dataIndex: 'price',
      width: '10%',
      align: 'center',
      render(price, record) {
        return (
          <Fragment>
            <p>￥{formatThousands(record.price)}</p>
            <p>{record.num}</p>
          </Fragment>
        );
      },
    },
    {
      title: '配送方式/配送单号',
      dataIndex: 'express_type',
      width: '15%',
      align: 'left',
      render: (val, record, index) => {
        const { outData, len } = this.props;
        if (index == 0) {
          return {
            children: (
              <Fragment>
                <p>配送方式：{this.expressType[outData.express_type]}</p>
                <p>配送单号：{outData.delivery_id}</p>
              </Fragment>
            ),
            props: {
              rowSpan: len,
            },
          };
        } else {
          return {
            props: {
              rowSpan: 0,
            },
          };
        }
      },
    },
    {
      title: '买家/收货人',
      dataIndex: 'receiver_name',
      width: '10%',
      align: 'center',
      render: (val, record, index) => {
        const { outData, len } = this.props;
        if (index == 0) {
          return {
            children: (
              <Fragment>
                <p>{outData.receiver_name}</p>
                <p>{outData.receiver_tel}</p>
              </Fragment>
            ),
            props: {
              rowSpan: len,
            },
          };
        } else {
          return {
            props: {
              rowSpan: 0,
            },
          };
        }
      },
    },
    {
      title: '实收金额',
      dataIndex: 'receive',
      width: '10%',
      align: 'center',
      render: (val, record, index) => {
        const { outData, len } = this.props;
        if (index == 0) {
          return {
            children: `￥${formatThousands(outData.payment)}`,
            props: {
              rowSpan: len,
            },
          };
        }
        return {
          props: {
            rowSpan: 0,
          },
        };
      },
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      width: '10%',
      align: 'center',
      render: (val, record, index) => {
        const { outData, len } = this.props;
        if (index == 0) {
          return {
            children: <p className={this.status_str[outData.status]}>{outData.status_str}</p>,
            props: {
              rowSpan: len,
            },
          };
        }
        return {
          children: <p></p>,
          props: {
            rowSpan: 0,
          },
        };
      },
    },
    {
      title: '操作',
      dataIndex: 'options',
      width: '10%',
      align: 'center',
      render: (options, record, index) => {
        const { outData, len } = this.props;

        if (index == 0) {
          if (outData.express_mode == '线下') {
            return {
              children: '',
              props: {
                rowSpan: len,
              },
            };
          } else {
            if (outData.status_str == '待发货') {
              return {
                children: <SendGoods outData={outData} onChange={this.props.onChange} id={this.props.id}></SendGoods>,
                props: {
                  rowSpan: len,
                },
              };
            } else {
              return {
                children: <p></p>,
                props: {
                  rowSpan: len,
                },
              };
            }
          }
        }
        return {
          children: <p></p>,
          props: {
            rowSpan: 0,
          },
        };
      },
    },
  ];

  showExpressModal = (outData, id) => {
    request('/api/confirm_sel', {
      method: 'post',
      body: {
        id: id,
        tid: outData.tid,
        delivery_order: outData.delivery_id,
      },
      headers: { 'Content-Type': 'application/json;' },
    }).then((payload) => this.setState({ expressData: JSON.parse(payload.pageData[0].data) }));

    this.setState({
      ExpressModal: true,
    });
  };
  showRefundModal = () => {
    this.setState({ refundShow: true });
  };

  handleRefundOk = (tid) => {
    const { onChange } = this.props;

    this.props.form.validateFields((err, value) => {
      if (!err) {
        request('/api/secapi/pay/refund', {
          method: 'post',
          body: {
            id: this.props.id,
            tid: tid,
            ...value,
          },
          headers: { 'Content-Type': 'application/json;' },
        })
          .then((payload) => {
            onChange && onChange();
            message.success('退款成功');
            this.setState({ refundShow: false });
          })
          .catch((error) => message.error(error.message));
      }
    });
  };

  handleOk = (e) => {
    this.setState({
      ExpressModal: false,
    });
  };

  handleCancel = (e) => {
    this.setState({
      ExpressModal: false,
      refundShow: false,
    });
  };


  handlePrint = () => {
    const { data, outData } = this.props;

    request('/api/catering/xprint', {
      method: 'post',
      body: {
        id: this.props.id,
        sn: store.get('printSN'),
        type: 4,
        content: `
<BR><BR><C><HB>${store.get('shopName')}

<N>欢迎光临

<L>桌位号：${outData.desk_no}
品名      数量          单价
--------------------------------
${data
  .map(
    (item) => `
${item.title}
         ${item.num}          ￥${item.price}`
  )
  .join('')}
--------------------------------
日期：${moment().format('YYYY-MM-DD HH:mm:ss')}
总计：${outData.payment}
请保留您的小票，保护您的权益.<BR><BR>
`,
      },
    }).catch((error) => message.error(error.message));
  };

  render() {
    const { data, item, outData, ...rest } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { expressData } = this.state;

    return (
      <div className={styles.listItem}>
        <div className={styles.listItemTitle}>
          <span>
            订单号：{outData.tid} 下单时间：{moment(outData.created).format('YYYY-MM-DD')}
          </span>
          <div>
            {outData.express_mode == '线上' && (
              <Fragment>
                <a className="textDelete" style={{ marginRight: 10 }} onClick={this.showRefundModal}>
                  线上订单退款
                </a>
                <Modal
                  title="线上退款"
                  visible={this.state.refundShow}
                  onOk={() => this.handleRefundOk(outData.tid)}
                  onCancel={this.handleCancel}
                >
                  <Form>
                    <FormItem label="退货金额">
                      {getFieldDecorator('refund_fee', {
                        initialValue: outData.payment,
                        rules: [
                          {
                            required: true,
                            message: '请输入退货金额',
                          },
                        ],
                      })(<Input placeholder="请输入退货金额" />)}
                    </FormItem>
                    <FormItem label="退货方式">
                      {getFieldDecorator('refund_type', {
                        initialValue: 2,
                        rules: [
                          {
                            required: true,
                            message: '请选择退货方式',
                          },
                        ],
                      })(
                        <Select>
                          <Option value={1}>买家申请退款</Option>
                          <Option value={2}>商家主动退款</Option>
                        </Select>
                      )}
                    </FormItem>
                  </Form>
                </Modal>
              </Fragment>
            )}
            {outData.express_type == 0 && outData.status == 'WAIT_BUYER_CONFIRM_GOODS' && (
              <a
                style={{ marginRight: 10 }}
                onClick={() => outData.delivery_id && this.showExpressModal(outData, this.props.id)}
              >
                快递轨迹查看
              </a>
            )}
            <Link to={`/onlineorderretail/${outData.tid}`}>查看详情</Link>
            <Modal title="快递轨迹查看" visible={this.state.ExpressModal} onOk={this.handleOk} onCancel={this.handleCancel}>
              {expressData &&
                expressData.map((item) => (
                  <div class={styles.express}>
                    <p>{moment(item.time).format('YYYY-MM-DD')}</p>
                    <p>{item.context}</p>
                  </div>
                ))}
            </Modal>
          </div>
        </div>
        <Table
          {...rest}
          pagination={false}
          rowKey={(record) => record.sku_id}
          columns={this.columns}
          dataSource={data}
          bordered
        ></Table>
      </div>
    );
  }
}

export default class App extends React.Component {
  render() {
    return (
      <div className={styles.onlineTable}>
        <OrderList id={this.props.id}></OrderList>
      </div>
    );
  }
}
