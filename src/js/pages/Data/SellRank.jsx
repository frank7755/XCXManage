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
const { RangePicker } = DatePicker;

class SingleTable extends React.Component {
  state = { visible: false, source: [], data: {} };

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

  showModal = () => {
    this.setState({
      visible: true
    });

    request('/api/BI/select', {
      method: 'post',
      body: {
        ...this.props,
        type: 3
      }
    }).then(payload => this.setState({ source: payload.pageData, data: payload }));
  };

  handleChange = pagination => {
    request('/api/BI/select', {
      method: 'post',
      body: {
        ...this.props,
        type: 3,
        page: pagination.current,
        pageSize: pagination.pageSize
      }
    }).then(payload => this.setState({ source: payload.pageData, data: payload }));
  };

  handleCancel = e => {
    this.setState({
      visible: false
    });
  };

  render() {
    const { visible, data, source } = this.state;

    return (
      <Fragment>
        <a onClick={this.showModal}>{this.props.name}</a>
        <Modal title="单日销量" visible={visible} width={800} onCancel={this.handleCancel}>
          <Table
            rowKey="date"
            dataSource={source}
            pagination={{ page: data.page, pageSize: data.pageSize, total: data.total }}
            onChange={pagination => this.handleChange(pagination)}
            columns={this.columns}
          ></Table>
        </Modal>
      </Fragment>
    );
  }
}

@serveTable()
class RankTable extends React.Component {
  state = {
    start_time: null,
    end_time: null
  };
  columns = [
    {
      title: '排行',
      width: 60,
      dataIndex: 'rank',
      render(val, record, index) {
        return index + 1;
      }
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      render: (val, record) => {
        return (
          <SingleTable
            name={val}
            item_id={record.item_id}
            id={this.props.id}
            start_time={this.state.start_time}
            end_time={this.state.end_time}
          ></SingleTable>
        );
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

  handleSearch = ({ dateRange = [], ...rest }) => {
    const [start_time, end_time] = dateRange;

    this.setState({
      start_time,
      end_time
    });

    const { table, id } = this.props;

    table.search({ id, type: 2, start_time, end_time, ...rest }, { ...table.pagination, current: 1 });
  };

  refresh = () => {
    this.props.table.search();
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

  render() {
    const { table, ...restProps } = this.props;

    return (
      <div className={styles.sellRank}>
        <h2 className="title">
          <span>销售排行</span>
        </h2>
        <FormSearch onSearch={this.handleSearch}>
          {({ form }) => {
            const { getFieldDecorator } = form;
            return (
              <Fragment>
                <Row gutter={32}>
                  <Col span={8}>
                    <FormItem label="商品搜索">{getFieldDecorator('name', {})(<Input type="text"></Input>)}</FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem label="选择日期">
                      {getFieldDecorator('dateRange', {
                        initialValue: getLast7Days()
                      })(
                        <RangePicker allowClear={false} style={{ width: 'calc(100% - 80px)' }} ranges={this.getDateRanges()} />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={32} style={{ marginBottom: 24 }}>
                  <Col span={8}>
                    <Button htmlType="submit" type="primary" style={{ marginRight: 10 }}>
                      查询
                    </Button>
                    <Button htmlType="reset">重置</Button>
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
      </div>
    );
  }
}

export default class App extends React.Component {
  render() {
    const { id } = this.props;

    return (
      <div className={styles.sellSearch}>
        <RankTable id={id} source="/api/BI/select"></RankTable>
      </div>
    );
  }
}
