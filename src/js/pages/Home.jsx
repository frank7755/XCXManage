import React from 'react';
import request from '~js/utils/request';
import { formatThousands, debounce } from '~js/utils/utils';
import styles from '~css/Home.module.less';
import { Statistic, Card, Row, Col, Icon } from 'antd';

function transfromNum(val) {
  if (val == null) {
    return 0;
  } else {
    return val;
  }
}

export default class App extends React.Component {
  state = {
    data: {}
  };

  componentDidMount() {
    request('/api/BI/select', {
      method: 'post',
      body: {
        id: this.props.id,
        type: 7
      }
    }).then(payload => this.setState({ data: payload.pageData }));
  }

  render() {
    const { data } = this.state;

    return (
      <div className={styles.home}>
        <h2 className="title">
          <span>实时概况</span>
          {data.last_day && (
            <div className={styles.lastDay}>
              剩余使用天数：<span>{`${data.last_day}`}</span> 天
            </div>
          )}
        </h2>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="支付金额(元)"
              value={transfromNum(data.Payment_amount)}
              precision={2}
              valueStyle={{ color: data.Payment_amount > data.yes_Payment_amount ? '#cf1322' : '#3f8600' }}
            />
            <p>{`昨日支付金额： ￥ ${formatThousands(transfromNum(data.yes_Payment_amount))}`}</p>
          </Col>
          <Col span={6}>
            <Statistic
              title="支付订单数"
              value={transfromNum(data.pay_num_order)}
              valueStyle={{ color: data.Payment_amount >= data.yes_Payment_amount ? '#cf1322' : '#3f8600' }}
            />
            <p>{`昨日支付订单数： ${transfromNum(data.yes_pay_num_order)}`}</p>
          </Col>
          <Col span={6}>
            <Statistic title="退货金额(元)" value={transfromNum(data.Return_amount)} precision={2} />
          </Col>
          <Col span={6}>
            <Statistic title="退货订单数" value={transfromNum(data.Number_returns)} />
          </Col>
        </Row>
        <h2 className="title" style={{ marginTop: 50 }}>
          <span>商品概况</span>
          {data.last_day && (
            <div className={styles.lastDay}>
              剩余使用天数：<span>{`${data.last_day}`}</span> 天
            </div>
          )}
        </h2>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="待发货订单" value={transfromNum(data.Pending_order)} />
          </Col>
          <Col span={6}>
            <Statistic title="退款中订单" value={transfromNum(data.Refund_orders)} />
          </Col>
          <Col span={6}>
            <Statistic title="库存过少商品" value={transfromNum(data.less_than_stock)} />
          </Col>
        </Row>
      </div>
    );
  }
}
