import React from 'react';
import loadable from '~js/utils/loadable';
import styles from '~css/Goods/GoodsAdd/Index.module.less';
import { Tabs } from 'antd';

const { TabPane } = Tabs;
const Real = loadable(() => import('~js/pages/Goods/GoodsAdd/Real.jsx'));

export default class App extends React.Component {
  render() {
    return (
      <div className={styles.goodsAdd}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="实物商品" key="1">
            <Real id={this.props.id} history={this.props.history} yztoken={this.props.yztoken}></Real>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
