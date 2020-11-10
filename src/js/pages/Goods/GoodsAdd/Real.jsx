import React, { Fragment } from 'react';
import styles from '~css/Goods/GoodsAdd/Real.module.less';
import {
  Form,
  Input,
  Select,
  Upload,
  Icon,
  Modal,
  Button,
  Table,
  Row,
  Col,
  Cascader,
  Avatar,
  message,
  Tooltip,
  InputNumber,
} from 'antd';
import request from '~js/utils/request';
import RuleSet from './RuleSet';
import Picture from '../../Upload/Pictures';
import { store } from '~js/utils/utils';
import BraftEditor from 'braft-editor';
import { ContentUtils } from 'braft-utils';
// 引入编辑器样式
import 'braft-editor/dist/index.css';

const shopType = 'shopType';
const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 10 },
  },
};

class GetImageGroup extends React.Component {
  state = { visible: false, imgData: [], checkedID: [], urlList: [] };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };

  getImageUrl = (val) => {
    this.setState({
      imgData: val,
      checkedID: val.map((item) => item.image_id),
    });
  };

  handleOk = () => {
    const { onChange } = this.props;

    const { imgData } = this.state;

    this.setState({ visible: false, urlList: imgData });

    onChange && onChange(imgData);
  };

  handleRemove = (k) => {
    const { urlList, checkedID, imgData } = this.state;
    const { onChange } = this.props;
    const newImageData = imgData.filter((item) => item.image_id != k);

    this.setState({
      imgData: imgData.filter((item) => item.image_id != k),
      urlList: urlList.filter((item) => item.image_id != k),
      checkedID: checkedID.filter((item) => item != k),
    });
    onChange && onChange(newImageData);
  };

  render() {
    const { visible, urlList, checkedID, imgData } = this.state;

    return (
      <div>
        <Button onClick={this.showModal}>选择商品图</Button>
        <p style={{ color: '#999', marginTop: 5, marginBottom: 12 }}>最多选择15张图片</p>
        <div className={styles.imgList}>
          {urlList.length > 0 &&
            urlList.map((item) => (
              <span
                style={{ position: 'relative', display: 'inline-block', marginRight: 24, marginBottom: 12, marginBottom: 12 }}
                key={item.image_id}
              >
                <Avatar
                  src={item.image_url}
                  size={60}
                  style={{ border: '1px solid #999' }}
                  shape="square"
                  className={styles.avatar}
                ></Avatar>
                <Icon type="close-circle" onClick={() => this.handleRemove(item.image_id)} className={styles.close}></Icon>
              </span>
            ))}
        </div>
        <Modal
          className={styles.pictureModal}
          width={1000}
          title="选择商品图片"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Picture
            id={this.props.id}
            onChange={this.getImageUrl}
            checkedID={checkedID}
            checkedData={imgData}
            maxChecked={15}
          ></Picture>
        </Modal>
      </div>
    );
  }
}

class RictTextImages extends React.Component {
  state = { visible: false, imgList: [], checkedNum: null, checkedUrl: '' };

  showModal = () => {
    this.setState({
      visible: true,
    });

    request('/api/t_goods_image_select', {
      method: 'post',
      body: {
        id: store.get('userId'),
      },
    }).then((payload) => this.setState({ imgList: payload.pageData }));
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };

  handleOk = () => {
    const { checkedUrl } = this.state;
    const { onChange } = this.props;

    onChange && onChange(checkedUrl);
    this.setState({ visible: false, checkedNum: null, checkedUrl: '' });
  };

  handleChecked = (id, url) => {
    this.setState({ checkedUrl: url, checkedNum: id });
  };

  render() {
    const { visible, imgList } = this.state;

    return (
      <Fragment>
        <button type="button" className="control-item button upload-button" data-title="插入图片" onClick={this.showModal}>
          <Icon type="picture" theme="filled" />
        </button>
        <Modal title="选择图片" width={800} visible={visible} onCancel={this.handleCancel} onOk={this.handleOk}>
          {imgList &&
            imgList.map((item) => (
              <div className={styles.imageChoose} key={item.image_id}>
                <span
                  onClick={() => this.handleChecked(item.image_id, item.image_url)}
                  data-id={item.image_url}
                  className={this.state.checkedNum == item.image_id ? styles.checked : ''}
                >
                  <img src={item.image_url}></img>
                </span>
                <p>{item.name}</p>
              </div>
            ))}
        </Modal>
      </Fragment>
    );
  }
}

@Form.create()
export default class App extends React.Component {
  state = {
    ruleSetData: [],
    editorState: BraftEditor.createEditorState(null),
    goodsSort: [],
    checkedValue: [],
    imgList: [],
  };

  componentDidMount() {
    request('/api/t_goods_fz_select', {
      method: 'post',
      body: {
        id: this.props.id,
        shop_type: store.get(shopType),
      },
    }).then((payload) => {
      this.setState({ goodsSort: payload.pageData });
    });
  }

  handleSubmit = () => {
    const { ruleSetData, imgList, editorState } = this.state;

    this.props.form.validateFields((err, value) => {
      if (imgList.length > 0) {
        if (!err) {
          request('/api/t_goods/insert', {
            headers: { 'Content-Type': 'application/json;' },
            method: 'post',
            body: {
              ...value,
              id: this.props.id,
              status: 0,
              item_type: 0,
              image_ids: imgList.join(','),
              tag_ids: value.tag_ids[1],
              sku_stocks: ruleSetData,
              desc: editorState.toHTML(),
            },
          })
            .then(() => {
              message.success('添加成功');
              this.props.history.push('/goodssearch');
            })
            .catch((error) => {
              message.error(error.message);
            });
        } else {
          message.error('请填写必填项目');
        }
      } else {
        message.error('请添加商品图片');
      }
    });
  };

  getRuleSetData = (data) => {
    this.setState({ ruleSetData: data });
  };

  handleEditorChange = (editorState) => {
    this.setState({ editorState });
  };

  getImageId = (val) => {
    this.setState({ imgList: val.map((item) => item.image_id) });
  };

  handleChange = (editorState) => {
    this.setState({ editorState });
  };

  handleImageChange = (val) => {
    this.setState({
      editorState: ContentUtils.insertMedias(this.state.editorState, [
        {
          type: 'IMAGE',
          url: val,
        },
      ]),
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { editorState, goodsSort, checkedValue, imgList } = this.state;

    const controls = [
      'undo',
      'redo',
      'separator',
      'font-size',
      'line-height',
      'letter-spacing',
      'separator',
      'text-color',
      'bold',
      'italic',
      'underline',
      'strike-through',
      'separator',
      'superscript',
      'subscript',
      'remove-styles',
      'emoji',
      'separator',
      'text-indent',
      'text-align',
      'separator',
      'headings',
      'list-ul',
      'list-ol',
      'blockquote',
      'code',
      'separator',
      'link',
      'separator',
      'hr',
      'separator',
      // 'media',
      'separator',
      'clear',
    ];

    const extendControls = [
      {
        key: 'antd-uploader',
        type: 'component',
        component: <RictTextImages onChange={(val) => this.handleImageChange(val)}></RictTextImages>,
      },
    ];

    return (
      <Fragment>
        <Form {...formItemLayout} className={styles.realFrom}>
          <h2 className="title">
            <span>基本信息</span>
          </h2>
          <FormItem label="商品名称">
            {getFieldDecorator('title', {
              rules: [{ required: true, message: '请输入商品名称' }],
            })(<Input placeholder="请输入商品名称" />)}
          </FormItem>
          <FormItem
            label="商品卖点"
            help={
              <p>
                在商品列表页，详情页标题下面展示卖点信息,建议60字以内{' '}
                <Tooltip
                  placement="bottom"
                  title={
                    <div style={{ width: 230, margin: '0 auto' }}>
                      <img src={require('~images/sellpoint.jpg')} style={{ width: '100%' }}></img>
                    </div>
                  }
                >
                  <a>查看示例</a>
                </Tooltip>
              </p>
            }
          >
            {getFieldDecorator('sell_point')(<Input />)}
          </FormItem>
          <Row style={{ margin: '24px 0' }}>
            <Col span={4}>
              <p style={{ textAlign: 'right', lineHeight: '32px', marginRight: 5, color: '#000' }}>
                <span className={styles.xinghao}></span>商品图:
              </p>
            </Col>
            <Col span={10}>
              <GetImageGroup id={this.props.id} onChange={this.getImageId}></GetImageGroup>
            </Col>
          </Row>
          <FormItem label="商品分组">
            {getFieldDecorator('tag_ids', {
              initialValue: [],
              rules: [{ required: true, message: '请选择商品分组' }],
            })(<Cascader options={goodsSort} />)}
          </FormItem>
          <FormItem label="商品单价">
            {getFieldDecorator('price', {
              rules: [{ required: true, message: '请填写商品单价' }],
            })(
              <InputNumber
                formatter={(value) => `\￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\￥\s?|(,*)/g, '')}
                style={{ width: '100%' }}
              ></InputNumber>
            )}
          </FormItem>
          <FormItem label="划线价">
            {getFieldDecorator('origin_price', {
              rules: [{ required: true, message: '请填写划线价' }],
            })(
              <InputNumber
                formatter={(value) => `\￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\￥\s?|(,*)/g, '')}
                style={{ width: '100%' }}
              ></InputNumber>
            )}
          </FormItem>
          <FormItem label="库存">
            {getFieldDecorator('quantity', {
              rules: [{ required: true, message: '请填写库存' }],
            })(<Input type="text"></Input>)}
          </FormItem>
          <FormItem label="是否上架">
            {getFieldDecorator('is_display', {
              initialValue: 0,
              rules: [{ required: true, message: '请选择是否上架' }],
            })(
              <Select>
                <Option value={1}>上架商品</Option>
                <Option value={0}>放入仓库</Option>
              </Select>
            )}
          </FormItem>
          <h2 className="title">
            <span>
              价格库存
              <span style={{ color: '#fc5050', fontSize: 14, fontWeight: 'normal', marginLeft: 5 }}>
                (修改规格值与规格名后,请重新点击下方确定)
              </span>
            </span>
          </h2>
        </Form>
        <RuleSet onChange={(data) => this.getRuleSetData(data)}></RuleSet>
        <h2 className="title">
          <span>商品详情</span>
        </h2>
        <Row gutter={12}>
          <Col span={16} offset={3}>
            <BraftEditor
              placeholder="请在此输入商品详情"
              value={editorState}
              controls={controls}
              onChange={this.handleEditorChange}
              className={styles.richText}
              extendControls={extendControls}
            ></BraftEditor>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={16} offset={3}>
            <Button type="primary" className={styles.submitBtn} onClick={this.handleSubmit}>
              确认添加商品
            </Button>
          </Col>
        </Row>
      </Fragment>
    );
  }
}
