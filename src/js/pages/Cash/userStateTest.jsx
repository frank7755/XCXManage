import React, { useState } from 'react';

export default function Example() {
  // 声明一个叫 "count" 的 state 变量
  const [state, setState] = useState({ a: 1, b: 2 });
  // const [num, setCount] = useState('world');

  return (
    <div>
      <p>
        You clicked {state.a} - {state.b} times
      </p>
      <button onClick={() => setState({ ...state, a: 2})}>Click me</button>
    </div>
  );
}
