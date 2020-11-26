import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Form, Input, Modal, Avatar, Icon, Tooltip, message, Cascader } from 'antd';
import Picture from '~js/pages/Upload/Pictures.jsx';
import styles from '~css/Shop/WXManage.module.less';
import request from '~js/utils/request';
import TextArea from 'antd/lib/input/TextArea';
import provinces from 'china-division/dist/provinces.json';
import cities from 'china-division/dist/cities.json';
import areas from 'china-division/dist/areas.json';

areas.forEach((area) => {
  const matchCity = cities.filter((city) => city.code === area.cityCode)[0];
  if (matchCity) {
    matchCity.children = matchCity.children || [];
    matchCity.children.push({
      label: area.name,
      value: area.code,
    });
  }
});

cities.forEach((city) => {
  const matchProvince = provinces.filter((province) => province.code === city.provinceCode)[0];
  if (matchProvince) {
    matchProvince.children = matchProvince.children || [];
    matchProvince.children.push({
      label: city.name,
      value: city.code,
      children: city.children,
    });
  }
});

const options = provinces.map((province) => ({
  label: province.name,
  value: province.code,
  children: province.children,
}));

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 24 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
  },
};

class GetImageGroup extends React.Component {
  // this.props直接赋值给state，只在组件初始化时有用，后续render不会改变
  state = {
    visible: false,
    changeData: this.props.defaultValue,
    checkedID: this.props.checkedID,
    confirmData: this.props.defaultValue,
    confirmID: this.props.checkedID,
  };

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

  getImageUrl = (val, type) => {
    let newArr = [...this.state.changeData];
    if (type == 'add') {
      newArr.push(val);
      this.setState({
        changeData: newArr,
        checkedID: newArr.length > 0 ? newArr.map((item) => item.image_id) : [],
      });
    } else {
      newArr = newArr.filter((item) => item.image_id != val.image_id);
      this.setState({
        changeData: newArr,
        checkedID: newArr.length > 0 ? newArr.map((item) => item.image_id) : [],
      });
    }
  };

  handleOk = () => {
    const { onChange, maxChecked } = this.props;

    const { changeData, confirmData } = this.state;

    if (changeData.length > maxChecked) {
      message.error(`最多上传${maxChecked}张图片`);
    } else {
      this.setState(
        {
          visible: false,
          confirmData: changeData,
          confirmID: changeData.length > 0 ? changeData.map((item) => item.image_id) : [],
        },
        () => {
          onChange && onChange(confirmData);
        }
      );
    }
  };

  handleRemove = (k) => {
    const { changeData } = this.state;
    const { onChange } = this.props;
    const newImageData = changeData.filter((item) => item.image_id != k);
    console.log(k, newImageData);

    this.setState({
      changeData: newImageData,
      checkedID: newImageData.map((item) => item.image_id),
      confirmData: newImageData,
    });

    onChange && onChange(newImageData);
  };
  render() {
    const { visible, changeData, checkedID, confirmData, confirmID } = this.state;
    console.log(checkedID, 'id');

    return (
      <div>
        <Button onClick={this.showModal}>选择商品图</Button>
        <p style={{ color: '#999', marginTop: 5, marginBottom: 12 }}>最多选择1张图片</p>
        <div className={styles.imgList}>
          {confirmData.map((item) => (
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
          <Picture id={this.props.id} onChange={this.getImageUrl} checkedID={checkedID} checkedData={confirmData}></Picture>
        </Modal>
      </div>
    );
  }
}

@Form.create()
export default class App extends React.Component {
  state = { logoUrl: null, topUrl: null, buttonUrl: null, initialData: null, logoValue: null };

  componentDidMount() {
    this.refreshPage();
  }

  refreshPage = () => {
    request('/api/shop_base_sel', {
      method: 'post',
      body: {
        id: this.props.id,
      },
      headers: { 'Content-Type': 'application/json;' },
    }).then((payload) => {
      this.setState({
        initialData: payload,
        logoUrl: payload.logo ? payload.logo[0].image_url : null,
        topUrl: payload.banner_logo ? payload.banner_logo[0].image_url : null,
        buttonUrl: payload.order_banner_logo ? payload.order_banner_logo[0].image_url : null,
      });
    });
  };

  getLogo = (val) => {
    console.log(val);
    if (val.length > 0) {
      this.setState({ logoUrl: val[0].image_url, logoValue: val });
    } else {
      this.setState({ logoUrl: null, logoValue: null });
    }
  };

  getTopImage = (val) => {
    if (val.length > 0) {
      this.setState({ topUrl: val[0].image_url });
    } else {
      this.setState({ topUrl: null });
    }
  };

  getButtonImage = (val) => {
    if (val.length > 0) {
      this.setState({ buttonUrl: val[0].image_url });
    } else {
      this.setState({ buttonUrl: null });
    }
  };

  handleSubmit = (e) => {
    const { topUrl, buttonUrl, logoUrl } = this.state;

    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, val) => {
      if (!err) {
        request('/api/shop_base_upd', {
          method: 'post',
          body: {
            id: this.props.id,
            logo: logoUrl,
            banner_logo: topUrl,
            order_banner_logo: buttonUrl,
            province_code: val.location[0],
            city_code: val.location[1],
            area_code: val.location[2],
            ...val,
          },
          headers: { 'Content-Type': 'application/json;' },
        })
          .then((payload) => {
            message.success('更新成功！');
            this.refreshPage();
          })
          .catch((err) => message.error(err.message));
      }
    });
  };

  handleClick = () => {
    request(`/api/open/get_openpre_auth_code?id=${this.props.id}`)
      .then((payload) => {
        window.open(payload.auth_url);
      })
      .catch((err) => message.error(err.message));
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { initialData, logoValue } = this.state;

    return (
      <div className={styles.wxManage}>
        <h2 className="title">
          <span>
            小程序编辑
            <span className="textHighLight" style={{ fontSize: 12, marginLeft: 5 }}>
              (授权成功方可修改小程序信息)
            </span>
          </span>
          <div>
            <Button type="primary" onClick={this.handleClick}>
              点击授权
            </Button>
          </div>
        </h2>
        <Form labelAlign="left" className={styles.actionForm} {...formItemLayout} onSubmit={this.handleSubmit}>
          <section>
            <FormItem label="店铺名称">
              {getFieldDecorator('shop_name', {
                initialValue: initialData && initialData.shop_name,
              })(<Input placeholder="请输入店铺名称"></Input>)}
            </FormItem>
          </section>
          <section>
            <FormItem label="省份信息">
              {getFieldDecorator('location', {
                initialValue: initialData ? [initialData.province_code, initialData.city_code, initialData.area_code] : [],
              })(<Cascader options={options} placeholder="请选择地址" />)}
            </FormItem>
          </section>
          <section>
            <FormItem label="详细地址">
              {getFieldDecorator('address', {
                initialValue: initialData && initialData.address,
              })(<Input placeholder="请输入详细地址"></Input>)}
            </FormItem>
          </section>
          <section>
            <FormItem label="客服电话">
              {getFieldDecorator('customer_phone', {
                initialValue: initialData && initialData.customer_phone,
              })(<Input placeholder="请输入客服电话"></Input>)}
            </FormItem>
          </section>
          <section>
            <FormItem label="店铺WiFi名称">
              {getFieldDecorator('wifi_name', {
                initialValue: initialData && initialData.wifi_name,
              })(<Input placeholder="请输入店铺WiFi名称"></Input>)}
            </FormItem>
          </section>
          <section>
            <FormItem label="店铺WiFi密码">
              {getFieldDecorator('wifi_passwd', {
                initialValue: initialData && initialData.wifi_passwd,
              })(<Input placeholder="请输入WiFi密码"></Input>)}
            </FormItem>
          </section>
          <section>
            <FormItem label="营业时间">
              {getFieldDecorator('business_hours', {
                initialValue: initialData && initialData.business_hours,
              })(<Input placeholder="请输入营业时间"></Input>)}
            </FormItem>
          </section>
          <FormItem
            label="店铺介绍"
            extra={
              <p>
                鼠标移入
                <Tooltip
                  className={styles.tipImage}
                  title={<img src={require('~images/WXtip.jpg')} style={{ width: '100%' }}></img>}
                >
                  <a>演示图片</a>
                </Tooltip>
                ,查看示意
              </p>
            }
          >
            {getFieldDecorator('shop_customize', {
              initialValue: initialData && initialData.shop_customize,
            })(<TextArea style={{ height: 200, resize: 'none' }} placeholder="请输入店铺介绍"></TextArea>)}
          </FormItem>
          <section>
            <FormItem label="店铺logo">
              {initialData && (
                <GetImageGroup
                  id={this.props.id}
                  onChange={this.getLogo}
                  defaultValue={initialData.logo ? initialData.logo : []}
                  checkedID={initialData.logo ? initialData.logo.map((item) => item.image_id) : []}
                  value={logoValue}
                  maxChecked={2}
                ></GetImageGroup>
              )}
            </FormItem>
          </section>
          <section>
            <FormItem label="店铺顶部图片">
              {/* <GetImageGroup
                id={this.props.id}
                onChange={this.getTopImage}
                imgList={initialData && initialData.banner_logo}
              ></GetImageGroup> */}
            </FormItem>
          </section>
          <section>
            <FormItem label="下单按钮图片">
              {/* <GetImageGroup
                id={this.props.id}
                onChange={this.getButtonImage}
                imgList={initialData && initialData.order_banner_logo}
              ></GetImageGroup> */}
            </FormItem>
          </section>
          <FormItem>
            <Button type="primary" htmlType="submit">
              确认修改
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}
