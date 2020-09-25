import React, { Fragment } from 'react';
import request from '~js/utils/request';
import { formatThousands, debounce } from '~js/utils/utils';
import styles from '~css/Data/SellAnalysis.module.less';
import moment from 'moment';
import FormSearch from '~js/components/FormSearch/';
import { Table, Row, Col, DatePicker, Button, Form } from 'antd';
import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts';
import DataSet from '@antv/data-set';
import {
  getCurrMonth,
  getCurrWeek,
  getDatePickerValue,
  getLastWeek,
  getToday,
  getLast7Days,
  getYesterday
} from '~js/utils/date-fns';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

export default class App extends React.Component {
  state = {
    source: [],
    data: {},
    start_time: null,
    end_time: null
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

  columns = [
    {
      title: '时间',
      dataIndex: 'date',
      render: (val, record) => {
        return moment(val).format('YYYY-MM-DD');
      }
    },
    {
      title: '客单价',
      dataIndex: 'Customer_unit_price',
      render(val) {
        return `￥ ${formatThousands(val)}`;
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

  handleChange = () => {
    const { start_time, end_time } = this.state;

    request('/api/BI/select', {
      method: 'post',
      body: {
        start_time,
        end_time,
        type: 4,
        id: this.props.id,
        page: pagination.current,
        pageSize: pagination.pageSize
      }
    }).then(payload => this.setState({ source: payload.pageData, data: payload }));
  };

  handleSearch = ({ dateRange = [], ...rest }) => {
    const [start_time, end_time] = dateRange;

    const { id } = this.props;

    this.setState({ start_time, end_time });

    request('/api/BI/select', {
      method: 'post',
      body: {
        id: id,
        start_time: start_time,
        end_time: end_time,
        type: 4
      }
    }).then(payload => this.setState({ source: payload.pageData, data: payload }));
  };

  render() {
    const { source, data } = this.state;
    const ds = new DataSet();
    const dv = ds.createView().source(source);

    dv.transform({
      type: 'map',
      callback(row) {
        // 加工数据后返回新的一行，默认返回行数据本身
        row['销售额'] = row.Sales_volume;
        row['退货额'] = row.Return_amount;
        row['客单价'] = row.Customer_unit_price;
        row['销售量'] = row.salces_count;
        row['退货量'] = row.return_count;
        return row;
      }
    }).transform({
      type: 'fold',
      fields: ['销售额', '退货额', '客单价', '销售量', '退货量'],
      // 展开字段集
      key: '销售类型',
      // key字段
      value: 'value' // value字段
    });

    return (
      <div className={styles.sellAnalysis}>
        <h2 className="title">
          <span>经营分析</span>
        </h2>
        <FormSearch onSearch={this.handleSearch} className={styles.search}>
          {({ form }) => {
            const { getFieldDecorator } = form;

            return (
              <Fragment>
                <Row gutter={32}>
                  <Col span={8}>
                    <FormItem label="选择时间">
                      {getFieldDecorator('dateRange', {
                        initialValue: getLast7Days()
                      })(<RangePicker allowClear={false} ranges={this.getDateRanges()} />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={32}>
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
        <div className={styles.amount}>
          <span>
            总销售额:<span className="textSuccess">{`￥${formatThousands(data.save_sum)}`}</span>
          </span>
          <span>
            总退货额:<span className="textDelete">{`￥${formatThousands(data.return_sum)}`}</span>
          </span>
        </div>
        <div className={styles.chart}>
          <Chart height={400} data={dv} scale={{ date: { type: 'timeCat' } }} forceFit>
            <Legend />
            <Axis name="date" />
            <Axis name="value" />
            <Tooltip></Tooltip>
            <Geom type="line" position="date*value" size={2} color={'销售类型'} shape={'smooth'} />
            <Geom
              type="point"
              position="date*value"
              tooltip={['date * value']}
              size={4}
              shape={'circle'}
              color={'销售类型'}
              style={{
                stroke: '#fff',
                lineWidth: 1
              }}
            />
          </Chart>
        </div>
        <div className={styles.table}>
          <Table
            rowKey="date"
            dataSource={source}
            pagination={{ page: data.page, pageSize: data.pageSize, total: data.total }}
            onChange={pagination => this.handleChange(pagination)}
            columns={this.columns}
          ></Table>
        </div>
      </div>
    );
  }
}
