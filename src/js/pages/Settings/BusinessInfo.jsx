import React, { Fragment } from 'react';
import request from '~js/utils/request';
import styles from '~css/Settings/BusinessInfo.module.less';
import { history } from '~js/utils/utils';
import moment from 'moment';
import { Button, Empty, Modal, Form, Input, Card, Row, Col, message, Popconfirm, Select } from 'antd';

class BusinessInfo extends React.Component {
  render() {
    const { info, status } = this.props;

    return (
      <div className={styles.businessInfoDetails}>
        <h3>审核</h3>
        <Row style={{ margin: '24px 0' }}>
          <Col span={4}>
            <p style={{ textAlign: 'right', marginRight: 15 }}>审核状态：</p>
          </Col>
          <Col span={12}>
            {status == 0 && <span className="textEdit">审核中</span>}
            {status == 1 && <span className="textDelete">审核未通过</span>}
            {status == 2 && <span className="textSuccess">审核通过</span>}
          </Col>
        </Row>
        <Row style={{ margin: '24px 0' }}>
          <Col span={4}>
            <p style={{ textAlign: 'right', marginRight: 15 }}>审核回执：</p>
          </Col>
          <Col span={12}>
            <p>{info.audit_desc}</p>
          </Col>
        </Row>
        <h3>联系人信息</h3>
        <Row style={{ margin: '24px 0' }}>
          <Col span={4}>
            <p style={{ textAlign: 'right', marginRight: 15 }}>联系人名称：</p>
          </Col>
          <Col span={12}>{info.t_cont_name}</Col>
        </Row>
        <Row style={{ margin: '24px 0' }}>
          <Col span={4}>
            <p style={{ textAlign: 'right', marginRight: 15 }}>联系电话：</p>
          </Col>
          <Col span={12}>{info.t_shop_number}</Col>
        </Row>
        <h3>经营信息</h3>
        <Row style={{ margin: '24px 0' }}>
          <Col span={4}>
            <p style={{ textAlign: 'right', marginRight: 15 }}>经营地址：</p>
          </Col>
          <Col span={12}>{info.shop_address}</Col>
        </Row>
        <Row style={{ margin: '24px 0' }}>
          <Col span={4}>
            <p style={{ textAlign: 'right', marginRight: 15 }}>企业名称：</p>
          </Col>
          <Col span={12}>{info.t_business_name}</Col>
        </Row>
        <Row style={{ margin: '24px 0' }}>
          <Col span={4}>
            <p style={{ textAlign: 'right', marginRight: 15 }}>注册地址：</p>
          </Col>
          <Col span={12}>{info.t_registered_address}</Col>
        </Row>
        <Row style={{ margin: '24px 0' }}>
          <Col span={4}>
            <p style={{ textAlign: 'right', marginRight: 15 }}>经营范围：</p>
          </Col>
          <Col span={12}>{info.business_scope}</Col>
        </Row>
        <Row style={{ margin: '24px 0' }}>
          <Col span={4}>
            <p style={{ textAlign: 'right', marginRight: 15 }}>统一社会信用代码：</p>
          </Col>
          <Col span={12}>{info.t_business_license}</Col>
        </Row>
        <Row style={{ margin: '24px 0' }}>
          <Col span={4}>
            <p style={{ textAlign: 'right', marginRight: 15 }}>经营起始日期：</p>
          </Col>
          <Col span={12}>{moment(info.start_business).format('YYYY-MM-DD')}</Col>
        </Row>
        <Row style={{ margin: '24px 0' }}>
          <Col span={4}>
            <p style={{ textAlign: 'right', marginRight: 15 }}>经营截止日期：</p>
          </Col>
          <Col span={12}>{moment(info.end_bussiness).format('YYYY-MM-DD')}</Col>
        </Row>
        <h3>企业信息</h3>
        <Row style={{ margin: '24px 0' }}>
          <Col span={4}>
            <p style={{ textAlign: 'right', marginRight: 15 }}>法人代表：</p>
          </Col>
          <Col span={12}>{info.t_legal_person}</Col>
        </Row>
        <Row style={{ margin: '24px 0' }}>
          <Col span={4}>
            <p style={{ textAlign: 'right', marginRight: 15 }}>营业执照照片地址：</p>
          </Col>
          <Col span={12}>
            <a className={styles.imgBox} href={info.bl_photo} target="_blank">
              <img src={info.bl_photo}></img>
            </a>
          </Col>
        </Row>
        <Row style={{ margin: '24px 0' }}>
          <Col span={4}>
            <p style={{ textAlign: 'right', marginRight: 15 }}>身份证号码：</p>
          </Col>
          <Col span={12}>{info.t_id_card}</Col>
        </Row>
        <Row style={{ margin: '24px 0' }}>
          <Col span={4}>
            <p style={{ textAlign: 'right', marginRight: 15 }}>证件起始日期：</p>
          </Col>
          <Col span={12}>{moment(info.id_card_startdata).format('YYYY-MM-DD')}</Col>
        </Row>
        <Row style={{ margin: '24px 0' }}>
          <Col span={4}>
            <p style={{ textAlign: 'right', marginRight: 15 }}>证件失效日期：</p>
          </Col>
          <Col span={12}>{moment(info.id_card_enddata).format('YYYY-MM-DD')}</Col>
        </Row>
        <h3>证件照</h3>
        <Row style={{ margin: '24px 0' }}>
          <Col span={4}>
            <p style={{ textAlign: 'right', marginRight: 15 }}>身份证正面照：</p>
          </Col>
          <Col span={12}>
            <a className={styles.imgBox} href={info.positive_id_photo} target="_blank">
              <img src={info.positive_id_photo}></img>
            </a>
          </Col>
        </Row>
        <Row style={{ margin: '24px 0' }}>
          <Col span={4}>
            <p style={{ textAlign: 'right', marginRight: 15 }}>身份证反面照：</p>
          </Col>
          <Col span={12}>
            <a className={styles.imgBox} href={info.negative_id_photo} target="_blank">
              <img src={info.negative_id_photo}></img>
            </a>
          </Col>
        </Row>
        <Row style={{ margin: '24px 0' }}>
          <Col span={4}>
            <p style={{ textAlign: 'right', marginRight: 15 }}>手持身份证照：</p>
          </Col>
          <Col span={12}>
            <a className={styles.imgBox} href={info.sc_photo} target="_blank">
              <img src={info.sc_photo}></img>
            </a>
          </Col>
        </Row>
      </div>
    );
  }
}

export default class App extends React.Component {
  state = {
    data: [],
  };

  componentDidMount() {
    request('/api/business/sel', {
      method: 'post',
      body: {
        id: this.props.id,
        type: 1,
      },
    }).then((payload) => this.setState({ data: payload.pageData, status: payload.pageData[0].audit_status }));
  }
  handleAdd = () => {
    history.push('/businessinfoadd');
  };
  handleEdit = () => {
    history.push('/businessinfoedit');
  };
  render() {
    const { data, status } = this.state;

    return (
      <div className={styles.businessInfo}>
        <h2 className="title">
          <span>经营信息</span>
          <div>
            <Button type="primary" icon="plus" disabled={data.length > 0} style={{ marginRight: 10 }} onClick={this.handleAdd}>
              添加
            </Button>
            <Button type="primary" icon="edit" disabled={status == 0} onClick={this.handleEdit}>
              编辑
            </Button>
          </div>
        </h2>
        {data.length > 0 ? (
          <BusinessInfo info={data[0]} status={status} />
        ) : (
          <Empty description={'暂无经营信息，请点击添加按钮添加'} />
        )}
      </div>
    );
  }
}
