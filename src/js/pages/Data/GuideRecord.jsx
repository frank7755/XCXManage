import React, { Fragment } from 'react';
import request from '~js/utils/request';
import { formatThousands, debounce } from '~js/utils/utils';
import styles from '~css/Data/GuideRecord.module.less';
import FormSearch from '~js/components/FormSearch/';
import moment from 'moment';
import serveTable from '~js/components/serveTable';
import { Statistic, Row, Col, Button, Table, DatePicker, Pagination, Popconfirm, message, Input, Form } from 'antd';

const { RangePicker } = DatePicker;
const FormItem = Form.Item;

@serveTable()
class RecordTable extends React.Component {
  handleSearch = ({ dateRange = [], ...rest }) => {
    const [start_time, end_time] = dateRange;

    const { table, id } = this.props;

    table.search({ id, start_time, end_time, type: 5, ...rest }, { ...table.pagination, current: 1 });
  };

  refresh = () => {
    this.props.table.search();
  };

  columns = [
    {
      title: '日期',
      dataIndex: 'date',
      render(val) {
        return moment(val).format('YYYY-MM');
      }
    },
    {
      title: '销售额',
      dataIndex: 'Sales_volume',
      render: val => {
        return `￥${formatThousands(val)}`;
      }
    },
    {
      title: '销售数量',
      dataIndex: 'salces_count'
    }
  ];

  render() {
    const { table, ...restProps } = this.props;

    return (
      <Fragment>
        <div className={styles.details}>
          <h2 className="title">
            <span>业绩分析</span>
          </h2>
          <FormSearch prefetch={false} onSearch={this.handleSearch} className={styles.search}>
            {({ form }) => {
              const { getFieldDecorator } = form;

              return (
                <Fragment>
                  <Row gutter={32}>
                    <Col span={8}>
                      <FormItem label="选择日期">
                        {getFieldDecorator('dateRange', {
                          initialValue: [moment().subtract(1, 'year'), moment()],
                          rules: [{ required: true, message: '请选择日期' }]
                        })(<RangePicker style={{ width: '100%' }}></RangePicker>)}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem label="员工id">
                        {getFieldDecorator('staff_id', {
                          rules: [{ required: true, message: '请输入员工id' }]
                        })(<Input type="text"></Input>)}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row style={{ marginBottom: 24 }}>
                    <Col span={8}>
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
            response={table.response}
            dataSource={table.getDataSource()}
            loading={table.loading && { delay: 150 }}
          ></Table>
        </div>
      </Fragment>
    );
  }
}

export default class App extends React.Component {
  render() {
    return (
      <div className={styles.propetyDetails}>
        <RecordTable id={this.props.id} source="/api/BI/select"></RecordTable>
      </div>
    );
  }
}
