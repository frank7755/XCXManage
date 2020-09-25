import React, { Fragment } from "react";
import request from "~js/utils/request";
import styles from "~css/Goods/GoodsCategories.module.less";
import {
  Popconfirm,
  message,
  Modal,
  Tree,
  Button,
  Form,
  Select,
  Input
} from "antd";

const { Option } = Select;
const { TreeNode } = Tree;

@Form.create()
class ChangeModal extends React.Component {
  state = { visible: false };

  handleCategory = data => {
    const categories = [];

    const flat = data => {
      data.forEach(item => {
        categories.push({ name: item.name, s_id: item.s_id });

        if (item.children) {
          flat(item.children);
        }
      });

      return categories;
    };

    return flat(data);
  };

  handleAdd = () => {
    this.setState({
      visible: true
    });
  };

  handleEdit = e => {
    this.setState({
      visible: true
    });
  };

  handleAddOk = e => {
    this.props.form.validateFields(err => {
      if (!err) {
        request("/api/create_catalog", {
          method: "post",
          body: {
            id: this.props.id,
            s_id: this.props.form.getFieldValue("s_id"),
            name: this.props.form.getFieldValue("name")
          }
        }).then(payload => {
          this.setState({
            visible: false
          });
          this.props.refresh();
        });
      }
    });
  };

  handleEditOk = e => {
    this.props.form.validateFields(err => {
      if (!err) {
        request("/api/update_catalog", {
          method: "post",
          body: {
            id: this.props.id,
            s_id: this.props.s_id,
            name: this.props.form.getFieldValue("name")
          }
        }).then(payload => {
          this.setState({
            visible: false
          });
          this.props.refresh();
        });
      }
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { type, data, id } = this.props;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 }
      }
    };

    return (
      <Fragment>
        {type == "add" ? (
          <Button type="primary" icon="plus" onClick={this.handleAdd}>
            新增分类
          </Button>
        ) : (
          <a onClick={this.handleEdit}>编辑</a>
        )}
        <Modal
          title={type == "add" ? "新增分类" : "编辑分类"}
          visible={this.state.visible}
          onOk={type == "add" ? this.handleAddOk : this.handleEditOk}
          onCancel={this.handleCancel}
          okText="确定"
          cancelText="取消"
        >
          <Form {...formItemLayout} onSubmit={this.handleSubmit}>
            {type == "add" ? (
              <Form.Item label="上级分类">
                {getFieldDecorator("s_id", {
                  initialValue: -1
                })(
                  <Select style={{ width: "100%" }} placeholder="请选择">
                    <Option value={-1}>未分类</Option>
                    {data &&
                      this.handleCategory(data).map(item => (
                        <Option key={item.s_id} value={item.s_id}>
                          {item.name}
                        </Option>
                      ))}
                  </Select>
                )}
              </Form.Item>
            ) : null}
            <Form.Item label="分类名称">
              {getFieldDecorator("name", {
                rules: [{ required: true, message: "请输入分类名称!" }]
              })(
                <Input type="text" placeholder="不超过20个字" maxLength={20} />
              )}
            </Form.Item>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

export default class App extends React.Component {
  state = {
    data: []
  };

  refresh = () => {
    request("/api/select_catalog", {
      method: "post",
      body: {
        id: this.props.id
      }
    }).then(payload => this.setState({ data: payload }));
  };

  componentDidMount() {
    this.refresh();
  }

  handleDelete = s_id => {
    request("/api/del_catalog", {
      method: "post",
      body: {
        s_id,
        id: this.props.id
      }
    }).then(() => {
      this.refresh();
    });
  };

  renderTreeNodes = data =>
    data.map(item => {
      if (item.children) {
        return (
          <TreeNode
            title={
              <div className={styles.categoryTitle}>
                {item.name}
                <span>
                  <ChangeModal
                    s_id={item.s_id}
                    id={this.props.id}
                    refresh={this.refresh}
                    data={data}
                  ></ChangeModal>
                  <Popconfirm
                    title="确认要删除此商品吗?"
                    onConfirm={() => this.handleDelete(item.s_id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <a>删除</a>
                  </Popconfirm>
                </span>
              </div>
            }
            key={item.s_id}
            dataRef={item}
          >
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          title={
            <div className={styles.categoryTitle}>
              {item.name}
              <span>
                <ChangeModal
                  s_id={item.s_id}
                  id={this.props.id}
                  refresh={this.refresh}
                  data={data}
                ></ChangeModal>
                <Popconfirm
                  title="确认要删除此商品吗?"
                  onConfirm={() => this.handleDelete(item.s_id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <a>删除</a>
                </Popconfirm>
              </span>
            </div>
          }
          key={item.s_id}
          {...item}
        />
      );
    });

  render() {
    const { data } = this.state;

    return (
      <div className={styles.categories}>
        <h2>
          <span>当前分类</span>
          <ChangeModal
            id={this.props.id}
            refresh={this.refresh}
            type="add"
            data={data}
          ></ChangeModal>
        </h2>
        {data && <Tree blockNode>{this.renderTreeNodes(data)}</Tree>}
      </div>
    );
  }
}
