import { boolean, select } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { Picker } from '../src/index';

// tslint:disable-next-line:no-console
const onClick0 = () => console.log('onClick on Picker.Item');
const onClick1 = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.stopPropagation();
    // tslint:disable-next-line:no-console
    console.log('Because \'stopPropagation\' is called, so the \'onClick\' on Picker.Item will not be called.');
};
const onClick2 = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    // tslint:disable-next-line:no-console
    console.log('Because \'preventDefault\' is called, so the default behavior (auto selected) will not happen.');
};

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
const test = itemMarginFun1(1);
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
const rotateKeys = ['undefined (default true)', 'true', 'false', '10 degree', '20 degree', '30 degree'];
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
        const itemSize = getSelectValue(select('itemSize', createSelectOption(itemSizeKeys), undefined), itemSizeKeys, itemSizeOptions);
        const itemWeight = getSelectValue(select('itemWeight', createSelectOption(itemWeightKeys), undefined), itemWeightKeys, itemWeightOptions);
        const itemMargin = getSelectValue(select('itemMargin', createSelectOption(itemMarginKeys), undefined), itemMarginKeys, itemMarginOptions);
        const rotate = getSelectValue(select('rotate', createSelectOption(rotateKeys), undefined), rotateKeys, rotateOptions);
        const mask = getSelectValue(select('mask', createSelectOption(maskKeys), undefined), maskKeys, maskOptions);
        const smooth = boolean('smooth', true);
        return (
            <Picker
                itemMargin={itemMargin}
                itemSize={itemSize}
                itemWeight={itemWeight}
                rotate={rotate}
                mask={mask}
                smooth={smooth}
            >
                <Picker.Item value={0}>zero</Picker.Item>
                <Picker.Item value={1}>one</Picker.Item>
                <Picker.Item value={2}>two</Picker.Item>
                <Picker.Item value={3}>three</Picker.Item>
                <Picker.Item value={4}>four</Picker.Item>
                <Picker.Item value={5}>five</Picker.Item>
            </Picker>
        );
    },
    { info: { inline: true }},
);
stories.add(
    'horizontal',
    () => {
        return (
            <Picker mode="horizontal">
                <Picker.Item value={0}>zero</Picker.Item>
                <Picker.Item value={1} onClick={onClick0}>
                    one
                    <button onClick={onClick1}>stopPropagation</button>
                    <button onClick={onClick2}>preventDefault</button>
                </Picker.Item>
                <Picker.Item value={2}>two</Picker.Item>
                <Picker.Item value={3}>three</Picker.Item>
                <Picker.Item value={4}>four</Picker.Item>
                <Picker.Item value={5}>five</Picker.Item>
            </Picker>
        )
    }
)

export default stories;