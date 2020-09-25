import React, { Fragment } from 'react';
import request from '~js/utils/request';
import serveTable from '~js/components/serveTable';
import { formatThousands, debounce } from '~js/utils/utils';
import FormDrawer from '~js/components/FormDrawer';
import styles from '~css/Cash/CashCenter.module.less';
import {
  Input,
  Button,
  Icon,
  Select,
  Table,
  Form,
  Drawer,
  message,
  AutoComplete,
  InputNumber,
  Popconfirm,
  Modal,
  Radio,
} from 'antd';

const { Item: FormItem } = Form;
const { Option } = AutoComplete;
const EditableContext = React.createContext();

class EditableCell extends React.Component {
  getInput = () => {
    if (this.props.inputType === 'number') {
      return <InputNumber min={this.props.min} max={this.props.map} step={this.props.step} />;
    }
    return <Input />;
  };

  renderCell = ({ getFieldDecorator }) => {
    const { editing, dataIndex, title, inputType, record, index, children, ...restProps } = this.props;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item style={{ margin: 0 }}>
            {getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: true,
                  message: `请输入${title}!`,
                },
              ],
              initialValue: record[dataIndex],
            })(this.getInput())}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  render() {
    return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
  }
}

@Form.create()
class SingleDiscount extends React.Component {
  state = { visible: false, value: 1, userSettingDiscount: 1 };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = (e) => {
    const { data, onChange } = this.props;

    this.props.form.validateFields((error, values) => {
      const { userSettingDiscount } = this.state;

      if (!error) {
        const newData = {
          ...data,
          newPrice_num:
            userSettingDiscount != 1
              ? (Number(userSettingDiscount) * values.price_num).toFixed(2)
              : (values.price_num * values.Discount_type).toFixed(2),
        };
        onChange && onChange(newData);
      }
    });
    this.setState({
      visible: false,
    });
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
    this.props.form.resetFields();
  };

  onChange = (e) => {
    this.setState({
      value: e.target.value,
    });
  };

  handleDiscountChange = (val) => {
    this.setState({
      userSettingDiscount: val,
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { data } = this.props;

    return (
      <Fragment>
        <a style={{ marginRight: 10, color: '#31c105' }} onClick={this.showModal}>
          优惠
        </a>
        <Modal
          title="单品优惠"
          style={{ width: 'auto' }}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Form>
            <FormItem label="优惠价格">
              {getFieldDecorator('price_num', {
                initialValue: data && data.price_num,
                rules: [{ required: true, message: '请输入优惠价格' }],
                message: '请输入优惠价格',
              })(<Input placeholder="请输入优惠价格" />)}
            </FormItem>
            <FormItem label="折扣">
              {getFieldDecorator('Discount_type', { initialValue: 1 })(
                <Radio.Group onChange={this.onChange}>
                  <Radio value={1}>不打折</Radio>
                  <Radio value={0.9}>9折</Radio>
                  <Radio value={0.8}>8折</Radio>
                  <Radio value={0.7}>7折</Radio>
                  <Radio value={0.5}>5折</Radio>
                  <Radio value={0} style={{ lineHeight: '50px' }}>
                    自定义折扣
                    {this.state.value == 0 && (
                      <InputNumber
                        min={0}
                        max={1}
                        precision={2}
                        placeholder="自定义折扣"
                        value={this.state.userSettingDiscount}
                        style={{ width: 120, marginLeft: 15 }}
                        onChange={this.handleDiscountChange}
                      ></InputNumber>
                    )}
                  </Radio>
                </Radio.Group>
              )}
            </FormItem>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

function getHangData() {
  let hangData = localStorage.getItem('hangData');

  if (hangData == null) return [];

  try {
    hangData = JSON.parse(localStorage.getItem('hangData'));
  } catch (error) {
    return [];
  }

  if (Array.isArray(hangData)) return hangData;

  return [];
}

@Form.create()
class EditableTable extends React.Component {
  state = { data: [], editingKey: '', GoodsSource: [], hangData: getHangData() };

  isOff(order) {
    return order.newPrice_num && order.newPrice_num != order.price_num;
  }

  columns = [
    {
      title: '商品',
      dataIndex: 'name',
      width: 300,
    },
    {
      title: '规格',
      dataIndex: 'properties_name_json',
      width: 300,
    },
    {
      title: '售价',
      dataIndex: 'price',
      width: 200,
      editable: true,
      render(price) {
        return `￥${formatThousands(price)}`;
      },
    },
    {
      title: '数量',
      dataIndex: 'count',
      width: 150,
      min: 1,
      editable: true,
    },
    {
      title: '小计',
      dataIndex: 'price_num',
      width: 200,
      align: 'center',
      render: (price_num, record) => {
        const off = this.isOff(record);

        return (
          <Fragment>
            {off ? (
              <Fragment>
                <p style={{ textDecoration: 'line-through' }}>{`￥${formatThousands(price_num)}`}</p>
                <p style={{ fontSize: 24, color: '#31c105', marginBottom: 0 }}>{`￥${formatThousands(record.newPrice_num)}`}</p>
              </Fragment>
            ) : (
              <p style={{ marginBottom: 0 }}>{`￥${formatThousands(price_num)}`}</p>
            )}
          </Fragment>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'options',
      align: 'center',
      width: 200,
      render: (text, record) => {
        const { editingKey } = this.state;
        const editable = this.isEditing(record);

        return editable ? (
          <span>
            <EditableContext.Consumer>
              {(form) => (
                <a onClick={() => this.save(form, record.sku_id)} style={{ marginRight: 8 }}>
                  保存
                </a>
              )}
            </EditableContext.Consumer>
            <Popconfirm title="确定要取消吗?" onConfirm={() => this.cancel(record.sku_id)}>
              <a>取消</a>
            </Popconfirm>
          </span>
        ) : (
          <Fragment>
            <a
              className="textEdit"
              style={{ marginRight: 10 }}
              disabled={this.isOff(record)}
              onClick={() => this.edit(record.sku_id)}
            >
              编辑
            </a>
            <SingleDiscount onChange={(values) => this.handleSingleDiscount(values)} data={record}></SingleDiscount>
            <Popconfirm title="确定要删除?" onConfirm={() => this.handleDelete(record.sku_id)}>
              <a className="textDelete">删除</a>
            </Popconfirm>
          </Fragment>
        );
      },
    },
  ];

  handleSingleDiscount = (values) => {
    const { data } = this.state;
    const newData = data.map((item) => (item.sku_id == values.sku_id ? { ...item, ...values } : item));

    this.setState({ data: newData });
  };

  handleDelete = (value) => {
    const { data } = this.state;
    this.setState({ data: data.filter((item) => item.sku_id != value) });
  };

  isEditing = (record) => record.sku_id === this.state.editingKey;

  cancel = () => {
    this.setState({ editingKey: '' });
  };

  save = (form, key) => {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      let price = row.count * row.price;
      const newData = [...this.state.data];
      const index = newData.findIndex((item) => key === item.sku_id);

      if (index > -1) {
        const item = newData[index];

        newData.splice(index, 1, {
          ...item,
          ...row,
          newPrice_num: price,
          price_num: price,
        });
      } else {
        newData.push(row);
      }

      this.setState({ data: newData, editingKey: '' });
    });
  };

  edit = (key) => {
    this.setState({ editingKey: key });
  };

  renderOption = (item) => {
    return (
      <Option key={item.sku_id}>
        <div className="global-search-item">{item.name + '   ' + item.properties_name_json + ' 库存:' + item.quantity}</div>
      </Option>
    );
  };

  @debounce(150)
  handleSearch = (value) => {
    const { id } = this.props;

    value
      ? request('/api/local_order_management/goods_select', {
          method: 'post',
          body: { id: id, name: value },
        }).then((payload) => this.setState({ GoodsSource: payload.pageData }))
      : [];
  };

  onSelect = (value) => {
    const { GoodsSource, data } = this.state;

    if (data.length) {
      data.every((item) => item.sku_id != value)
        ? this.setState({
            data: data.concat({
              ...GoodsSource.filter((item) => value == item.sku_id)[0],
              count: 1,
              price_num: GoodsSource.filter((item) => value == item.sku_id)[0].price,
            }),
          })
        : message.error('请勿重复添加!');
    } else {
      this.setState({
        data: data.concat({
          ...GoodsSource.filter((item) => value == item.sku_id)[0],
          count: 1,
          price_num: GoodsSource.filter((item) => value == item.sku_id)[0].price,
        }),
      });
    }
    this.setState({ GoodsSource: [] });
  };

  hangup = () => {
    const { data, hangData } = this.state;

    const nextData = [...hangData, data];

    data.length && this.setState({ hangData: nextData, data: [] });

    localStorage.setItem('hangData', JSON.stringify(nextData));
  };

  resetHangUpOrder = (index) => {
    const { hangData, data } = this.state;

    const newData = [...hangData];
    const [value] = newData.splice(index, 1);

    this.setState({ data: value, hangData: newData });
    localStorage.setItem('hangData', JSON.stringify(newData));
  };

  resetTable = () => {
    this.setState({ data: [] });
  };

  render() {
    const { data, GoodsSource, hangData } = this.state;

    let sumCount = 0;
    let sumAmount = 0;
    let sumPay = 0;
    const components = {
      body: {
        cell: EditableCell,
      },
    };

    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record) => {
          return {
            record,
            min: col.min,
            max: col.max,
            step: col.step,
            inputType: col.dataIndex === 'price' || col.dataIndex === 'count' ? 'number' : 'text',
            dataIndex: col.dataIndex,
            title: col.title,
            editing: this.isEditing(record),
          };
        },
      };
    });

    data.length &&
      data.forEach((item) => {
        sumCount += Number(item.count);
        sumAmount = (Number(sumAmount) + Number(item.price_num)).toFixed(2);
        sumPay = item.newPrice_num
          ? (Number(sumPay) + Number(item.newPrice_num)).toFixed(2)
          : (Number(sumPay) + Number(item.price_num)).toFixed(2);
      });

    return (
      <EditableContext.Provider value={this.props.form}>
        <h2 className="title">
          <span>合计</span>
        </h2>
        <div className={`${styles.total} fn-clear`}>
          <div>
            件数：<span>{sumCount}</span>
          </div>
          <div>
            应付金额：<span>{`￥${formatThousands(sumAmount)}`}</span>
          </div>
          <div>
            实付金额：<span>{`￥${formatThousands(sumPay)}`}</span>
          </div>
        </div>
        <div className={styles.actions}>
          <PayDrawer
            id={this.props.id}
            sumAmount={sumAmount}
            sumCount={sumCount}
            sumPay={sumPay}
            yztoken={this.props.yztoken}
            data={data}
            onChange={this.resetTable}
          ></PayDrawer>
          <Button type="danger" onClick={this.hangup}>
            挂单
          </Button>
          <HangUpOrder disabled={data.length} data={hangData} onChange={(value) => this.resetHangUpOrder(value)}></HangUpOrder>
        </div>
        <AutoComplete
          className="global-search"
          size="large"
          style={{ width: '100%', marginBottom: 24 }}
          dataSource={GoodsSource.map(this.renderOption)}
          onSelect={this.onSelect}
          onSearch={this.handleSearch}
          placeholder="条码/自编码/名称/首字母/价格"
          optionLabelProp="text"
        >
          <Input suffix={<Icon type="search" />} />
        </AutoComplete>
        <Table
          rowKey="sku_id"
          components={components}
          dataSource={data}
          columns={columns}
          rowClassName="editable-row"
          pagination={{
            onChange: this.cancel,
          }}
        />
      </EditableContext.Provider>
    );
  }
}

class HangUpOrder extends React.PureComponent {
  state = { visible: false, checkedNum: null };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = (e) => {
    const { data, onChange } = this.props;
    const { checkedNum } = this.state;

    this.setState({
      visible: false,
    });

    onChange && onChange(checkedNum);
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };

  handleClick = (value) => {
    this.setState({ checkedNum: value });
  };

  render() {
    const { data, disabled } = this.props;

    return (
      <Fragment>
        <Button type="success" disabled={disabled} onClick={this.showModal}>
          恢复订单
        </Button>
        <Modal
          className={styles.hangUpOrder}
          width={1000}
          style={{ height: 600 }}
          title="挂起订单"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <ul>
            {data != [] &&
              data.map((item, index) => (
                <li
                  key={index}
                  onClick={() => this.handleClick(index)}
                  className={this.state.checkedNum == index ? styles.checked : ''}
                >
                  <div>
                    <i>{index + 1}</i>
                    <div key={index}>
                      {item.map((order) => (
                        <p key={order.sku_id}>{order.name}</p>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </Modal>
      </Fragment>
    );
  }
}

class PayDrawer extends React.Component {
  state = {
    GuideSource: [],
    VipSource: [],
    staff_id: '',
    staff_name: '',
    vip_id: '',
    vip_name: '',
    value: 1,
    userSettingDiscount: 1,
  };

  onChange = (e) => {
    this.setState({
      value: e.target.value,
    });
  };

  handleDiscountChange = (val) => {
    this.setState({
      userSettingDiscount: val,
    });
  };

  @debounce(150)
  handleGuideSearch = (value) => {
    const { id } = this.props;

    value
      ? request('/api/select_employess', {
          method: 'post',
          body: { id: id, name: value },
        }).then((payload) => this.setState({ GuideSource: payload.pageData }))
      : [];
  };

  @debounce(150)
  handleVipSearch = (value) => {
    const { id } = this.props;

    value
      ? request('/api/select_vipuser', {
          method: 'post',
          body: { id: id, name: value },
        }).then((payload) => this.setState({ VipSource: payload.pageData }))
      : [];
  };

  renderGuideOption = (item) => {
    return (
      <Option key={item.staff_id}>
        <div className="global-search-item">{item.staff_name + ' ' + item.staff_id}</div>
      </Option>
    );
  };
  renderVipOption = (item) => {
    return (
      <Option key={item.vip_id}>
        <div className="global-search-item">{item.vip_id + ' ' + item.vip_name}</div>
      </Option>
    );
  };

  onGuideSelect = (value) => {
    const { GuideSource } = this.state;
    const GuideInfo = GuideSource.filter((item) => item.staff_id == value)[0];
    this.setState({ staff_id: GuideInfo.staff_id, staff_name: GuideInfo.staff_name });
  };

  onVipSelect = (value) => {
    const { VipSource } = this.state;
    const VipInfo = VipSource.filter((item) => item.vip_id == value)[0];
    this.setState({ vip_id: VipInfo.vip_id, vip_name: VipInfo.vip_name });
  };

  resetData = () => {
    this.setState({ staff_id: '', staff_name: '', vip_id: '', value: 1, userSettingDiscount: 1 });
  };

  resetOutTable = () => {
    const { onChange } = this.props;

    message.success('结账成功');
    onChange && onChange();
  };

  render() {
    const { GuideSource, VipSource, staff_id, staff_name, vip_id, userSettingDiscount, value } = this.state;
    const { sumAmount, sumPay, sumCount, data } = this.props;

    return (
      <FormDrawer
        className={styles.PayDrawer}
        action="/api/order_management/insert"
        title="结账"
        filter={(data) => ({
          id: this.props.id,
          yz_token_info: this.props.yztoken,
          ...data,
        })}
        afterVisibleChange={this.resetData}
        data={{ skus: this.props.data }}
        onSubmit={this.resetOutTable}
        trigger={<Button type="primary">结账</Button>}
        headers={{ 'Content-Type': 'application/json' }}
      >
        {({ form }) => {
          const { getFieldDecorator } = form;
          return (
            <Fragment>
              <section>
                <p>导购员搜索:</p>
                <AutoComplete
                  className="global-search"
                  style={{ width: '100%', marginBottom: 24 }}
                  dataSource={GuideSource.map(this.renderGuideOption)}
                  onSelect={this.onGuideSelect}
                  onSearch={this.handleGuideSearch}
                  placeholder="导购员id/姓名"
                  optionLabelProp="text"
                >
                  <Input suffix={<Icon type="search" />} />
                </AutoComplete>
              </section>
              <section>
                <p>会员搜索:</p>
                <AutoComplete
                  className="global-search"
                  style={{ width: '100%', marginBottom: 24 }}
                  dataSource={VipSource.map(this.renderVipOption)}
                  onSelect={this.onVipSelect}
                  onSearch={this.handleVipSearch}
                  placeholder="	会员id/姓名/电话/模糊查询"
                  optionLabelProp="text"
                >
                  <Input suffix={<Icon type="search" />} />
                </AutoComplete>
              </section>
              <section>
                <FormItem label="导购员姓名">
                  {getFieldDecorator('staff_name', {
                    initialValue: staff_name,
                  })(<Input disabled></Input>)}
                </FormItem>
              </section>
              <section>
                <FormItem label="导购员id">
                  {getFieldDecorator('staff_id', {
                    initialValue: staff_id,
                  })(<Input disabled></Input>)}
                </FormItem>
              </section>
              <section>
                <FormItem label="会员id">
                  {getFieldDecorator('vip_id', {
                    initialValue: vip_id,
                  })(<Input disabled></Input>)}
                </FormItem>
              </section>
              <section>
                <FormItem label="实付金额">
                  {getFieldDecorator('pur_sal', {
                    initialValue: sumPay,
                    rules: [{ required: true }],
                  })(<Input disabled suffix="元"></Input>)}
                </FormItem>
              </section>
              <section>
                <FormItem label="订单内商品数量">
                  {getFieldDecorator('pur_num', {
                    initialValue: sumCount,
                    rules: [{ required: true }],
                  })(<Input disabled></Input>)}
                </FormItem>
              </section>
              <section>
                <FormItem label="支付方式">
                  {getFieldDecorator('pay_type', {
                    rules: [{ required: true, message: '请选择支付方式' }],
                  })(
                    <Select placeholder="请选择支付方式">
                      <Option value={1}>支付宝</Option>
                      <Option value={2}>微信</Option>
                      <Option value={3}>银联</Option>
                      <Option value={4}>其他</Option>
                    </Select>
                  )}
                </FormItem>
              </section>
              <FormItem label="整单折扣">
                {getFieldDecorator('order_discount', {
                  initialValue: 1,
                  rules: [{ required: true, message: '请选择或输入整单折扣' }],
                })(
                  <Radio.Group onChange={this.onChange}>
                    <Radio value={1}>不打折</Radio>
                    <Radio value={0.9}>9折</Radio>
                    <Radio value={0.8}>8折</Radio>
                    <Radio value={0.7}>7折</Radio>
                    <Radio value={0.5}>5折</Radio>
                    <Radio value={0}>
                      自定义折扣
                      {this.state.value == 0 && (
                        <InputNumber
                          min={0}
                          max={1}
                          precision={2}
                          placeholder="自定义折扣"
                          value={this.state.userSettingDiscount}
                          style={{ width: 120, marginLeft: 15 }}
                          onChange={this.handleDiscountChange}
                        ></InputNumber>
                      )}
                    </Radio>
                  </Radio.Group>
                )}
              </FormItem>
              <FormItem label="优惠价格">
                {getFieldDecorator('sal', {
                  initialValue:
                    value == 0 ? parseFloat(sumPay * userSettingDiscount).toFixed(2) : parseFloat(sumPay * value).toFixed(2),
                  rules: [{ required: true, message: '请输入最终优惠价格' }],
                })(
                  <Input
                    placeholder="请输入最终优惠价格"
                    min={0}
                    suffix="元"
                    prefix="￥"
                    style={{ width: '100%', color: '#fc5050', fontSize: 16 }}
                  />
                )}
              </FormItem>
              <FormItem label="商品明细">
                <div className={styles.goodsTitle}>
                  <span>商品</span>
                  <span>规格</span>
                  <span>数量*单价</span>
                  <span>优惠价</span>
                </div>
                {data.map((item) => (
                  <div key={item.item_id} className={styles.goodsDetails}>
                    <span className="textEdit">{item.name}</span>
                    <span>{item.properties_name_json}</span>
                    <span className="textHighLight">{item.price + '*' + item.count}</span>
                    <span className="textHighLight">{item.newPrice_num ? item.newPrice_num : item.price_num}</span>
                  </div>
                ))}
              </FormItem>
            </Fragment>
          );
        }}
      </FormDrawer>
    );
  }
}

export default class App extends React.Component {
  render() {
    return (
      <div className={styles.cashCenter}>
        <EditableTable
          user_id={this.props.id}
          user_name={this.props.user_name}
          id={this.props.id}
          yztoken={this.props.yztoken}
        ></EditableTable>
      </div>
    );
  }
}
