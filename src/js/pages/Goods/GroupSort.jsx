import React, { Fragment } from 'react';
import request from '~js/utils/request';
import styles from '~css/Goods/GroupSort.module.less';

import { Table, Popconfirm, Button, Form, Input, Modal, message } from 'antd';
import { DndProvider, DragSource, DropTarget } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';

let dragingIndex = -1;
const FormItem = Form.Item;

class BodyRow extends React.Component {
  render() {
    const { isOver, connectDragSource, connectDropTarget, moveRow, ...restProps } = this.props;
    const style = { ...restProps.style, cursor: 'move' };

    let { className } = restProps;
    if (isOver) {
      if (restProps.index > dragingIndex) {
        className += ' drop-over-downward';
      }
      if (restProps.index < dragingIndex) {
        className += ' drop-over-upward';
      }
    }

    return connectDragSource(connectDropTarget(<tr {...restProps} className={className} style={style} />));
  }
}

const rowSource = {
  beginDrag(props) {
    dragingIndex = props.index;
    return {
      index: props.index,
    };
  },
};

const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Time to actually perform the action
    props.moveRow(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  },
};

const DragableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
}))(
  DragSource('row', rowSource, (connect) => ({
    connectDragSource: connect.dragSource(),
  }))(BodyRow)
);

@Form.create()
class DragSortingTable extends React.Component {
  state = {
    visible: false,
    editId: null,
  };

  editRow = (val) => {
    this.setState({
      visible: true,
      editId: val,
    });
  };

  handleOk = (e) => {
    const { editId } = this.state;

    this.props.form.validateFields((error, value) => {
      if (!error) {
        request('/api/t_goods/tag_upd', {
          method: 'post',
          body: {
            ...value,
            id: this.props.id,
            tag_ids: editId.tag_ids,
            type: 2,
          },
        })
          .then((payload) => {
            message.success('修改成功');
            this.props.form.resetFields();
            this.props.freshTable();
          })
          .catch((err) => message.error(err.message));
      }
    });

    this.setState({
      visible: false,
    });
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };

  confirm = (val) => {
    request('/api/t_goods/tag_del', {
      method: 'post',
      body: {
        id: this.props.id,
        tag_ids: val,
      },
    })
      .then((payload) => {
        message.success('删除成功!');
        this.props.freshTable();
      })
      .catch((err) => message.error(err.message));
  };

  columns = [
    {
      title: '分组',
      dataIndex: 'tag_name',
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (val, record) => {
        return (
          <Fragment>
            <a className="textEdit" style={{ marginRight: 10 }} onClick={() => this.editRow(record)}>
              编辑
            </a>
            <Popconfirm
              title="确定要删除分组吗?"
              onConfirm={() => this.confirm(record.tag_ids)}
              okText="确定"
              cancelText="取消"
            >
              <a className="textDelete">删除</a>
            </Popconfirm>
          </Fragment>
        );
      },
    },
  ];

  components = {
    body: {
      row: DragableBodyRow,
    },
  };

  moveRow = (dragIndex, hoverIndex) => {
    const { dataSource } = this.props;
    const dragRow = dataSource[dragIndex];
    const data = this.props.dataSource;
    const { onChange } = this.props;

    onChange &&
      onChange(
        update(data, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragRow],
          ],
        })
      );
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { editId } = this.state;

    return (
      <DndProvider backend={HTML5Backend}>
        <Table
          columns={this.columns}
          dataSource={this.props.dataSource}
          components={this.components}
          onRow={(record, index) => ({
            index,
            moveRow: this.moveRow,
          })}
          rowKey="tag_ids"
          pagination={false}
          className={styles.dragTable}
        />
        <Modal title="编辑名称" visible={this.state.visible} onOk={this.handleOk} onCancel={this.handleCancel}>
          <Form>
            <FormItem label="分组名称">
              {getFieldDecorator('tag_name', {
                initialValue: editId && editId.tag_name,
                rules: [{ required: true, message: '分组名称' }],
              })(<Input type="text"></Input>)}
            </FormItem>
          </Form>
        </Modal>
      </DndProvider>
    );
  }
}

@Form.create()
export default class App extends React.Component {
  state = {
    dataSource: null,
    visible: false,
  };

  componentDidMount() {
    this.getTableData();
  }

  getTableData = () => {
    request('/api/tag_fz_sel', {
      method: 'post',
      body: {
        id: this.props.id,
      },
    }).then((payload) => this.setState({ dataSource: payload.pageData }));
  };

  getDataSource = (val) => {
    this.setState({ dataSource: val });

    request('/api/t_goods/tag_upd', {
      method: 'post',
      body: {
        id: this.props.id,
        type: 1,
        tag_list: JSON.stringify(val),
      },
    })
      .then((payload) => {
        message.success('修改顺序成功');
        this.getTableData();
      })
      .catch((error) => message.error(error.message));
  };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = (e) => {
    this.props.form.validateFields((error, value) => {
      if (!error) {
        request('/api/t_goods/tag_ins', {
          method: 'post',
          body: {
            ...value,
            id: this.props.id,
          },
        })
          .then((payload) => {
            message.success('添加成功');
            this.props.form.resetFields();
            this.getTableData();
          })
          .catch((err) => message.error(err.message));
      }
    });

    this.setState({
      visible: false,
    });
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { dataSource } = this.state;

    return (
      <div className={styles.groupSort}>
        <h2 className="title">
          <span>
            商品分组
            <span className="textHighLight" style={{ fontSize: 14, marginLeft: 5 }}>
              (鼠标按住不动拖拽每行上下移动可以修改分组顺序)
            </span>
          </span>
          <div className={styles.actionBtnBox}>
            <Button type="primary" onClick={this.showModal}>
              添加分组
            </Button>
          </div>
        </h2>
        <Modal title="添加分组" visible={this.state.visible} onOk={this.handleOk} onCancel={this.handleCancel}>
          <Form>
            <FormItem label="分组名" help="多个分组添加方式：分组1-分组2-分组3">
              {getFieldDecorator('tag_name', {
                rules: [{ required: true, message: '请输入分组名' }],
              })(<Input type="text"></Input>)}
            </FormItem>
          </Form>
        </Modal>
        <DragSortingTable
          onChange={this.getDataSource}
          id={this.props.id}
          dataSource={dataSource}
          freshTable={this.getTableData}
        ></DragSortingTable>
      </div>
    );
  }
}
