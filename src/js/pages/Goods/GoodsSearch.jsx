import React, { Fragment } from 'react';
import request from '~js/utils/request';
import { formatThousands } from '~js/utils/utils';
import moment from 'moment';
import { Link } from 'react-router-dom';
import styles from '~css/Goods/GoodsSearch.module.less';
import { store } from '~js/utils/utils';
import FormSearch from '~js/components/FormSearch/';
import serveTable from '~js/components/serveTable';
import {
  Input,
  DatePicker,
  Popconfirm,
  Col,
  Row,
  Button,
  Select,
  Table,
  Form,
  Drawer,
  message,
  Avatar,
  Modal,
  Cascader,
} from 'antd';
import {
  getCurrMonth,
  getCurrWeek,
  getDatePickerValue,
  getLastWeek,
  getToday,
  getLast7Days,
  getYesterday,
} from '~js/utils/date-fns';

const shopType = 'shopType';
const userId = 'userId';
const FormItem = Form.Item;
const InputGroup = Input.Group;
const { RangePicker } = DatePicker;
const { Option } = Select;

@Form.create()
class ChangeGroup extends React.Component {
  state = {
    visible: false,
    data: [],
  };

  showModal = () => {
    this.setState({ visible: true });
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
    this.props.form.resetFields();
  };

  confirm = () => {
    const { onChange } = this.props;

    this.props.form.validateFields((err, value) => {
      if (!err) {
        request('/api/t_goods/update_term', {
          method: 'post',
          body: {
            id: this.props.id,
            item_id: this.props.item_id,
            tag_ids: value.tag_ids[1],
          },
        })
          .then((paylaod) => {
            message.success('修改成功');
            onChange && onChange();
            this.setState({ visible: false });
          })
          .catch((error) => message.error(error.message));
      }
    });
  };

  render() {
    const { data } = this.state;
    const { getFieldDecorator } = this.props.form;

    return (
      <Fragment>
        <a style={{ margin: '0 5px' }} onClick={this.showModal}>
          改分组
        </a>
        <Modal
          className={styles.changeGroup}
          title="修改分组"
          onOk={this.confirm}
          visible={this.state.visible}
          onCancel={this.handleCancel}
        >
          <Form>
            <FormItem label="选择分组">
              {getFieldDecorator('tag_ids', {
                rules: [{ required: true, message: '请选择分组' }],
              })(<Cascader expandTrigger="hover" options={this.props.groupData} />)}
            </FormItem>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

@serveTable()
class GoodsTable extends React.Component {
  state = {
    goodSort: [],
  };

  columns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      width: 300,
      render(name, record) {
        return (
          <div className={styles.goodsName}>
            <Avatar
              src={record.pic_url}
              size={60}
              style={{ marginRight: 10, border: '1px solid #666' }}
              shape="square"
            ></Avatar>
            <a href={record.share_url} target="_blank" style={{ lineHeight: 1.5 }}>
              {name}
            </a>
          </div>
        );
      },
    },
    {
      title: '库存',
      dataIndex: 'quantity',
      width: 100,
    },

    {
      title: '价格',
      dataIndex: 'price',
      width: 150,
      render(seling_price) {
        return '￥' + formatThousands(seling_price);
      },
    },
    {
      title: '状态',
      dataIndex: 'is_display',
      width: 120,
      render(is_display) {
        return is_display == '1' ? (
          <span style={{ color: '#31c105' }}>已上架</span>
        ) : (
          <span style={{ color: '#fc5050' }}>未上架</span>
        );
      },
    },
    {
      title: '商品分组',
      dataIndex: 'tag_ids',
      width: 150,
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      width: 120,
      render(create_time) {
        return moment(create_time).format('YYYY-MM-DD');
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      width: 200,
      render: (option, record) => {
        return (
          <Fragment>
            <Link style={{ margin: '0 5px' }} to={`/goodsedit/${record.item_id}`}>
              编辑
            </Link>
            <ChangeGroup
              yztoken={this.props.yztoken}
              id={this.props.id}
              item_id={record.item_id}
              groupData={this.state.goodsSort}
              onChange={this.refresh}
            ></ChangeGroup>
            {record.is_display == 1 ? (
              <a style={{ margin: '0 5px' }} onClick={() => this.handleOff(this.props.id, record.item_id)}>
                下架
              </a>
            ) : (
              <a style={{ margin: '0 5px' }} onClick={() => this.handleOn(this.props.id, record.item_id)}>
                上架
              </a>
            )}
            <Popconfirm
              title="确定要删除商品吗？"
              okText="确认"
              cancelText="取消"
              onConfirm={() => this.handleDelete(this.props.id, record.item_id)}
            >
              <a style={{ margin: '0 5px', color: 'red' }}>删除</a>
            </Popconfirm>
          </Fragment>
        );
      },
    },
  ];

  componentDidMount() {
    request('/api/t_goods_fz_select', {
      method: 'post',
      body: {
        id: store.get(userId),
      },
    }).then((payload) => {
      this.setState({ goodsSort: payload.pageData });
    });
  }

  handleDelete = (id, item_id) => {
    request('/api/t_goods/delete', {
      method: 'post',
      body: {
        id: id,
        item_id: item_id,
        yz_token_info: this.props.yztoken,
      },
    })
      .then((payload) => {
        this.refresh();
        message.success('删除成功');
      })
      .catch((error) => message.error(error.message));
  };

  handleOn = (id, item_id) => {
    const { table } = this.props;

    request('/api/t_goods/upload_goods', {
      method: 'post',
      notify: true,
      body: {
        id: id,
        item_id: item_id,
        yz_token_info: this.props.yztoken,
      },
    })
      .then((payload) => {
        this.refresh();
      })
      .catch((error) => message.error(error.message));
  };

  handleOff = (id, item_id) => {
    const { table } = this.props;

    request('/api/t_goods/unload_goods', {
      method: 'post',
      notify: true,
      body: {
        id: id,
        item_id: item_id,
        yz_token_info: this.props.yztoken,
      },
    })
      .then((payload) => {
        this.refresh();
      })
      .catch((error) => message.error(error.message));
  };

  handleSearch = ({ dateRange = [], tag_ids = [], ...rest }) => {
    const { id } = this.props;
    const { table } = this.props;
    const [start_time, end_time] = dateRange;

    table.search({ ...rest, id, start_time, end_time, tag_ids: tag_ids[1] }, { ...table.pagination, current: 1 });
  };

  getDateRanges() {
    return {
      今天: getToday(),
      昨天: getYesterday(),
      本周: getCurrWeek(),
      上周: getLastWeek(),
      本月: getCurrMonth(),
    };
  }

  refresh = () => {
    this.props.table.search();
  };

  handleAdd = () => {
    const { history } = this.props;
    history.push('/goodsadd');
  };

  render() {
    const { table, supply, user_name, user_id, ...restProps } = this.props;
    const { goodsSort } = this.state;

    return (
      <Fragment>
        <h2 className="title">
          <span>商品</span>
          <Button type="primary" onClick={this.handleAdd}>
            添加商品
          </Button>
        </h2>
        <FormSearch onSearch={this.handleSearch}>
          {({ form }) => {
            const { getFieldDecorator } = form;
            return (
              <Fragment>
                <Row gutter={32}>
                  <Col span={8}>
                    <span className={styles.rowItem}>
                      <label>商品名称：</label>
                      {getFieldDecorator('name')(
                        <Input placeholder="名称，条形码，自编码..." style={{ width: 'calc(100% - 80px)' }} />
                      )}
                    </span>
                  </Col>
                  <Col span={8}>
                    <span className={styles.rowItem}>
                      <label>商品状态：</label>
                      {getFieldDecorator('is_display', { initialValue: -1 })(
                        <Select style={{ width: 'calc(100% - 80px)' }}>
                          <Option value={-1}>全部</Option>
                          <Option value={1}>已上架</Option>
                          <Option value={0}>未上架</Option>
                        </Select>
                      )}
                    </span>
                  </Col>
                  <Col span={8}>
                    <span className={styles.rowItem}>
                      <label>选择日期：</label>
                      {getFieldDecorator('dateRange', {
                        initialValue: [moment().subtract(1, 'year'), moment()],
                      })(
                        <RangePicker allowClear={false} style={{ width: 'calc(100% - 80px)' }} ranges={this.getDateRanges()} />
                      )}
                    </span>
                  </Col>
                </Row>
                <Row gutter={32}>
                  <Col span={8}>
                    <span className={styles.rowItem}>
                      <label>商品分组：</label>
                      {getFieldDecorator('tag_ids')(
                        <Cascader expandTrigger="hover" style={{ width: 'calc(100% - 80px)' }} options={goodsSort} />
                      )}
                    </span>
                  </Col>
                </Row>
                <Row gutter={32}>
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
              </Fragment>
            );
          }}
        </FormSearch>
        <Table
          {...restProps}
          rowKey={table.rowKey}
          columns={this.columns}
          onChange={table.onChange}
          groupData={goodsSort}
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
    return (
      <div className={styles.goodManage}>
        <GoodsTable source={`/api/t_goods/select`} history={this.props.history} id={this.props.id}></GoodsTable>
      </div>
    );
  }
}
