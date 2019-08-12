# react-mobile-style-picker &middot; ![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg) [![npm version](https://img.shields.io/npm/v/react-mobile-style-picker.svg?style=flat)](https://www.npmjs.com/package/react-mobile-style-picker)

mobile-style picker component for [React](https://reactjs.org/).

## Installation

Using [npm](https://www.npmjs.com/): (not released yet.)

    $ npm install --save react-mobile-style-picker
    
## Demo

[storybook](https://vipcxj.github.io/react-mobile-style-picker/)

## Example
    
```javascript
import React from 'react';
import Picker from 'react-mobile-style-picker';
import 'react-mobile-style-picker/index.css' // or index.less

const App = (
  <Picker>
    <Picker.Item value={0}>zero</Picker.Item>
    <Picker.Item value={1}>one</Picker.Item>
    <Picker.Item value={2}>two</Picker.Item>
    <Picker.Item value={3}>three</Picker.Item>
    <Picker.Item value={4}>four</Picker.Item>
    <Picker.Item value={5}>five</Picker.Item>
  </Picker>
);

const root = document.getElementById('root');
ReactDOM.render(<App />, root);

```
