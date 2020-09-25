import React, { Fragment } from 'react';
import styles from '~css/Shop/StaffManage.module.less';
import request from '~js/utils/request';
import Md5 from '~js/utils/md5.js';
import serveTable from '~js/components/serveTable';
import { Button, Table, Divider, Tag, Modal, Form, Input, message, Popconfirm } from 'antd';

@serveTable()
class GuideStaffTable extends React.Component {
  columns = [
    {
      title: '员工姓名',
      dataIndex: 'staff_name',
      width: 300,
    },
    {
      title: '员工编号',
      dataIndex: 'staff_id',
      width: 300,
    },
    {
      title: '操作',
      dataIndex: 'option',
      width: 150,
      render: (option, record) => {
        return (
          <Fragment>
            <StaffInfo id={this.props.id} refresh={this.refresh} data={record}></StaffInfo>
            <Divider type="vertical"></Divider>
            <Popconfirm
              title="确认删除员工吗？"
              okText="确认"
              cancelText="取消"
              onConfirm={() => this.handleDelete(record.proc_id)}
            >
              <a className="textDelete">删除</a>
            </Popconfirm>
          </Fragment>
        );
      },
    },
  ];

  handleDelete = (id) => {
    request('/api/delete_employess', {
      method: 'post',
      body: {
        id: this.props.id,
        proc_id: id,
      },
    })
      .then((payload) => this.refresh())
      .catch((error) => message.error(error.message));
  };

  refresh = () => {
    const { table } = this.props;

    table.search();
  };

  render() {
    const { table, ...restProps } = this.props;

    return (
      <div className={styles.staffManage}>
        <div className={styles.guideStaffManage}>
          <h2 className="title">
            <span>导购员管理</span>
            <StaffInfo id={this.props.id} type="add" refresh={this.refresh}></StaffInfo>
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
          />
        </div>
      </div>
    );
  }
}

@Form.create()
class StaffInfo extends React.Component {
  state = { visible: false };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleAddOk = (e) => {
    this.props.form.validateFields((error, values) => {
      if (!error) {
        request('/api/create_employess', {
          method: 'post',
          body: { ...values, staff_passwd: Md5(values.staff_passwd), id: this.props.id },
        })
          .then(() => {
            this.props.refresh();

            this.setState({ visible: false });
          })
          .catch((err) => message.error(err.message));
      }
    });
  };

  handleEditOk = (e) => {
    this.props.form.validateFields((error, values) => {
      if (!error) {
        request('/api/update_employess', {
          method: 'post',
          body: { ...values, staff_passwd: Md5(values.staff_passwd), id: this.props.id },
        })
          .then(() => {
            this.props.refresh();

            this.setState({ visible: false });
          })
          .catch((err) => message.error(err.message));
      }
    });
  };

  handleCancel = (e) => {
    this.props.form.resetFields();
    this.setState({
      visible: false,
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { type, data } = this.props;

    return (
      <Fragment>
        {type == 'add' ? (
          <Button icon="plus" type="primary" onClick={this.showModal}>
            新增导购员
          </Button>
        ) : (
          <a className="textEdit" onClick={this.showModal}>
            编辑
          </a>
        )}
        <Modal
          title={type == 'add' ? '新增导购员' : '编辑导购员'}
          visible={this.state.visible}
          onOk={type == 'add' ? this.handleAddOk : this.handleEditOk}
          onCancel={this.handleCancel}
          okText="确定"
          cancelText="取消"
        >
          <Form onSubmit={this.handleSubmit}>
            <Form.Item label="员工姓名">
              {getFieldDecorator('staff_name', {
                initialValue: data && data.staff_name,
                rules: [{ required: true, message: '请输入员工姓名!' }],
              })(<Input placeholder="请输入员工姓名" />)}
            </Form.Item>
            <Form.Item label="员工电话">
              {getFieldDecorator('staff_number', {
                initialValue: data && data.staff_number,
                rules: [
                  {
                    required: true,
                    message: '请输入手机号',
                  },
                  {
                    pattern: /^1[3456789]\d{9}$/,
                    message: '请输入正确的手机号',
                  },
                ],
              })(<Input placeholder="请输入员工电话" maxLength={11} />)}
            </Form.Item>
            <Form.Item label="员工密码">
              {getFieldDecorator('staff_passwd', {
                rules: [{ required: true, message: '请输入员工密码!' }],
              })(<Input.Password placeholder="请输入员工密码" />)}
            </Form.Item>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

export default class App extends React.Component {
  render() {
    return (
      <GuideStaffTable
        id={this.props.id}
        source="/api/select_employess"
        prefetch
        query={{ id: this.props.id }}
      ></GuideStaffTable>
    );
  }
}
