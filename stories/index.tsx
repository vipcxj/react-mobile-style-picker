import { boolean, number, select } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import cs from 'classnames';
import * as React from 'react';
import { Picker } from '../src/index';
import './index.css';

export const stories = storiesOf('Picker', module);
const itemMarginFun1 = (offset: number): number => {
    if (offset === 0) {
        return 18;
    } else if (Math.abs(offset) <= 1) {
        return 9;
    } else {
        return 0;
    }
};
const itemMarginFun2 = (offset: number): number => {
    if (offset === 0) {
        return 0;
    } else if (Math.abs(offset) <= 1) {
        return 9;
    } else {
        return 18;
    }
};
const itemSizeFun1 = (offset: number): number => {
    if (offset === 0) {
        return 36;
    } else if (Math.abs(offset) <= 1) {
        return 30;
    } else {
        return 24;
    }
};
const itemSizeFun2 = (offset: number): number => {
    if (offset === 0) {
        return 24;
    } else if (Math.abs(offset) <= 1) {
        return 30;
    } else {
        return 36;
    }
};
const itemWeightFun1 = (offset: number): number => {
    if (offset === 0) {
        return 3;
    } else if (Math.abs(offset) <= 1) {
        return 2;
    } else {
        return 1;
    }
};
const itemWeightFun2 = (offset: number): number => {
    if (offset === 0) {
        return 1;
    } else if (Math.abs(offset) <= 1) {
        return 2;
    } else {
        return 3;
    }
};
const createSelectOption = (keys: string[]) => {
    const options: { [key: string]: number } = {};
    for (let i = 0; i < keys.length; ++i) {
        options[keys[i]] = i;
    }
    return options;
};
const getSelectValue = (index: number, keys: string[], options: { [x: string]: any }) => {
    return options[keys[index]];
};
const itemSizeKeys = ['undefined (default 34)', '24 (fixed)', '24 -> 30 -> 36 -> 30 -> 24', '36 -> 30 -> 24 -> 30 -> 36'];
const itemSizeOptions: { [x: string]: any; } = {
    [itemSizeKeys[0]]: undefined,
    [itemSizeKeys[1]]: 24,
    [itemSizeKeys[2]]: itemSizeFun1,
    [itemSizeKeys[3]]: itemSizeFun2,
};
const itemWeightKeys = ['undefined (default 1)', '1.5 (fixed)', '1 -> 2 -> 3 -> 2 -> 1', '3 -> 2 -> 1 -> 2 -> 3'];
const itemWeightOptions: { [x: string]: any; } = {
    [itemWeightKeys[0]]: undefined,
    [itemWeightKeys[1]]: 1.5,
    [itemWeightKeys[2]]: itemWeightFun1,
    [itemWeightKeys[3]]: itemWeightFun2,
};
const itemMarginKeys = ['undefined (default 0)', '10 (fixed)', '0 -> 9 -> 18 -> 9 -> 0', '18 -> 9 -> 0 -> 9 -> 18'];
const itemMarginOptions: { [x: string]: any; } = {
    [itemMarginKeys[0]]: undefined,
    [itemMarginKeys[1]]: 10,
    [itemMarginKeys[2]]: itemMarginFun1,
    [itemMarginKeys[3]]: itemMarginFun2,
};
const rotateKeys = ['undefined (default false)', 'true', 'false', '10 degree', '20 degree', '30 degree'];
const rotateOptions: { [x: string]: boolean | number; } = {
    [rotateKeys[0]]: undefined,
    [rotateKeys[1]]: true,
    [rotateKeys[2]]: false,
    [rotateKeys[3]]: 10,
    [rotateKeys[4]]: 20,
    [rotateKeys[5]]: 30,
};
const maskKeys = ['undefined (default true)', 'true', 'false', '[0, 1]', '[0.1, 0.9]', '[0.3, 0.7]', '[0.5, 0.5]'];
const maskOptions: { [x: string]: boolean | [number, number]; } = {
    [maskKeys[0]]: undefined,
    [maskKeys[1]]: true,
    [maskKeys[2]]: false,
    [maskKeys[3]]: [0, 1],
    [maskKeys[4]]: [0.1, 0.9],
    [maskKeys[5]]: [0.3, 0.7],
    [maskKeys[6]]: [0.5, 0.5],
};
stories.add(
    'base',
    () => {
        const size = number('size', 7);
        const itemSize = getSelectValue(select('itemSize', createSelectOption(itemSizeKeys), undefined), itemSizeKeys, itemSizeOptions);
        const itemWeight = getSelectValue(select('itemWeight', createSelectOption(itemWeightKeys), undefined), itemWeightKeys, itemWeightOptions);
        const itemMargin = getSelectValue(select('itemMargin', createSelectOption(itemMarginKeys), undefined), itemMarginKeys, itemMarginOptions);
        const rotate = getSelectValue(select('rotate', createSelectOption(rotateKeys), undefined), rotateKeys, rotateOptions);
        const mask = getSelectValue(select('mask', createSelectOption(maskKeys), undefined), maskKeys, maskOptions);
        const smooth = boolean('smooth', true);
        const mode = select('mode', {
            vertical: 'vertical',
            horizontal: 'horizontal',
        }, 'vertical') as 'vertical' | 'horizontal';
        const color = boolean('colored', false);
        const dragSelect = boolean('drag to select', true);
        const clickSelect = boolean('click to select', true);
        const scrollSelect = boolean('scroll to select', true);
        const loading = boolean('loading', false);
        return (
            <Picker
                size={size}
                itemMargin={itemMargin}
                itemSize={itemSize}
                itemWeight={itemWeight}
                rotate={rotate}
                mask={mask}
                smooth={smooth}
                mode={mode}
                dragSelect={dragSelect}
                clickSelect={clickSelect}
                scrollSelect={scrollSelect}
                loading={loading}
            >
                <Picker.Item value={0} style={{ backgroundColor: color && 'rgba(0, 255, 255)' }}>zero</Picker.Item>
                <Picker.Item value={1} style={{ backgroundColor: color && 'rgba(255, 0, 255)' }}>one</Picker.Item>
                <Picker.Item value={2} style={{ backgroundColor: color && 'rgba(255, 255, 0)' }}>two</Picker.Item>
                <Picker.Item value={3} style={{ backgroundColor: color && 'rgba(0, 255, 255)' }}>three</Picker.Item>
                <Picker.Item value={4} style={{ backgroundColor: color && 'rgba(255, 0, 255)' }}>four</Picker.Item>
                <Picker.Item value={5} style={{ backgroundColor: color && 'rgba(255, 255, 0)' }}>five</Picker.Item>
            </Picker>
        );
    },
    { info: { inline: true }},
);
const LoadingIcon = (props: { className: string }) => (
    <div className={cs("sk-circle", props.className)}>
        <div className="sk-circle1 sk-child"/>
        <div className="sk-circle2 sk-child"/>
        <div className="sk-circle3 sk-child"/>
        <div className="sk-circle4 sk-child"/>
        <div className="sk-circle5 sk-child"/>
        <div className="sk-circle6 sk-child"/>
        <div className="sk-circle7 sk-child"/>
        <div className="sk-circle8 sk-child"/>
        <div className="sk-circle9 sk-child"/>
        <div className="sk-circle10 sk-child"/>
        <div className="sk-circle11 sk-child"/>
        <div className="sk-circle12 sk-child"/>
    </div>
);
stories.add(
    'nested',
    () => {
        const margin = (offset: number) => offset === 0 ? 24 : 0;
        const indicator = (key: string, size: number, marginStart: number, marginEnd: number) => (
            <div key={key} className="indicator">
                <div className="icons" style={{ width: size + marginStart + marginEnd }}>
                    <LoadingIcon className="icon left-icon"/>
                    <LoadingIcon className="icon right-icon"/>
                </div>
            </div>
        );
        return (
            <Picker
                mode="horizontal"
                dragSelect={false}
                scrollSelect={false}
                size={3}
                itemMargin={margin}
                itemStyle={{ padding: 0 }}
                indicatorStyle={{ border: 'none' }}
                indicatorComponent={indicator}
                mask={false}
            >
                <Picker.Item value={0}>
                    <Picker>
                        <Picker.Item value={0}>zero</Picker.Item>
                        <Picker.Item value={1}>one</Picker.Item>
                        <Picker.Item value={2}>two</Picker.Item>
                        <Picker.Item value={3}>three</Picker.Item>
                        <Picker.Item value={4}>four</Picker.Item>
                        <Picker.Item value={5}>five</Picker.Item>
                    </Picker>
                </Picker.Item>
                <Picker.Item value={1}>
                    <Picker>
                        <Picker.Item value={0}>zero</Picker.Item>
                        <Picker.Item value={1}>one</Picker.Item>
                        <Picker.Item value={2}>two</Picker.Item>
                        <Picker.Item value={3}>three</Picker.Item>
                        <Picker.Item value={4}>four</Picker.Item>
                        <Picker.Item value={5}>five</Picker.Item>
                    </Picker>
                </Picker.Item>
                <Picker.Item value={2}>
                    <Picker>
                        <Picker.Item value={0}>zero</Picker.Item>
                        <Picker.Item value={1}>one</Picker.Item>
                        <Picker.Item value={2}>two</Picker.Item>
                        <Picker.Item value={3}>three</Picker.Item>
                        <Picker.Item value={4}>four</Picker.Item>
                        <Picker.Item value={5}>five</Picker.Item>
                    </Picker>
                </Picker.Item>
            </Picker>
        )
    }
);

export default stories;