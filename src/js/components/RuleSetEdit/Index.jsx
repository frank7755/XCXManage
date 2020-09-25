import React, { Fragment } from 'react';
import request from '~js/utils/request';
import styles from './Index.module.less';
import { Form, Input, Icon, Button, Row, Col, message, Table, InputNumber, Modal } from 'antd';

const EditableContext = React.createContext();
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
};
const EditableFormRow = ({ index, ...props }) => (
  <EditableContext.Provider>
    <tr {...props} />
  </EditableContext.Provider>
);

// const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
  state = {
    editing: false,
    changeValue: '',
    dataIndex: '',
  };

  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus();
      }
    });
  };

  save = (e) => {
    const { record, handleSave, dataIndex, title } = this.props;
    const { changeValue } = this.state;
    if (changeValue != '') {
      this.toggleEdit();
      handleSave({ ...record, [dataIndex]: this.state.changeValue });
    } else {
      message.error(`请填写${title}`);
      this.input.focus();
    }
  };

  handleChange = (e) => {
    this.setState({ changeValue: e.target.value });
  };

  renderCell = () => {
    const { children } = this.props;
    const { editing } = this.state;
    return editing ? (
      <Input
        type="number"
        onChange={this.handleChange}
        ref={(node) => (this.input = node)}
        value={this.state.changeValue}
        onPressEnter={this.save}
        onBlur={this.save}
        style={{ border: '1px solid #e8e8e8' }}
      />
    ) : (
      <div className={styles.editTableCell} style={{ paddingRight: 24 }} onClick={this.toggleEdit}>
        {children}
      </div>
    );
  };

  render() {
    const { editable, dataIndex, title, record, index, handleSave, children, ...restProps } = this.props;
    return (
      <td {...restProps}>{editable ? <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer> : children}</td>
    );
  }
}

const baseColumns = [
  {
    title: '商品编码',
    dataIndex: 'item_no',
    width: '15%',
    editable: true,
  },
  {
    title: '价格',
    dataIndex: 'price',
    width: '15%',
    editable: true,
  },
  {
    title: '库存',
    width: '15%',
    dataIndex: 'quantity',
    editable: true,
  },
];

class DynamicFieldSet extends React.Component {
  state = {
    id: 0,
    mapKey: [],
    skus: [],
  };

  add = () => {
    this.setState({ mapKey: this.state.mapKey.concat({ id: this.state.id++, val: '' }) });
  };

  remove = (id) => {
    const { mapKey } = this.state;

    this.setState({
      mapKey: mapKey.filter((item) => item.id != id),
    });
  };

  componentDidMount() {
    this.setState({ mapKey: this.props.vvalue.map((item, index) => ({ id: index, val: item })), id: this.props.vvalue.length });
  }

  render() {
    const { mapKey } = this.state;
    const { getFieldDecorator } = this.props.form;
    const { count } = this.props;

    return (
      <div className={styles.addRule} onChange={this.handleChange}>
        <label style={{ width: 80 }}>规格值:</label>
        <section className={styles.mapName}>
          {mapKey.map((item) => (
            <span key={item.id}>
              {getFieldDecorator(`v${count}_${item.id}`, {
                initialValue: item.val,
                rules: [{ required: true, message: '请填写规格值' }],
              })(<Input type="text" style={{ width: 120 }}></Input>)}
              {<Icon type="minus-circle" style={{ marginRight: 10 }} onClick={() => this.remove(item.id)} />}
            </span>
          ))}
          <a onClick={this.add}>添加规格值</a>
        </section>
      </div>
    );
  }
}

class RulesSet extends React.Component {
  state = {
    val: {},
  };

  getData = () => {
    this.props.form.validateFields((err, value) => {
      if (!err) {
        const { val } = this.state;
        const itemValue = this.props.form.getFieldsValue();
        this.setState({
          val: itemValue,
        });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { k } = this.props;

    return (
      <div className={styles.ruleSetBox}>
        <Row>
          <Col span={20} offset={4} className={styles.addRuleName}>
            <label>规格名:</label>
            {getFieldDecorator(`k${k}`, { initialValue: this.props.kvalue })(
              <Input type="text" style={{ width: 'calc(100% - 120px)' }}></Input>
            )}
          </Col>
        </Row>
        <Row style={{ marginTop: 24 }}>
          <Col span={20} offset={4}>
            <DynamicFieldSet count={k} vvalue={this.props.vvalue} form={this.props.form}></DynamicFieldSet>
          </Col>
        </Row>
      </div>
    );
  }
}

@Form.create()
class BatchSettings extends React.Component {
  state = { visible: false };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = (e) => {
    const propsData = [...this.props.data];
    const { onChange } = this.props;

    this.props.form.validateFields((err, values) => {
      let newArr = [];
      if (!err) {
        newArr = propsData.map((item) => ({ ...item, ...values }));

        onChange && onChange(newArr);

        this.props.form.resetFields();
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
    const { type, text } = this.props;

    return (
      <Fragment>
        <Modal title={`修改${text}`} visible={this.state.visible} onOk={this.handleOk} onCancel={this.handleCancel}>
          <Form {...formItemLayout}>
            <FormItem label={text}>
              {getFieldDecorator(type, {
                rules: [
                  {
                    required: true,
                    message: `请填写${text}`,
                  },
                ],
              })(<InputNumber style={{ width: 'calc(100% - 80px)' }}></InputNumber>)}
            </FormItem>
          </Form>
        </Modal>
        <a onClick={this.showModal} style={{ marginLeft: 10 }}>
          {text}
        </a>
      </Fragment>
    );
  }
}

@Form.create()
export default class App extends React.Component {
  state = {
    ruleKey: [],
    names: {},
    rKey: 0,
    skuData: [],
    data: null,
  };

  add = () => {
    const { ruleKey } = this.state;

    this.setState({ ruleKey: ruleKey.concat(this.state.rKey++) });
  };

  componentDidMount() {
    request('/api/t_goods_sku_select', {
      method: 'post',
      body: {
        id: this.props.id,
        item_id: this.props.item_id,
      },
    }).then((payload) => {
      this.setState({
        ruleKey: payload.tmp_guige,
        rKey: payload.tmp_guige.length,
        data: payload.pageData.skulist,
      });
      this.getTable();
    });
  }

  getTable = () => {
    const { onChange } = this.props;
    const { data } = this.state;

    this.props.form.validateFields((err, value) => {
      if (!err) {
        request('/api/t_goods_sku_create', {
          method: 'post',
          headers: { 'Content-Type': 'application/json;' },
          body: { skulist: value, tmpskus: data ? data : [] },
        }).then((payload) => {
          this.setState({ data: payload.pageData, names: payload.key_list });
          onChange && onChange(payload.pageData);
        });
      } else {
        message.error('请填写规格与规格值!');
      }
    });
  };

  remove = (k) => {
    const { ruleKey } = this.state;

    this.setState({ ruleKey: ruleKey.filter((key, index) => index != k) });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.getTable();
  };

  handleSave = (row) => {
    const { onChange } = this.props;
    const newData = [...this.state.data];
    const index = newData.findIndex((item) => row.pric === item.pric);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    this.setState({ data: newData });
    onChange && onChange(newData);
  };

  handleBatch = (val) => {
    const { onChange } = this.props;

    this.setState({ data: val });

    onChange && onChange(val);
  };

  render() {
    const { ruleKey, names, data } = this.state;

    const outColumns = [
      ...Object.keys(names).map((key) => ({
        title: names[key],
        dataIndex: key,
      })),
      ...baseColumns,
    ];

    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };

    const columns = outColumns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });

    return (
      <div className={styles.ruleSet}>
        <Form>
          {ruleKey.map((item, k) => (
            <div key={k} className={styles.ruleBox}>
              <RulesSet form={this.props.form} kvalue={item.k} vvalue={item.v ? item.v : []} k={k}></RulesSet>
              <a onClick={() => this.remove(k)} style={{ marginLeft: 10 }}>
                删除
              </a>
            </div>
          ))}
          <Row gutter={12} style={{ marginBottom: 24 }} className={styles.action}>
            <Col span={20} offset={4}>
              <Button type="dashed" disabled={ruleKey.length >= 3} onClick={this.add} style={{ marginLeft: 80 }}>
                <Icon type="plus" /> 添加规格
              </Button>
              <Button type="primary" onClick={this.handleSubmit} style={{ marginLeft: 10 }}>
                确定
              </Button>
            </Col>
          </Row>
        </Form>
        {data && (
          <div className={styles.actionTable}>
            <Table
              rowKey="pric"
              components={components}
              rowClassName={() => 'editable-row'}
              bordered
              dataSource={data}
              columns={columns}
              pagination={false}
              footer={(currentPageData) => {
                return (
                  <div>
                    批量设置<BatchSettings data={data} type="quantity" text="库存" onChange={this.handleBatch}></BatchSettings>
                    <BatchSettings data={data} type="price" text="价格" onChange={this.handleBatch}></BatchSettings>
                    <BatchSettings data={data} type="item_no" text="编码" onChange={this.handleBatch}></BatchSettings>
                  </div>
                );
              }}
            />
          </div>
        )}
      </div>
    );
  }
}
