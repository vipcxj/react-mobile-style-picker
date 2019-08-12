import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Picker, { smooth } from '../src/index';
import '../src/index.less';

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
const margin = (offset: number) => {
    return offset === 0 ? 18 : 0;
};
stories.add(
    'base',
    () => {
        return (
            <Picker itemMargin={smooth(margin)} rotate={true}>
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