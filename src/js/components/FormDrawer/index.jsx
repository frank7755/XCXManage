import React, { Fragment } from 'react';
import propTypes from 'prop-types';
import BaseDrawer from './BaseDrawer';

export { BaseDrawer };

export default class FormDrawer extends React.PureComponent {
  /**
   * @property propTypes
   */
  static propTypes = {
    onClose: propTypes.func,
    onSubmit: propTypes.func,
    trigger: propTypes.element.isRequired
  };

  state = {
    visible: false
  };

  onSubmit = null;

  handleShow = e => {
    const { trigger } = this.props;
    const { onClick } = trigger.props;

    this.onSubmit = null;

    onClick && onClick(e);

    this.setState({ visible: true });
  };

  handleClose = (e, props) => {
    const { onClose } = this.props;

    onClose && onClose(e, props);
    this.setState({ visible: false });
  };

  handleAfterChange = (visible, props) => {
    const { onSubmit } = this;
    const { afterVisibleChange } = this.props;

    this.onSubmit = null;

    !visible && onSubmit && onSubmit();

    afterVisibleChange && afterVisibleChange(visible, props);
  };

  handleSubmit = (payload, props) => {
    const { onSubmit } = this.props;

    this.setState({ visible: false });

    this.onSubmit = () => onSubmit && onSubmit(payload, props);
  };

  render() {
    const { visible } = this.state;
    const { trigger, onSubmit, onClose, afterVisibleChange, ...restProps } = this.props;
    const cloneTrigger = React.cloneElement(trigger, { onClick: this.handleShow });

    return (
      <Fragment>
        {cloneTrigger}
        <BaseDrawer
          {...restProps}
          visible={visible}
          onClose={this.handleClose}
          onSubmit={this.handleSubmit}
          afterVisibleChange={this.handleAfterChange}
        />
      </Fragment>
    );
  }
}
