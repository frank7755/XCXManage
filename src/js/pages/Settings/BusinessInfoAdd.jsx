import React, { Fragment } from 'react';
import request from '~js/utils/request';
import { history } from '~js/utils/utils';
import styles from '~css/Settings/BusinessInfoAdd.module.less';
import { Form, Input, DatePicker, Icon, Upload, message, Button, Row, Col } from 'antd';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
};

class UploadImage extends React.Component {
  state = {
    loading: false,
    imgUrl: null,
  };

  getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  handleChange = (info) => {
    const { onChange, value, photoName } = this.props;
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      this.getBase64(info.file.originFileObj, (imgUrl) =>
        this.setState({
          imgUrl,
          loading: false,
        })
      );
      onChange && onChange({ ...value, fileName: info.file.response.payload.file_name, photoName });
    }
  };

  beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('请上传jpg或者png格式图片!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片必须小于 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  render() {
    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">上传图片</div>
      </div>
    );
    const { imgUrl } = this.state;

    return (
      <Upload
        accept="image/*"
        name={this.props.imageName}
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        action="/api/photo/upload"
        beforeUpload={this.beforeUpload}
        onChange={this.handleChange}
      >
        {imgUrl ? <img src={imgUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
      </Upload>
    );
  }
}

@Form.create()
export default class App extends React.Component {
  normFile = (e) => {
    if (e) {
      return e.fileName;
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((error, values) => {
      if (!error) {
        request('/api/business/ins', {
          method: 'post',
          body: { ...values, id: this.props.id },
        })
          .then((payload) => {
            message.success('添加成功!');
            this.props.history.push('/businessinfo');
          })
          .catch((error) => message.error(error.message));
      } else {
        message.error(error.message);
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form {...formItemLayout} onSubmit={this.handleSubmit}>
        <div className={styles.businessInfoAdd}>
          <h2 className="title">
            <span>添加经营信息</span>
          </h2>
          <div className={styles.businessInfoAddDetails}>
            <h3>联系人信息</h3>
            <FormItem label="联系人名称">
              {getFieldDecorator('cont_name', {
                rules: [
                  {
                    required: true,
                    message: `请填写联系人名称`,
                  },
                ],
              })(<Input type="text"></Input>)}
            </FormItem>
            <FormItem label="联系电话">
              {getFieldDecorator('shop_number', {
                rules: [
                  {
                    required: true,
                    message: `请填写联系电话`,
                  },
                ],
              })(<Input type="text"></Input>)}
            </FormItem>
            <h3>经营信息</h3>
            <FormItem label="经营地址">
              {getFieldDecorator('shop_address', {
                rules: [
                  {
                    required: true,
                    message: `请填写经营地址`,
                  },
                ],
              })(<Input type="text"></Input>)}
            </FormItem>
            <FormItem label="企业名称">
              {getFieldDecorator('business_name', {
                rules: [
                  {
                    required: true,
                    message: `请填写企业名称`,
                  },
                ],
              })(<Input type="text"></Input>)}
            </FormItem>
            <FormItem label="注册地址">
              {getFieldDecorator('registered_address', {
                rules: [
                  {
                    required: true,
                    message: `请填写注册地址`,
                  },
                ],
              })(<Input type="text"></Input>)}
            </FormItem>
            <FormItem label="经营范围">
              {getFieldDecorator('business_scope', {
                rules: [
                  {
                    required: true,
                    message: `请填写经营范围`,
                  },
                ],
              })(<Input type="text"></Input>)}
            </FormItem>
            <FormItem label="统一社会信用代码">
              {getFieldDecorator('business_license', {
                rules: [
                  {
                    required: true,
                    message: `请填写统一社会信用代码`,
                  },
                ],
              })(<Input type="text"></Input>)}
            </FormItem>
            <FormItem label="经营起始日期">
              {getFieldDecorator('start_business', {
                rules: [
                  {
                    required: true,
                    message: `请选择经营起始日期`,
                  },
                ],
              })(<DatePicker style={{ width: 300 }} />)}
            </FormItem>
            <FormItem label="经营截止日期">
              {getFieldDecorator('end_business', {
                rules: [
                  {
                    required: true,
                    message: `请选择经营截止日期`,
                  },
                ],
              })(<DatePicker style={{ width: 300 }} />)}
            </FormItem>
            <h3>法人代表</h3>
            <FormItem label="法人代表">
              {getFieldDecorator('legal_person', {
                rules: [
                  {
                    required: true,
                    message: `请填写法人代表`,
                  },
                ],
              })(<Input type="text"></Input>)}
            </FormItem>
            <FormItem label="营业执照照片上传">
              {getFieldDecorator('bl_photo', {
                valuePropName: 'fileName',
                getValueFromEvent: this.normFile,
                rules: [
                  {
                    required: true,
                    message: `请上传照片`,
                  },
                ],
              })(<UploadImage imageName="file" photoName="bl_photo"></UploadImage>)}
            </FormItem>
            <FormItem label="身份证号码">
              {getFieldDecorator('id_card', {
                rules: [
                  {
                    required: true,
                    message: `请填写身份证号码`,
                  },
                ],
              })(<Input type="text"></Input>)}
            </FormItem>
            <FormItem label="证件起始日期">
              {getFieldDecorator('id_card_startdata', {
                rules: [
                  {
                    required: true,
                    message: `请选择证件起始日期`,
                  },
                ],
              })(<DatePicker style={{ width: 300 }} />)}
            </FormItem>
            <FormItem label="证件失效日期">
              {getFieldDecorator('id_card_enddata', {
                rules: [
                  {
                    required: true,
                    message: `请选择证件失效日期`,
                  },
                ],
              })(<DatePicker style={{ width: 300 }} />)}
            </FormItem>
            <h3>证件照</h3>
            <FormItem label="身份证正面照">
              {getFieldDecorator('positive_id_photo', {
                valuePropName: 'fileName',
                getValueFromEvent: this.normFile,
                rules: [
                  {
                    required: true,
                    message: `请上传照片`,
                  },
                ],
              })(<UploadImage imageName="file"></UploadImage>)}
            </FormItem>
            <FormItem label="身份证反面照">
              {getFieldDecorator('negative_id_photo', {
                valuePropName: 'fileName',
                getValueFromEvent: this.normFile,
                rules: [
                  {
                    required: true,
                    message: `请上传照片`,
                  },
                ],
              })(<UploadImage imageName="file"></UploadImage>)}
            </FormItem>
            <FormItem label="手持身份证照">
              {getFieldDecorator('sc_photo', {
                valuePropName: 'fileName',
                getValueFromEvent: this.normFile,
                rules: [
                  {
                    required: true,
                    message: `请上传照片`,
                  },
                ],
              })(<UploadImage imageName="file"></UploadImage>)}
            </FormItem>
            <Row style={{ margin: '24px 0' }}>
              <Col span={4}></Col>
              <Col span={12}>
                <Button type="primary" htmlType="submit">
                  确认添加
                </Button>
              </Col>
            </Row>
          </div>
        </div>
      </Form>
    );
  }
}
