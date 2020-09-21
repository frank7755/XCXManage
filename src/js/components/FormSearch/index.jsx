import './index.less';

import React from 'react';
import { Form } from 'antd';
import propTypes from 'prop-types';

@Form.create()
export default class FormSearch extends React.PureComponent {
  /**
   * @property propTypes
   */
  static propTypes = {
    onReset: propTypes.func,
    onSearch: propTypes.func,
    prefetch: propTypes.bool,
    onInvalid: propTypes.func,
    children: propTypes.func.isRequired
  };

  /**
   * @property defaultProps
   */
  static defaultProps = {
    prefetch: true,
    layout: 'inline'
  };

  submit = () => {
    const { form, onSearch, onInvalid } = this.props;

    form.validateFields((error, values) => {
      if (error) {
        onInvalid && onInvalid(error, values);
      } else {
        onSearch && onSearch(values);
      }
    });
  };

  reset = () => {
    const { form, onSearch, onReset } = this.props;

    form.resetFields();

    const values = form.getFieldsValue();

    if (onReset) {
      onReset(values);
    } else {
      onSearch(values);
    }
  };

  handleSubmit = e => {
    e.preventDefault();

    this.submit();
  };

  handleReset = e => {
    e.preventDefault();

    this.reset();
  };

  componentDidMount() {
    const { prefetch } = this.props;

    prefetch && this.submit();
  }

  render() {
    const { form, layout, children, className, style, ...restProps } = this.props;

    return (
      <Form
        style={style}
        layout={layout}
        onReset={this.handleReset}
        onSubmit={this.handleSubmit}
        className={className ? `ui-form-search ${className}` : 'ui-form-search'}
      >
        {children({ ...restProps, form, submit: this.submit, reset: this.reset })}
      </Form>
    );
  }
}
