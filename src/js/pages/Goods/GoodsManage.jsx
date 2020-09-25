import React, { Fragment } from 'react';
import request from '~js/utils/request';
import { formatThousands } from '~js/utils/utils';
import moment from 'moment';
import styles from '~css/Goods/GoodsManage.module.less';
import FormSearch from '~js/components/FormSearch/';
import serveTable from '~js/components/serveTable';
import { Input, Popconfirm, Col, Row, Button, Select, Table, Form, Drawer, message } from 'antd';

const FormItem = Form.Item;
const InputGroup = Input.Group;

@Form.create()
class GoodsAction extends React.PureComponent {
  state = {
    visible: false,
  };

  static expando = 0;

  showDrawer = () => {
    this.setState({ visible: true });
  };

  closeDrawer = () => {
    this.setState({ visible: false });
  };

  handleAddSubmit = (e) => {
    const { refresh, form } = this.props;

    form.validateFields((err, values) => {
      if (!err) {
        this.setState({ visible: false });
        request('/api/insert_goods', {
          method: 'post',
          body: { ...values, id: this.props.id, user_name: this.props.user_name, user_id: this.props.user_id, status: 0 },
        }).then((payload) => {
          message.success('添加成功！');
          form.resetFields();
          refresh();
        });
      }
    });
  };

  render() {
    const { type, data } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Fragment>
        {type == 'add' ? (
          <Button type="primary" icon="plus" onClick={this.showDrawer}>
            新增
          </Button>
        ) : (
          <a style={{ color: '#006acc', margin: '0 10px' }} onClick={this.showDrawer}>
            编辑
          </a>
        )}
        <Drawer
          width={800}
          title={type == 'add' ? '新增商品' : '编辑商品'}
          closable={false}
          onClose={this.closeDrawer}
          visible={this.state.visible}
        >
          <Form
            onSubmit={type == 'add' ? this.handleAddSubmit : this.handleEditSubmit}
            className={`${styles.goodsOperate} fn-clear`}
          >
            <section>
              <FormItem label="商品名称">
                {getFieldDecorator('name', {
                  initialValue: data && data.name,
                  rules: [{ required: true, message: '请输入商品名称' }],
                })(<Input placeholder="请输入商品名称" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="库存量">
                {getFieldDecorator('inventory_quantity', {
                  initialValue: data && data.inventory_quantity,
                  rules: [{ required: true, message: '请输入库存量' }],
                  pattern: new RegExp(/^[1-9]\d*$/, 'g'),
                  message: '请输入库存量',
                  getValueFromEvent: (event) => {
                    return event.target.value.replace(/\D/g, '');
                  },
                })(<Input placeholder="请输入库存量" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="销售价格">
                {getFieldDecorator('seling_price', {
                  initialValue: data && data.seling_price,
                  rules: [{ required: true, message: '请输入销售价格' }],
                  pattern: new RegExp(/^[1-9]\d*$/, 'g'),
                  message: '请输入销售价格',
                  getValueFromEvent: (event) => {
                    return event.target.value.replace(/\D/g, '');
                  },
                })(<Input placeholder="请输入销售价格" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="库存下线">
                {getFieldDecorator('min_num', {
                  initialValue: data && data.min_num,
                  rules: [{ required: true, message: '请输入库存下线' }],
                  pattern: new RegExp(/^[1-9]\d*$/, 'g'),
                  message: '请输入库存下线',
                  getValueFromEvent: (event) => {
                    return event.target.value.replace(/\D/g, '');
                  },
                })(<Input placeholder="请输入库存下线" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="商品单位">
                {getFieldDecorator('unit', {
                  initialValue: data && data.unit,
                  rules: [{ required: true, message: '请输入商品单位' }],
                })(<Input placeholder="请输入商品单位" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="货单编号">
                {getFieldDecorator('code_id', {
                  initialValue: data && data.code_id,
                  pattern: new RegExp(/^[1-9]\d*$/, 'g'),
                  message: '请输入货单编号',
                  getValueFromEvent: (event) => {
                    return event.target.value.replace(/\D/g, '');
                  },
                })(<Input placeholder="请输入货单编号" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="供应商条码">
                {getFieldDecorator('s_code', {
                  initialValue: data && data.s_code,
                })(<Input placeholder="请输入供应商条码" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="自定义条码">
                {getFieldDecorator('u_code', {
                  initialValue: data && data.u_code,
                })(<Input placeholder="请输入自定义条码" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="商品链接">
                {getFieldDecorator('s_link', {
                  initialValue: data && data.s_link,
                })(<Input placeholder="请输入商品链接" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="商品图片">
                {getFieldDecorator('s_photo', {
                  initialValue: data && data.s_photo,
                })(<Input placeholder="请输入图片地址" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="商品分类">
                {getFieldDecorator('type_id', {
                  initialValue: data && data.type_id,
                })(<Input placeholder="请输入商品分类" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="商品品类">
                {getFieldDecorator('unit_pinlei', {
                  initialValue: data && data.unit_pinlei,
                })(<Input placeholder="请输入商品品类" />)}
              </FormItem>
            </section>
            <section>
              <FormItem label="阈值提醒">
                {getFieldDecorator('threshold_remind', {
                  initialValue: data && data.threshold_remind,
                })(<Input placeholder="请输入阈值" />)}
              </FormItem>
            </section>
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                borderTop: '1px solid #e8e8e8',
                padding: '10px 16px',
                textAlign: 'right',
                left: 0,
                background: '#fff',
                borderRadius: '0 0 4px 4px',
              }}
            >
              <Button
                style={{
                  marginRight: 8,
                }}
                onClick={this.closeDrawer}
              >
                取消
              </Button>
              <Button htmlType="submit" type="primary">
                确定
              </Button>
            </div>
          </Form>
        </Drawer>
      </Fragment>
    );
  }
}

@serveTable()
class GoodsTable extends React.Component {
  columns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '商品单位',
      dataIndex: 'unit',
      width: 200,
    },
    {
      title: '库存量',
      dataIndex: 'inventory_quantity',
      width: 200,
    },
    {
      title: '销售价格',
      dataIndex: 'seling_price',
      width: 200,
      render(seling_price) {
        return '￥' + formatThousands(seling_price);
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 200,
      render(status) {
        return status == '0' ? <span style={{ color: '#31c105' }}>生效</span> : <span style={{ color: '#fc5050' }}>无效</span>;
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      width: 200,
      render: (option, record) => {
        return (
          <GoodsAction
            data={record}
            id={this.props.id}
            user_name={this.props.user_name}
            user_id={this.props.user_id}
          ></GoodsAction>
        );
      },
    },
  ];

  expandedRowRender = (record) => {
    return (
      <Fragment>
        <p>货单编号：{record.code_id}</p>
        <p>供应商条码：{record.s_code}</p>
        <p>自定义条形码：{record.u_code}</p>
        <p>商品链接：{record.s_link}</p>
        <p>商品图片：{record.s_photo}</p>
        <p>商品分类：{record.type_id}</p>
        <p>商品品类：{record.unit_pinlei}</p>
        <p>阀值提醒：{record.threshold_remind}</p>
      </Fragment>
    );
  };

  handleSearch = ({ ...rest }) => {
    const { table } = this.props;

    table.search({ ...rest }, { ...table.pagination, current: 1 });
  };

  refresh = () => {
    this.props.table.search();
  };

  render() {
    const { table, supply, user_name, user_id, ...restProps } = this.props;

    return (
      <Fragment>
        <h2 className="title">
          <span>商品</span>
          <GoodsAction
            type="add"
            id={this.props.id}
            refresh={this.refresh}
            user_name={user_name}
            user_id={user_id}
          ></GoodsAction>
        </h2>
        <FormSearch onSearch={this.handleSearch}>
          {({ form }) => {
            const { getFieldDecorator } = form;
            return (
              <Fragment>
                <Row gutter={32}>
                  <Col span={8}>
                    <span className={styles.rowItem}>
                      <label>商品：</label>
                      {getFieldDecorator('name')(
                        <Input placeholder="名称，条形码，自编码..." style={{ width: 'calc(100% - 80px)' }} />
                      )}
                    </span>
                  </Col>
                  <Col span={8}>
                    <span className={styles.rowItem}>
                      <label>商品状态：</label>
                      {getFieldDecorator('status', { initialValue: 0 })(
                        <Select style={{ width: 'calc(100% - 80px)' }}>
                          <Option value={0}>生效</Option>
                          <Option value={1}>失效</Option>
                        </Select>
                      )}
                    </span>
                  </Col>
                  <Col span={8}>
                    <span className={styles.rowItem}>
                      <label>商品价格：</label>
                      <InputGroup compact style={{ width: 'calc(100% - 80px)' }}>
                        {getFieldDecorator('start_seling_price')(
                          <Input
                            style={{
                              width: 'calc(50% - 25px)',
                              textAlign: 'center',
                            }}
                            placeholder="最小金额"
                          />
                        )}
                        <Input
                          style={{
                            width: 50,
                            borderLeft: 0,
                            pointerEvents: 'none',
                            backgroundColor: '#fff',
                          }}
                          placeholder="~"
                          disabled
                        />
                        {getFieldDecorator('end_seling_price')(
                          <Input
                            style={{
                              width: 'calc(50% - 25px)',
                              textAlign: 'center',
                              borderLeft: 0,
                            }}
                            placeholder="最大金额"
                          />
                        )}
                      </InputGroup>
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
          pagination={table.pagination}
          bodyStyle={{ overflowX: 'auto' }}
          dataSource={table.getDataSource()}
          loading={table.loading && { delay: 150 }}
          expandedRowRender={this.expandedRowRender}
        ></Table>
      </Fragment>
    );
  }
}

export default class App extends React.Component {
  render() {
    return (
      <div className={styles.goodManage}>
        <GoodsTable
          source={`/api/select_goods?status=${status || 0}&id=${this.props.id}`}
          id={this.props.id}
          user_name={this.props.user_name}
          user_id={this.props.id}
        ></GoodsTable>
      </div>
    );
  }
}
