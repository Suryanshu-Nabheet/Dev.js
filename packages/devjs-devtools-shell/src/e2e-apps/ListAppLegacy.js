/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as Devjs from 'devjs';

export default function App(): Devjs.Node {
  return <List />;
}

class List extends Devjs.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      items: ['one', 'two', 'three'],
    };
  }

  addItem = () => {
    if (this.inputRef && this.inputRef.value) {
      this.setState({items: [...this.state.items, this.inputRef.value]});
      this.inputRef.value = '';
    }
  };

  render(): any {
    return (
      <div>
        <input
          data-testname="AddItemInput"
          value={this.state.text}
          onChange={this.onInputChange}
          ref={c => (this.inputRef = c)}
        />
        <button data-testname="AddItemButton" onClick={this.addItem}>
          Add Item
        </button>
        <ul data-testname="List">
          {this.state.items.map((label, index) => (
            <ListItem key={index} label={label} />
          ))}
        </ul>
      </div>
    );
  }
}

// $FlowFixMe[missing-local-annot]
function ListItem({label}) {
  return <li data-testname="ListItem">{label}</li>;
}
