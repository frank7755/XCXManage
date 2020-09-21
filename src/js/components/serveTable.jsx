/**
 * @module serveTable
 * @description 表格高阶组件，用以提供表格服务
 */

import React from 'react';
import { message } from 'antd';
import propTypes from 'prop-types';
import request from '~js/utils/request';

const totalStyles = { marginRight: 8 };

/**
 * @function showTotal
 * @description 总条数和当前分页
 * @param {number} total
 * @param {number[]} range
 * @returns {ReactDOM}
 */
function showTotal(total, range) {
  return (
    <span style={totalStyles}>
      总共：{total} 条 - 当前：第 {range[0]}-{range[1]} 条
    </span>
  );
}

/**
 * @function getDefaultPagination
 * @param {Object} props
 */
function getDefaultPagination({ pagination }) {
  return (
    pagination !== false && {
      showTotal,
      current: 1,
      pageSize: 10,
      showQuickJumper: true,
      ...pagination
    }
  );
}

export default function serveTable(mapServeToProps = table => ({ table })) {
  return Table => {
    return class ServeTable extends React.PureComponent {
      /**
       * @property propTypes
       */
      static propTypes = {
        cache: propTypes.bool,
        query: propTypes.object,
        sorter: propTypes.object,
        prefetch: propTypes.bool,
        filters: propTypes.object,
        preprocess: propTypes.func,
        source: propTypes.string.isRequired,
        pagination: propTypes.oneOfType([propTypes.object, propTypes.bool])
      };

      /**
       * @property defaultProps
       */
      static defaultProps = {
        query: {},
        sorter: {},
        filters: {},
        cache: false
      };

      /**
       * @constructor
       * @param {React.Props} props
       */
      constructor(props, context) {
        super(props, context);

        this.state = {
          rowKey: null,
          response: {},
          loading: false,
          dataSource: [],
          query: props.query,
          sorter: props.sorter,
          timestamp: Date.now(),
          filters: props.filters,
          pagination: getDefaultPagination(props)
        };
      }

      /**
       * @method getDataSource
       * @description 获取表格数据源
       * @returns {Array}
       */
      getDataSource = () => {
        return this.state.dataSource;
      };

      /**
       * @method setDataSource
       * @description 设置表格数据源
       * @param {Array} dataSource
       */
      setDataSource = dataSource => {
        this.setState({ dataSource });
      };

      /**
       * @method reset
       * @description 重置状态
       */
      reset = () => {
        const { props } = this;
        const { prefetch } = props;
        const pagination = getDefaultPagination(props);

        if (prefetch) {
          this.fetch(props.query, props.filters, props.sorter, pagination);
        } else {
          this.setState({ dataSource: [], pagination });
        }
      };

      /**
       * @method showLoading
       * @description 显示加载状态
       */
      showLoading = () => {
        this.setState({ loading: true });
      };

      /**
       * @method hideLoading
       * @description 关闭加载状态
       */
      hideLoading = () => {
        this.setState({ loading: false });
      };

      /**
       * @method onChange
       * @description 分页、排序、筛选变化时触发
       * @param {Object} pagination
       * @param {Object} filters
       * @param {Object} sorter
       */
      onChange = (pagination, filters, sorter) => {
        const { state } = this;

        this.fetch(state.query, filters, sorter, pagination);
      };

      /**
       * @method fetch
       * @description 数据获取方法
       * @param {Object} query
       * @param {Object} filters
       * @param {Object} sorter
       * @param {Object} pagination
       */
      fetch = (query, filters, sorter, pagination) => {
        const { props, state } = this;
        const { field, order } = sorter;
        const hasSorter = !!(field && order);
        const hasPagination = props.pagination !== false;

        query = query || state.query;
        pagination = hasPagination ? pagination || state.pagination : false;

        this.setState({ loading: true, query, filters, sorter, pagination });

        sorter = hasSorter ? { field, order } : {};
        query = { ...query, ...sorter, ...filters };

        if (hasPagination) {
          query.page = pagination.current;
          query.pageSize = pagination.pageSize;
        }

        // 请求数据
        return request(props.source, { query, cache: props.cache })
          .then((payload = {}) => {
            const { preprocess } = props;

            if (preprocess) {
              payload = preprocess(payload);
            }

            let rowKey = null;
            const response = payload;
            const timestamp = Date.now();

            // 设置 rowKey
            if (payload.key) {
              if (Array.isArray(payload.key)) {
                rowKey = record => payload.key.map(key => record[key]).join('-');
              } else {
                rowKey = record => record[payload.key];
              }
            }

            // 获取数据并刷新分页总数
            const dataSource = payload.pageData || [];

            // 更新分页总页数
            pagination = hasPagination && { ...pagination, total: payload.total };

            // 设置数据源
            this.setState({ rowKey, dataSource, response, timestamp, pagination, loading: false });
          })
          .catch(error => {
            // 显示错误
            message.error(error.message);
            this.setState({ loading: false });
          });
      };

      /**
       * @method search
       * @description 表格搜索
       * @param {Object} query
       * @param {Object} pagination
       */
      search = (query, pagination) => {
        const state = this.state;

        return this.fetch(query, state.filters, state.sorter, pagination);
      };

      /**
       * @method componentDidMount
       */
      componentDidMount() {
        if (this.props.prefetch) {
          const state = this.state;

          this.fetch(state.query, state.filters, state.sorter, state.pagination);
        }
      }

      /**
       * @method getServe
       * @description 获取高阶组件对外接口
       */
      getServe() {
        const state = this.state;
        const hasPagination = state.pagination !== false;

        return {
          fetch: this.fetch,
          reset: this.reset,
          query: state.query,
          search: this.search,
          sorter: state.sorter,
          rowKey: state.rowKey,
          filters: state.filters,
          loading: state.loading,
          onChange: this.onChange,
          response: state.response,
          timestamp: state.timestamp,
          showLoading: this.showLoading,
          hideLoading: this.hideLoading,
          setDataSource: this.setDataSource,
          getDataSource: this.getDataSource,
          pagination: hasPagination && state.pagination
        };
      }

      render() {
        const { cache, source, query, sorter, filters, prefetch, pagination, ...restProps } = this.props;
        const props = { ...restProps, ...mapServeToProps(this.getServe()) };

        return <Table {...props} />;
      }
    };
  };
}
