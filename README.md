# react-mobile-style-picker &middot; ![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg) [![npm version](https://img.shields.io/npm/v/react-mobile-style-picker.svg?style=flat)](https://www.npmjs.com/package/react-mobile-style-picker)

The most powerful mobile-style picker component for [React](https://reactjs.org/) used in web at this moment.
Based on this [project](https://github.com/react-component/m-picker), but with a lot of improvements and new features.

## improvement

- `drag to select` works properly out of the component.

## new features

- support `horizontal` mode.
- support style a height or width to the component, and the height and width of the picker item will be automatically computed.
- support `click to select`, and not conflict with `drag to select`.
- support `scroll to select`.
- support `onClick` and other callback of the picker item.
- support custom indicator.
- support custom picker item size.
- support custom picker item margin.
- support custom max visible picker item.
- support custom rotate effect.
- support custom mask alpha.
- support loading state.

## Installation

Using [npm](https://www.npmjs.com/):

    $ npm install --save react-mobile-style-picker
    
## Demo

[storybook](https://vipcxj.github.io/react-mobile-style-picker/)

## Example
    
```javascript
import React from 'react';
import { Picker } from 'react-mobile-style-picker';
import 'react-mobile-style-picker/dist/index.css' // or index.less

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

## Props

WIP
