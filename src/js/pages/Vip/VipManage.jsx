import React, { Fragment } from 'react';
import request from '~js/utils/request';
import styles from '~css/Vip/VipManage.module.less';
import serveTable from '~js/components/serveTable';
import moment from 'moment';
import { Input, Col, Row, Button, Select, DatePicker, Table, Form, Radio, message, Modal } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

@Form.create()
class VIPAction extends React.Component {
  state = { visible: false };

  showModal = () => {
    this.setState({
      visible: true
    });
  };

  handleAddOk = e => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        request('/api/insert_vipuser', {
          method: 'post',
          body: { ...values, id: this.props.id }
        })
          .then(success => {
            this.setState({ visible: false });
            this.props.refresh();
          })
          .catch(error => message.error(error.message));
      }
    });
  };

  handleEditOk = e => {
    const { data } = this.props;

    this.props.form.validateFields((err, values) => {
      if (!err) {
        request('/api/update_vipuser', {
          method: 'post',
          body: { ...values, id: this.props.id, vip_id: data.vip_id }
        })
          .then(success => {
            this.setState({ visible: false });
            this.props.refresh();
          })
          .catch(error => message.error(error.message));
      }
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false
    });
  };

  onChange = e => {
    this.setState({
      value: e.target.value
    });
  };

  render() {
    const { type, data } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Fragment>
        {type == 'add' ? (
          <Button type="primary" icon="plus" onClick={this.showModal}>
            添加会员
          </Button>
        ) : (
          <a style={{ margin: '0 5px' }} onClick={this.showModal}>
            编辑
          </a>
        )}

        <Modal
          title={type == 'add' ? '新增会员' : '编辑会员'}
          visible={this.state.visible}
          onOk={type == 'add' ? this.handleAddOk : this.handleEditOk}
          onCancel={this.handleCancel}
          width={700}
          okText="确定"
          cancelText="取消"
        >
          <Form className={styles.vipForm}>
            <section>
              <Form.Item label="会员姓名">
                {getFieldDecorator('vip_name', {
                  initialValue: data && data.vip_name,
                  rules: [{ required: true, message: '请输入会员姓名' }]
                })(<Input type="text" />)}
              </Form.Item>
            </section>
            <section>
              <Form.Item label="联系电话">
                {getFieldDecorator('vip_tel_no', {
                  initialValue: data && data.vip_tel_no,
                  rules: [
                    { required: true, message: '请输入手机号' },
                    {
                      pattern: /^1[3456789]\d{9}$/,
                      message: '请输入正确的手机号'
                    }
                  ]
                })(<Input maxLength={11} style={{ width: '100%' }} />)}
              </Form.Item>
            </section>
            <section>
              <Form.Item label="等级">
                {getFieldDecorator('vip_grade', {
                  initialValue: data ? data.vip_grade : '1'
                })(
                  <Select>
                    <Option value="1">普通会员</Option>
                    <Option value="2">青铜会员</Option>
                    <Option value="3">黄金会员</Option>
                    <Option value="4">白金会员</Option>
                    <Option value="5">钻石会员</Option>
                  </Select>
                )}
              </Form.Item>
            </section>
            <section>
              <Form.Item label="生日">
                {getFieldDecorator('birthday', {
                  initialValue: data ? moment(data.birthday) : moment().startOf('day')
                })(<DatePicker style={{ width: '100%' }} />)}
              </Form.Item>
            </section>
            <Form.Item label="性别">
              {getFieldDecorator('sex', {
                initialValue: data ? data.sex : 0
              })(
                <Radio.Group onChange={this.onChange}>
                  <Radio value={0}>未知</Radio>
                  <Radio value={1}>男</Radio>
                  <Radio value={2}>女</Radio>
                </Radio.Group>
              )}
            </Form.Item>
            <Form.Item label="备注">
              {getFieldDecorator('remark', {
                initialValue: data && data.remarks
              })(<TextArea type="text" />)}
            </Form.Item>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

@serveTable()
class ViperTable extends React.Component {
  columns = [
    {
      title: '会员ID',
      dataIndex: 'vip_id',
      width: 200
    },
    {
      title: '会员姓名',
      dataIndex: 'vip_name',
      width: 200
    },
    {
      title: '联系电话',
      dataIndex: 'vip_tel_no',
      width: 200
    },
    {
      title: '性别',
      dataIndex: 'sex',
      width: 200,
      render(sex) {
        return ['未知', '男', '女'][sex];
      }
    },
    {
      title: '等级',
      dataIndex: 'vip_grade',
      width: 200,
      render(vip_grade) {
        return [, '普通会员', '青铜会员', '黄金会员', '白金会员', '钻石会员'][vip_grade];
      }
    },
    {
      title: '生日',
      dataIndex: 'birthday',
      width: 200,
      render(birthday) {
        return moment(birthday).format('YYYY-MM-DD');
      }
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 250
    },
    {
      title: '积分',
      dataIndex: 'code',
      width: 250
    },
    {
      title: '操作',
      dataIndex: 'options',
      width: 150,
      align: 'center',
      render: (options, record) => {
        return (
          <Fragment>
            <VIPAction refresh={this.refresh} id={this.props.id} data={record}></VIPAction>
          </Fragment>
        );
      }
    }
  ];

  handleChange = e => {
    const { table } = this.props;

    table.search({ id: this.props.id, vip_name: e.target.value }, { ...table.pagination, current: 1 });
  };

  refresh = () => {
    this.props.table.search();
  };

  render() {
    const { table, supply, ...restProps } = this.props;

    return (
      <div>
        <Row gutter={32}>
          <Col span={10}>
            <span className={styles.rowItem}>
              <label>会员信息：</label>
              <Input placeholder="会员姓名，电话" allowClear onChange={this.handleChange} />
            </span>
          </Col>
        </Row>
        <h2 className="title">
          <span>会员信息</span>
          <VIPAction type="add" id={this.props.id} refresh={this.refresh}></VIPAction>
        </h2>
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
    return (
      <div className={styles.vip}>
        <ViperTable
          id={this.props.id}
          source="/api/select_vipuser"
          prefetch
          query={{ id: this.props.id }}
        ></ViperTable>
      </div>
    );
  }
}

