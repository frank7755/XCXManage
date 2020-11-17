import React, { Fragment } from 'react';
import request from '~js/utils/request';
import styles from '~css/Foods/FoodsCash.module.less';
import { store } from '~js/utils/utils';
import moment from 'moment';
import { Button, Form, Input, message, Popconfirm, Radio, Modal, Icon, InputNumber } from 'antd';

const FormItem = Form.Item;

@Form.create()
class FoodsInfo extends React.Component {
  state = {
    visible: false,
    clickSkuData: [],
    price: 0,
  };

  handlePlus = (val) => {
    request('/api/wx_sku_sel', {
      method: 'post',
      headers: { 'Content-Type': 'application/json;' },
      body: {
        id: store.get('userId'),
        item_id: val,
      },
    }).then((payload) =>
      this.setState({ clickSkuData: payload.pageData[0] }, () => {
        const { onChange } = this.props;
        onChange && onChange({ ...this.state.clickSkuData, count: 1 });
      })
    );
  };

  showModal = (val) => {
    request('/api/wx_sku_sel', {
      method: 'post',
      headers: { 'Content-Type': 'application/json;' },
      body: {
        id: store.get('userId'),
        item_id: val,
      },
    }).then((payload) => {

      this.setState({ clickSkuData: payload.pageData, visible: true, price: payload.pageData[0].price });
    });
  };
  handleChange = () => {
    const { clickSkuData } = this.state;
    const changeValue = this.props.form.getFieldsValue()['Operation_type'].toString().replace(/\,/g, '');
    const checkedVal = clickSkuData.filter((item) => item.guige_tmp_con == changeValue)[0];
    this.setState({ price: checkedVal.price });
  };

  handleCancel = () => {
    this.setState({ visible: false });
  };

  handleSkus = () => {
    this.props.form.validateFields((err, values) => {
      const { clickSkuData } = this.state;
      const { onChange } = this.props;

      if (!err) {
        const guige = values.Operation_type.toString().replace(/\,/g, '');
        const chosenItem = { ...clickSkuData.filter((item) => item.guige_tmp_con == guige)[0], count: 1 };
        onChange && onChange(chosenItem);
        this.setState({ visible: false, price: 0 });
        this.props.form.resetFields();
      }
    });
  };

  render() {
    const { data } = this.props;
    const { visible, price } = this.state;
    const { getFieldDecorator } = this.props.form;
    const skus = JSON.parse(data.guige_value);

    return (
      <div className={styles.foodsItem}>
        <div className={styles.imgBox}>
          <img src={data.pic_url}></img>
        </div>
        <div className={styles.foodAction}>
          <p className={styles.price}>￥{data.price}</p>
          <Icon
            type="plus-circle"
            theme="filled"
            onClick={data.guige_key ? () => this.showModal(data.item_id) : () => this.handlePlus(data.item_id)}
          />
        </div>
        <p className={styles.name}>{data.name}</p>
        <Modal title="选择规格" visible={visible} onOk={this.handleSkus} onCancel={this.handleCancel}>
          <p className={styles.skuPrice}>
            价格：<span className="textDelete">￥{price}</span>
          </p>
          <Form onChange={this.handleChange}>
            {skus &&
              skus.map((item, index) => (
                <FormItem key={item.name} label={item.name}>
                  {getFieldDecorator(`Operation_type[${index}]`, {
                    rules: [{ required: true }],
                    initialValue: item.value.split(',')[0],
                  })(
                    <Radio.Group>
                      {item.value.split(',').map((item, index) => (
                        <Radio key={index} value={item}>
                          {item}
                        </Radio>
                      ))}
                    </Radio.Group>
                  )}
                </FormItem>
              ))}
          </Form>
        </Modal>
      </div>
    );
  }
}

@Form.create()
class ShoppingCart extends React.Component {
  state = {
    visible: false,
    orderType: 0,
  };

  handleCancel = () => {
    this.setState({ visible: false });
  };

  showOrderModal = () => {
    this.setState({ visible: true, orderType: 0 });
  };

  showAddModal = () => {
    this.setState({ visible: true, orderType: 1 });
  };

  handlePlus = (val) => {
    const { chosenData, onChange } = this.props;
    let newArr = [];
    newArr = chosenData.map((item) => {
      if (item.sku_id == val) {
        ++item.count;
        return item;
      } else {
        return item;
      }
    });
    onChange && onChange(newArr);
  };

  handleMinus = (val) => {
    const { chosenData, onChange } = this.props;
    let newArr = [];
    newArr = chosenData.map((item) => {
      if (item.sku_id == val) {
        --item.count;
        return item;
      } else {
        return item;
      }
    });
    onChange && onChange(newArr.filter((item) => item.count > 0));
  };

  handleClear = () => {
    const { onChange } = this.props;

    onChange && onChange([]);
  };

  confirm = () => {
    this.handleClear();
  };

  handleOrder = () => {
    const { getOrder } = this.props;
    const { orderType } = this.state;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        getOrder && getOrder(values, orderType);
        this.props.form.resetFields();
        this.setState({ visible: false });
      }
    });
  };

  handlePay = () => {
    request('/api/catering/ordertopay', {
      method: 'post',
      headers: { 'Content-Type': 'application/json;' },
      body: {
        id: this.props.id,
        skus: this.props.chosenData,
      },
    })
      .then((payload) => {
        message.success('结账成功');
        this.handleClear();
      })
      .catch((err) => message.error(err.message));
  };

  render() {
    const { chosenData, sumPrice } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { visible, orderType } = this.state;

    return (
      <div className={styles.shoppingCart}>
        <h2>购物车</h2>
        <p className={styles.actionBar}>
          <span>已选商品</span>
          <Popconfirm title="确认要清空购物车吗" onConfirm={this.confirm} okText="确定" cancelText="取消">
            <a>清空购物车</a>
          </Popconfirm>
        </p>
        <div className={styles.orderInfo}>
          <div className={styles.order}>
            <span>商品</span>
            <span>价格</span>
            <span>操作</span>
          </div>
          {chosenData &&
            chosenData.map((item) => (
              <div className={styles.orderItem} key={item.sku_id}>
                <div className={styles.orderTitle}>
                  <h3>{item.title}</h3>
                  <p>
                    规格:{item.guige_tmp_con ? item.guige_tmp_con : '无规格'} 库存:{item.quantity}
                  </p>
                </div>
                <span>￥{item.price}</span>
                <div className={styles.action}>
                  <Icon type="minus-circle" theme="filled" onClick={() => this.handleMinus(item.sku_id)} />
                  <span className={styles.count}>{item.count}</span>
                  <Icon type="plus-circle" theme="filled" onClick={() => this.handlePlus(item.sku_id)} />
                </div>
              </div>
            ))}
        </div>
        <div className={styles.orderPay}>
          <p>
            <span>总价:</span>￥{sumPrice ? sumPrice : 0}
          </p>
          <Button type="edit" disabled={!chosenData.length > 0} onClick={this.handlePay}>
            下单并结账
          </Button>
          <Button type="primary" onClick={this.showOrderModal} disabled={!chosenData.length > 0} style={{ marginLeft: 5 }}>
            下单
          </Button>
          <Button type="gray" onClick={this.showAddModal} style={{ marginLeft: 5 }} disabled={!chosenData.length > 0}>
            加单
          </Button>
          <Modal
            title={orderType == 0 ? '下单' : '加单'}
            visible={visible}
            onOk={this.handleOrder}
            onCancel={this.handleCancel}
          >
            <Form>
              <FormItem label="员工id">
                {getFieldDecorator('staff_id')(<Input placeholder="请输入员工id" type="text"></Input>)}
              </FormItem>
              <FormItem label="会员id">
                {getFieldDecorator('vip_id')(<Input placeholder="请输入会员id" type="text"></Input>)}
              </FormItem>
              <FormItem label="用餐人数">
                {getFieldDecorator('num_people')(
                  <InputNumber placeholder="请输入用餐人数" style={{ width: '100%' }}></InputNumber>
                )}
              </FormItem>
              <FormItem label="座位号">
                {getFieldDecorator('desk_no', {
                  rules: [{ required: true, message: '请填写座位号' }],
                })(<InputNumber placeholder="请输入座位号" style={{ width: '100%' }}></InputNumber>)}
              </FormItem>
            </Form>
          </Modal>
        </div>
      </div>
    );
  }
}

@Form.create()
export default class App extends React.Component {
  state = {
    data: [],
    disabled: true,
    chosenData: [],
  };

  componentDidMount() {
    this.getFoods();
  }

  getFoods = () => {
    request('/api/catering/order_mast_selectact', {
      method: 'post',
      body: { id: this.props.id, type: 1 },
    }).then((payload) => this.setState({ data: payload.pageData }));
  };

  handleSumData = (val) => {
    let newArr = this.state.chosenData;
    let price = 0;
    if (
      !newArr.some((item) => {
        if (item.sku_id == val.sku_id) {
          item.count++;
          return true;
        } else {
          return false;
        }
      })
    ) {
      newArr.push(val);
    }
    newArr.forEach((item) => {
      price += item.count * item.price;
    });

    this.setState({ chosenData: newArr, sumPrice: Number(price).toFixed(2) });
  };

  handleClear = () => {
    this.setState({ chosenData: [], sumPrice: 0 });
  };

  handleCartData = (val) => {
    let price = 0;
    val.forEach((item) => {
      price += item.count * item.price;
    });
    this.setState({ chosenData: val, sumPrice: Number(price).toFixed(2) });
  };

  getOrder = (val, type) => {
    const { chosenData } = this.state;

    if (type == 0) {
      request('/api/catering/order_management_create', {
        method: 'post',
        headers: { 'Content-Type': 'application/json;' },
        body: {
          id: store.get('userId'),
          staff_id: val.staff_id,
          vip_id: val.vip_id,
          desk_no: val.desk_no,
          skus: chosenData,
        },
      })
        .then((payload) => {
          message.success('下单成功');
          request('/api/catering/xprint', {
            method: 'post',
            body: {
              id: this.props.id,
              sn: store.get('printSN'),
              type: 4,
              content: `
<BR><BR><C><HB>${store.get('shopName')}

<N>欢迎光临

<L>桌位号：${val.desk_no}
品名      数量          单价
--------------------------------
${chosenData
  .map(
    (item) => `
${item.title}
          ${item.count}           ￥${item.price}`
  )
  .join('')}
--------------------------------
日期：${moment().format('YYYY-MM-DD HH:mm:ss')}
请保留您的小票，保护您的权益.<BR><BR>
`,
            },
          }).catch((error) => message.error(error.message));
          this.setState({ chosenData: [], sumPrice: 0 });
        })
        .catch((err) => message.error(err.message));
    } else {
      request('/api/catering/order_management_addcreate', {
        method: 'post',
        headers: { 'Content-Type': 'application/json;' },
        body: {
          id: store.get('userId'),
          staff_id: val.staff_id,
          vip_id: val.vip_id,
          desk_no: val.desk_no,
          skus: chosenData,
        },
      })
        .then((payload) => {
          message.success('加单成功');
          request('/api/catering/xprint', {
            method: 'post',
            body: {
              id: this.props.id,
              sn: store.get('printSN'),
              type: 4,
              content: `
<BR><BR><C><HB>${store.get('shopName')}

<N>欢迎光临

<L>桌位号：${val.desk_no}
品名      数量          单价
--------------------------------
${chosenData
  .map(
    (item) => `
${item.title}
          ${item.count}           ￥${item.price}`
  )
  .join('')}
--------------------------------
日期：${moment().format('YYYY-MM-DD HH:mm:ss')}
请保留您的小票，保护您的权益.<BR><BR>
`,
            },
          }).catch((error) => message.error(error.message));
          this.setState({ chosenData: [], sumPrice: 0 });
        })
        .catch((err) => message.error(err.message));
    }
  };

  render() {
    const { data, chosenData, disabled } = this.state;

    return (
      <div className={styles.foodsCash}>
        <h2 className="title">
          <span>下单</span>
        </h2>
        <div className={styles.foodsContent}>
          <div className={styles.contentLeft}>
            {data.map((item) => (
              <div key={item.tag_ids} className={styles.foodsBox}>
                <h2>{item.tag_name}</h2>
                <div className={styles.foodList}>
                  {item.children.map((food) => (
                    <FoodsInfo
                      key={food.proc_id}
                      data={food}
                      checkedData={chosenData}
                      onChange={this.handleSumData}
                    ></FoodsInfo>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.contentRight}>
            <ShoppingCart
              chosenData={chosenData}
              onChange={this.handleCartData}
              sumPrice={this.state.sumPrice}
              getOrder={this.getOrder}
              id={this.props.id}
            ></ShoppingCart>
          </div>
        </div>
      </div>
    );
  }
}
