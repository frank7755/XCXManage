import styles from './BaseDrawer.module.less';

import React from 'react';
import propTypes from 'prop-types';
import classNames from 'classnames';
import request from '~js/utils/request';
import { Button, ConfigProvider, Drawer, Form, message, Spin } from 'antd';

@Form.create()
export default class BaseDrawer extends React.PureComponent {
  /**
   * @property propTypes
   */
  static propTypes = {
    notify: propTypes.bool,
    filter: propTypes.func,
    data: propTypes.object,
    method: propTypes.string,
    onChange: propTypes.func,
    onSubmit: propTypes.func,
    onInvalid: propTypes.func,
    headers: propTypes.object,
    autoReset: propTypes.bool,
    afterVisibleChange: propTypes.func,
    action: propTypes.string.isRequired,
    loading: propTypes.oneOfType([propTypes.bool, propTypes.object]),
    children: propTypes.oneOfType([propTypes.func, propTypes.element]).isRequired
  };

  static defaultProps = {
    width: 720,
    method: 'POST',
    loading: false,
    autoReset: true,
    filter: data => data,
    destroyOnClose: false
  };

  state = {
    submitting: false
  };

  firstInit = true;

  body = React.createRef();

  handleSubmit = e => {
    e.preventDefault();

    const { props } = this;
    const { form, method, headers, notify, data, action, filter, onSubmit, onInvalid } = props;

    form.validateFields((errors, values) => {
      if (errors) {
        onInvalid && onInvalid(errors, props);
      } else {
        this.setState({ submitting: true });

        request(action, { method, headers, notify, body: filter(data ? { ...data, ...values } : values) })
          .then(payload => {
            this.setState({ submitting: false });

            onSubmit && onSubmit(payload, props);
          })
          .catch(error => {
            message.error(error.message);
            this.setState({ submitting: false });
          });
      }
    });
  };

  handleReset = () => {
    const { form } = this.props;

    form.resetFields();
  };

  handleChange = visible => {
    const { props } = this;
    const { onChange } = props;

    // 打开后切换开关
    this.firstInit = false;

    onChange && onChange(visible, props);
  };

  handleAfterChange = visible => {
    const { props } = this;
    const { autoReset, afterVisibleChange } = props;

    afterVisibleChange && afterVisibleChange(visible, props);

    // 重置表单
    !visible && autoReset && this.handleReset();
  };

  handleClose = e => {
    const { props } = this;
    const { onClose } = props;

    onClose && onClose(e, props);
  };

  getSpinProps(loading) {
    if (loading === null || loading.constructor === Boolean) {
      return { spinning: loading };
    }

    return { spinning: true, ...loading };
  }

  renderChildren(children, props) {
    return React.isValidElement(children) ? React.cloneElement(children, props) : children(props);
  }

  getPopupContainer = () => this.body.current;

  render() {
    const {
      mask,
      title,
      width,
      style,
      layout,
      zIndex,
      height,
      loading,
      visible,
      closable,
      children,
      keyboard,
      className,
      placement,
      maskStyle,
      bodyStyle,
      maskClosable,
      getContainer,
      destroyOnClose,
      hideRequiredMark
    } = this.props;

    const { submitting } = this.state;
    const spinProps = this.getSpinProps(loading);
    const skipRenderContent = this.firstInit && !visible;

    return (
      <Drawer
        mask={mask}
        title={title}
        style={style}
        width={width}
        height={height}
        zIndex={zIndex}
        visible={visible}
        closable={closable}
        keyboard={keyboard}
        placement={placement}
        maskStyle={maskStyle}
        bodyStyle={bodyStyle}
        onClose={this.handleClose}
        getContainer={getContainer}
        maskClosable={maskClosable}
        onChange={this.handleChange}
        destroyOnClose={destroyOnClose}
        afterVisibleChange={this.handleAfterChange}
        className={classNames(styles.formDrawer, className)}
      >
        <Form
          layout={layout}
          className={styles.form}
          onReset={this.handleReset}
          onSubmit={this.handleSubmit}
          hideRequiredMark={hideRequiredMark}
        >
          {!skipRenderContent && (
            <Spin {...spinProps} wrapperClassName={classNames(styles.spinning, spinProps.wrapperClassName)}>
              <div ref={this.body} className={styles.body}>
                <ConfigProvider getPopupContainer={this.getPopupContainer}>
                  {this.renderChildren(children, this.props)}
                </ConfigProvider>
              </div>
            </Spin>
          )}
          <div className={styles.footer}>
            <Button disabled={spinProps.spinning} onClick={this.handleClose}>
              取消
            </Button>
            <Button disabled={spinProps.spinning} type="primary" loading={submitting && { delay: 150 }} htmlType="submit">
              确定
            </Button>
          </div>
        </Form>
      </Drawer>
    );
  }
}
