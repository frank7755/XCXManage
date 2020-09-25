import React, { Fragment } from 'react';
import moment from 'moment';
import { formatThousands, debounce } from '~js/utils/utils';
import request from '~js/utils/request';
import styles from '~css/Cash/SellSearch.module.less';
import FormSearch from '~js/components/FormSearch/';
import { Button, Modal, Form, Input, message, DatePicker, Select, Row, Col, Table, AutoComplete, Icon } from 'antd';
import {
  getCurrMonth,
  getCurrWeek,
  getDatePickerValue,
  getLastWeek,
  getToday,
  getLast7Days,
  getYesterday
} from '~js/utils/date-fns';
import serveTable from '~js/components/serveTable';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;

@Form.create()
class ReturnGoods extends React.Component {
  state = {
    visible: false,
    GuideSource: [],
    staff_id: '',
    staff_name: ''
  };

  showModal = () => {
    this.setState({
      visible: true
    });
  };

  handleOk = () => {
    const { onChange } = this.props;
    this.props.form.validateFields((error, values) => {
      const { orderNum, pay_type } = this.props;
      if (!error) {
        request('/api/order_management/del', {
          method: 'post',
          body: {
            id: this.props.id,
            pur_no: orderNum,
            pay_type: pay_type,
            yz_token_info: this.props.yztoken,
            ...values,
            ...this.props.record
          }
        }).then(payload => {
          this.setState({ visible: false });
          message.success('退货成功');
          this.props.form.resetFields();
          onChange && onChange();
        });
      } else {
        message.error('请填写必填项!');
        this.props.form.resetFields();
      }
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false
    });
  };

  @debounce(150)
  handleGuideSearch = value => {
    const { id } = this.props;

    value
      ? request('/api/select_employess', {
          method: 'post',
          body: { id: id, name: value }
        }).then(payload => this.setState({ GuideSource: payload.pageData }))
      : [];
  };

  onGuideSelect = value => {
    const { GuideSource } = this.state;
    const GuideInfo = GuideSource.filter(item => item.staff_id == value)[0];
    this.setState({ staff_id: GuideInfo.staff_id, staff_name: GuideInfo.staff_name });
  };

  renderGuideOption = item => {
    return (
      <Option key={item.staff_id}>
        <div className="global-search-item">{item.staff_name + ' ' + item.staff_id}</div>
      </Option>
    );
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { visible, staff_name, staff_id, GuideSource } = this.state;

    return (
      <Fragment>
        <Button disabled={this.props.record.free_status != 1} onClick={this.showModal}>
          退货
        </Button>
        <Modal title="员工选择" width={500} visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
          <Form>
            <FormItem label="导购员搜索">
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
            </FormItem>
            <FormItem label="导购员姓名">
              {getFieldDecorator('staff_name', {
                initialValue: staff_name,
                rules: [
                  {
                    required: true,
                    message: '请搜索并填写导购员姓名'
                  }
                ]
              })(<Input disabled></Input>)}
            </FormItem>
            <FormItem label="导购员id">
              {getFieldDecorator('staff_id', {
                initialValue: staff_id,
                rules: [
                  {
                    required: true,
                    message: '请搜索并填写导购员id'
                  }
                ]
              })(<Input disabled></Input>)}
            </FormItem>
            <FormItem label="退货金额">
              {getFieldDecorator('return_num', {
                initialValue: this.props.newPrice_num,
                rules: [
                  {
                    required: true,
                    message: '请填写退货金额'
                  }
                ]
              })(<Input type="text"></Input>)}
            </FormItem>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

class GoodsDetails extends React.Component {
  state = {
    visible: false,
    data: []
  };

  columns = [
    {
      title: '商品编号',
      dataIndex: 'sku_id'
    },
    {
      title: '商品名称',
      dataIndex: 'name'
    },
    {
      title: '商品规格',
      dataIndex: 'properties_name_json'
    },
    {
      title: '商品数量',
      dataIndex: 'count',
      align: 'center'
    },
    {
      title: '商品单价',
      dataIndex: 'price',
      render(val) {
        return `￥ ${formatThousands(val)}`;
      }
    },
    {
      title: '实付金额',
      dataIndex: 'newPrice_num',
      render(val) {
        return `￥ ${formatThousands(val)}`;
      }
    },
    {
      title: '操作',
      dataIndex: '退货',
      align: 'center',
      render: (val, record) => (
        <ReturnGoods
          id={this.props.id}
          yztoken={this.props.yztoken}
          orderNum={this.props.orderNum}
          pay_type={this.props.pay_type}
          newPrice_num={record.newPrice_num}
          record={record}
          onChange={this.refreshTable}
        ></ReturnGoods>
      )
    }
  ];
  refreshTable = () => {
    request('/api/order_management/select', {
      method: 'post',
      body: {
        id: this.props.id,
        pur_no: this.props.orderNum,
        type: this.props.type
      }
    }).then(payload => this.setState({ data: payload.pageData.skus }));
  };

  showModal = () => {
    this.setState({
      visible: true
    });

    request('/api/order_management/select', {
      method: 'post',
      body: {
        id: this.props.id,
        pur_no: this.props.orderNum,
        type: this.props.type
      }
    }).then(payload => this.setState({ data: payload.pageData.skus }));
  };

  handleOk = () => {
    this.setState({ visible: false });
  };

  handleCancel = e => {
    this.setState({
      visible: false
    });
  };

  render() {
    const { visible, data } = this.state;

    return (
      <Fragment>
        <Button type="link" onClick={this.showModal}>
          查看详情
        </Button>
        <Modal title="订单详情" width={1200} visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
          <Table rowKey="sku_id" columns={this.columns} dataSource={data} pagination={false}></Table>
        </Modal>
      </Fragment>
    );
  }
}

@serveTable()
class SearchTable extends React.Component {
  columns = [
    {
      title: '订单号',
      dataIndex: 'pur_no'
    },
    {
      title: '订单金额',
      dataIndex: 'pur_sal',
      render(val) {
        return `￥ ${formatThousands(val)}`;
      }
    },
    {
      title: '实付金额',
      dataIndex: 'sal',
      render(val) {
        return `￥ ${formatThousands(val)}`;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      render(val) {
        return moment(val).format('YYYY-MM-DD');
      }
    },
    {
      title: '订单类型',
      dataIndex: 'status',
      render(val) {
        return val == 0 ? '销售' : '退货';
      }
    },
    {
      title: '操作',
      dataIndex: 'option',
      align: 'center',
      render: (val, record) => {
        return (
          <GoodsDetails
            id={this.props.id}
            orderNum={record.pur_no}
            pay_type={record.pay_type}
            type={2}
            yztoken={this.props.yztoken}
          ></GoodsDetails>
        );
      }
    }
  ];

  handleSearch = ({ dateRange = [], ...rest }) => {
    const [start_time, end_time] = dateRange;

    const { table, id } = this.props;

    table.search({ id, type: 1, start_time, end_time, ...rest }, { ...table.pagination, current: 1 });
  };

  getDateRanges() {
    return {
      今天: getToday(),
      昨天: getYesterday(),
      本周: getCurrWeek(),
      上周: getLastWeek(),
      本月: getCurrMonth()
    };
  }

  refresh = () => {
    this.props.table.search();
  };
  render() {
    const { table, ...restProps } = this.props;

    return (
      <Fragment>
        <h2 className="title">
          <span>销售查询</span>
        </h2>
        <FormSearch onSearch={this.handleSearch} className={styles.search}>
          {({ form }) => {
            const { getFieldDecorator } = form;

            return (
              <Fragment>
                <Row gutter={32} style={{ marginBottom: 24 }}>
                  <Col span={8}>
                    <span className={styles.rowItem}>
                      <label>订单号：</label>
                      {getFieldDecorator('pur_no')(<Input placeholder="请输入订单号" style={{ width: 'calc(100% - 80px)' }} />)}
                    </span>
                  </Col>
                  <Col span={8}>
                    <span className={styles.rowItem}>
                      <label>订单类型：</label>
                      {getFieldDecorator('status', {
                        initialValue: 0
                      })(
                        <Select style={{ width: 'calc(100% - 80px)' }}>
                          <Option value={0}>销售</Option>
                          <Option value={1}>退货</Option>
                        </Select>
                      )}
                    </span>
                  </Col>
                  <Col span={8}>
                    <span className={styles.rowItem}>
                      <label>选择日期：</label>
                      {getFieldDecorator('dateRange', {
                        initialValue: [moment().subtract(1, 'year'), moment()]
                      })(
                        <RangePicker allowClear={false} style={{ width: 'calc(100% - 80px)' }} ranges={this.getDateRanges()} />
                      )}
                    </span>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <span className={styles.rowItem}>
                      <Button htmlType="submit" type="primary">
                        查询
                      </Button>
                      <Button htmlType="reset">重置</Button>
                    </span>
                  </Col>
                </Row>
              </Fragment>
            );
          }}
        </FormSearch>
        <Table
          {...restProps}
          rowKey={table.rowKey}
          columns={this.columns}
          onChange={table.onChange}
          pagination={table.pagination}
          bodyStyle={{ overflowX: 'auto' }}
          dataSource={table.getDataSource()}
          loading={table.loading && { delay: 150 }}
        ></Table>
      </Fragment>
    );
  }
}
export default class App extends React.Component {
  render() {
    const { id, yztoken } = this.props;

    return (
      <div className={styles.sellSearch}>
        <SearchTable id={id} yztoken={yztoken} source="/api/order_management/select"></SearchTable>
      </div>
    );
  }
}
