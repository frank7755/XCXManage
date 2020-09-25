import React, { Fragment } from 'react';
import request from '~js/utils/request';
import { formatThousands, debounce } from '~js/utils/utils';
import styles from '~css/Data/SellData.module.less';
import moment from 'moment';
import FormSearch from '~js/components/FormSearch/';
import { Table, Row, Col, DatePicker, Button, Modal, Form } from 'antd';
import { G2, Chart, Geom, Axis, Tooltip, Coord, Label, Legend, View, Guide, Shape, Facet, Util } from 'bizcharts';
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

const { RangePicker } = DatePicker;
const FormItem = Form.Item;

export default class App extends React.Component {
  state = {
    source: [],
    data: {}
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

  handleSearch = ({ dateRange = [], ...rest }) => {
    const [start_time, end_time] = dateRange;

    const { id } = this.props;

    request('/api/BI/select', {
      method: 'post',
      body: {
        id: id,
        start_time: start_time,
        end_time: end_time,
        type: 1
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
        return row;
      }
    }).transform({
      type: 'fold',
      fields: ['销售额', '退货额'],
      // 展开字段集
      key: '销售类型',
      // key字段
      value: 'value' // value字段
    });

    return (
      <div className={styles.sellData}>
        <FormSearch onSearch={this.handleSearch}>
          {({ form }) => {
            const { getFieldDecorator } = form;

            return (
              <Fragment>
                <h2 className="title">
                  <span>销售额</span>
                </h2>
                <Row gutter={32}>
                  <Col>
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
                <div className={styles.amount}>
                  <span>
                    总销售额:<span className="textSuccess">{`￥${formatThousands(data.save_sum)}`}</span>
                  </span>
                  <span>
                    总退货额:<span className="textDelete">{`￥${formatThousands(data.return_sum)}`}</span>
                  </span>
                </div>
                <div className={styles.chart}>
                  <Chart height={400} data={dv} forceFit scale={{ date: { type: 'timeCat' } }}>
                    <Legend />
                    <Axis name="value" position={'bottom'} />
                    <Axis
                      name="date"
                      label={{
                        offset: 12
                      }}
                    />
                    <Tooltip />
                    <Geom
                      type="interval"
                      position="date*value"
                      color={'销售类型'}
                      adjust={[
                        {
                          type: 'dodge',
                          marginRatio: 1 / 32
                        }
                      ]}
                    />
                  </Chart>
                </div>
              </Fragment>
            );
          }}
        </FormSearch>
      </div>
    );
  }
}
