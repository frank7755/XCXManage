import React from 'react';
import loadable from '~js/utils/loadable';
import styles from '~css/Upload/Index.module.less';
import { Tabs } from 'antd';

const { TabPane } = Tabs;
const Pictures = loadable(() => import('~js/pages/Upload/Pictures.jsx'));
const Vioces = loadable(() => import('~js/pages/Upload/Vioces.jsx'));
const Videos = loadable(() => import('~js/pages/Upload/Videos.jsx'));

export default class App extends React.Component {
  render() {
    return (
      <div className={styles.upload}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="图片" key="1">
            <Pictures id={this.props.id} yztoken={this.props.yztoken}></Pictures>
          </TabPane>
          <TabPane tab="语音" key="2">
            <Vioces id={this.props.id} yztoken={this.props.yztoken}></Vioces>
          </TabPane>
          <TabPane tab="视频" key="3">
            <Videos id={this.props.id} yztoken={this.props.yztoken}></Videos>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
