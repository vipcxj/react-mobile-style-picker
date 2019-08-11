import { withKnobs } from '@storybook/addon-knobs/react';
import { configure } from '@storybook/react';
import { addDecorator } from '@storybook/react';
// noinspection ES6CheckImport
import stories from '../stories/index';

addDecorator(withKnobs);

configure(() => stories, module);