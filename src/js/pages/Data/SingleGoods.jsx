import React, { Fragment } from 'react';
import request from '~js/utils/request';
import { formatThousands, debounce } from '~js/utils/utils';
import styles from '~css/Data/SingleGoods.module.less';
import moment from 'moment';
import { Table, Row, Col, DatePicker, Button, Form, AutoComplete, Input, Icon } from 'antd';
import {
  getCurrMonth,
  getCurrWeek,
  getDatePickerValue,
  getLastWeek,
  getToday,
  getLast7Days,
  getYesterday
} from '~js/utils/date-fns';

const { Option } = AutoComplete;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;

@Form.create()
export default class App extends React.Component {
  state = {
    GoodsSource: [],
    selectedValue: '',
    dataSource: [],
    tableSource: [],
    start_time: '',
    end_time: '',
    data: {}
  };

  columns = [
    {
      title: '时间',
      dataIndex: 'date',
      render: (val, record) => {
        return moment(val).format('YYYY-MM-DD');
      }
    },
    {
      title: '销售额',
      dataIndex: 'Sales_volume',
      render(val) {
        return `￥ ${formatThousands(val)}`;
      }
    },
    {
      title: '退货额',
      dataIndex: 'Return_amount',
      render(val) {
        return `￥ ${formatThousands(val)}`;
      }
    },
    {
      title: '销售量',
      dataIndex: 'salces_count'
    },
    {
      title: '退货量',
      dataIndex: 'return_count'
    }
  ];

  getDateRanges() {
    return {
      今天: getToday(),
      昨天: getYesterday(),
      本周: getCurrWeek(),
      上周: getLastWeek(),
      本月: getCurrMonth()
    };
  }

  @debounce(150)
  handleSearch = value => {
    const { id } = this.props;

    value
      ? request('/api/BI/select', {
          method: 'post',
          body: { id: id, name: value, type: 6 }
        }).then(payload => this.setState({ GoodsSource: payload.pageData }))
      : [];
  };

  renderOption = item => {
    return <Option key={item.item_id}>{'商品名称:' + item.name + ' ' + '商品编号:' + item.item_id}</Option>;
  };

  onSelect = value => {
    const { GoodsSource } = this.state;
    const GuideInfo = GoodsSource.filter(item => item.item_id == value)[0];

    this.setState({ selectedValue: GuideInfo.item_id });
  };

  handleSubmit = e => {
    e.preventDefault();

    this.props.form.validateFields((error, values) => {
      const [start_time, end_time] = values.dateRange;
      const { selectedValue } = this.state;
      const { id } = this.props;

      if (!error) {
        this.setState({ start_time, end_time });

        request('/api/BI/select', {
          method: 'post',
          body: { id: id, item_id: selectedValue, start_time, end_time, type: 3 }
        }).then(payload => {
          this.setState({ tableSource: payload.pageData, data: payload });
          this.props.form.resetFields();
        });
      }
    });
  };

  handleReset = () => {
    const { form } = this.props;

    form.resetFields();

    this.props.form.validateFields((error, values) => {
      const [start_time, end_time] = values.dateRange;
      const { selectedValue } = this.state;
      const { id } = this.props;

      if (!error) {
        this.setState({ start_time, end_time });

        request('/api/BI/select', {
          method: 'post',
          body: { id: id, item_id: selectedValue, start_time, end_time, type: 3 }
        }).then(payload => {
          this.setState({ tableSource: payload.pageData, data: payload });
          this.props.form.resetFields();
        });
      }
    });
  };

  handleChange = pagination => {
    const { start_time, end_time } = this.state;

    request('/api/BI/select', {
      method: 'post',
      body: {
        start_time,
        end_time,
        type: 3,
        id: this.props.id,
        page: pagination.current,
        pageSize: pagination.pageSize
      }
    }).then(payload => this.setState({ tableSource: payload.pageData, data: payload }));
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { GoodsSource, tableSource, data } = this.state;

    return (
      <div className={styles.singleGoods}>
        <h2 className="title">
          <span>单品销售查询</span>
        </h2>

        <Row gutter={32} style={{ marginTop: 24, marginBottom: 24 }}>
          <Col span={8}>
            <span className={styles.rowItem}>
              <label>模糊查询：</label>
              <AutoComplete
                className="global-search"
                style={{ width: 'calc(100% - 80px)' }}
                dataSource={GoodsSource.map(this.renderOption)}
                onSelect={this.onSelect}
                onSearch={this.handleSearch}
                placeholder="条码/自编码/名称/首字母/价格"
              >
                <Input suffix={<Icon type="search" />} />
              </AutoComplete>
            </span>
          </Col>
          <Form onSubmit={this.handleSubmit} onReset={this.handleReset}>
            <Col span={8}>
              <span className={styles.rowItem}>
                <label>选择时间：</label>
                {getFieldDecorator('dateRange', {
                  initialValue: getLast7Days()
                })(<RangePicker style={{ width: 'calc(100% - 80px)' }} allowClear={false} ranges={this.getDateRanges()} />)}
              </span>
            </Col>
            <Col span={8}>
              <span className={styles.rowItem}>
                <Button htmlType="submit" type="primary" style={{ marginRight: 10 }}>
                  查询
                </Button>
                <Button htmlType="reset">重置</Button>
              </span>
            </Col>
          </Form>
        </Row>
        <Table
          rowKey="date"
          pagination={{ page: data.page, pageSize: data.pageSize, total: data.total }}
          onChange={pagination => this.handleChange(pagination)}
          columns={this.columns}
          dataSource={tableSource}
        ></Table>
      </div>
    );
  }
}
