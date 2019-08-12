import classNames from 'classnames';
import * as React from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { clamp } from './tools';

export interface IPickerProps {
    disabled?: boolean;
    value?: any;
    onChange?: (value: any) => void;
    itemStyle?: any;
    children?: Array<React.ReactElement<IItemProps>>;
    mode?: 'vertical'|'horizontal'
    itemSize?: number | ((offset: number) => number);
    itemWeight?: number | ((offset: number) => number);
    itemMargin?: number | ((offset: number) => number);
    size?: number;
    indicatorStyle?: any;
    indicatorClassName?: string;
    className?: string;
    defaultValue?: any;
    style?: React.CSSProperties;
    onScrollChange?: (value: any) => void;
    noAnimate?: boolean;
    rotate?: boolean | number;
    mask?: boolean | [number, number];
}

interface IPickerState {
    value?: any;
    rootHeight: number;
    rootWidth: number;
    centerOffset: number;
}

export interface IItemProps extends React.HTMLAttributes<HTMLDivElement> {
    value: any;
    className?: string;
    style?: React.CSSProperties;
}
const PREFIX_CLASS = 'm-style-picker';
const Item = (ignored: IItemProps): null => null;

const createVelocity = (minInterval: number = 30, maxInterval: number = 100) => {
    let time = 0;
    let y = 0;
    let velocity = 0;
    const recorder = {
        reset: () => {
            time = 0;
            y = 0;
            velocity = 0;
        },
        getVelocity: (aY: number) => {
            if (aY !== y) {
                recorder.record(aY);
            }
            return velocity;
        },
        record: (aY: number) => {
            const now = +new Date();
            velocity = (aY - y) / (now - time);
            if (now - time >= minInterval) {
                velocity = now - time <= maxInterval ? velocity : 0;
                y = aY;
                time = now;
            }
        },
    };
    return recorder;
};

const createStep = (lineHeight: number, maxInterval: number = 600) => {
    let time = 0;
    let step = 0;
    return {
        reset: () => {
            time = 0;
            step = 0;
        },
        move: (delta: number, mode: 0 | 1 | 2): 0|-1|1 => {
            const now = +new Date();
            if (now - time > maxInterval) {
                time = now;
                step = 0;
                return 0;
            }
            if (mode === 0) {
                step += delta / lineHeight;
            } else {
                step += delta;
            }
            if (step >= 1) {
                time = now;
                step = 0;
                return 1;
            }
            if (step <= -1) {
                time = now;
                step = 0;
                return -1;
            }
            return 0;
        }
    };
};

export default class Picker extends React.Component<IPickerProps, IPickerState> {

    public static readonly Item = Item;

    private scrollHandlers = (() => {
        let scroll: number = -1;
        let last: number = 0;
        let start: number = 0;
        let scrollDisabled: boolean = false;
        let isMoving: boolean = false;

        const setTransform = (nodeStyle: CSSStyleDeclaration, value: string) => {
            nodeStyle.transform = value;
            // noinspection JSDeprecatedSymbols
            nodeStyle.webkitTransform = value;
            (nodeStyle as any).msTransform = value;
            (nodeStyle as any).MozTransform = value;
            (nodeStyle as any).OTransform = value;
        };

        const setTransition = (nodeStyle: CSSStyleDeclaration, value: string) => {
            nodeStyle.transition = value;
            // noinspection JSDeprecatedSymbols
            nodeStyle.webkitTransition = value;
        };

        const scrollTo = (target: number, time: number = .3) => {
            const { mode = 'vertical' } = this.props;
            if (scroll !== target) {
                scroll = target;
                if (time && !this.props.noAnimate) {
                    setTransition(this.contentRef.style, `cubic-bezier(0,0,0.2,1.15) ${time}s`);
                    setTimeout(() => {
                        this.scrollingComplete();
                        if (this.contentRef) {
                            setTransition(this.contentRef.style, '');
                        }
                    }, +time * 1000);
                }
                switch (mode) {
                    case "vertical":
                        setTransform(this.contentRef.style, `translate3d(0,${-target}px,0)`);
                        break;
                    case "horizontal":
                        setTransform(this.contentRef.style, `translate3d(${-target}px,0,0)`);
                }
            }
        };

        const Velocity = createVelocity();
        let Step: { move: (delta: number, mode: number) => 0|-1|1 };

        const onFinish = () => {
            isMoving = false;
            let target = scroll;

            let time = .3;

            const velocity = Velocity.getVelocity(target) * 4;
            if (velocity) {
                target = velocity * 40 + target;
                time = Math.abs(velocity) * .1;
            }
            target = this.adaptScrollTarget(target);

            scrollTo(target, time < .3 ? .3 : time);
            this.onScrollChange();
        };

        const onStart = (y: number) => {
            if (scrollDisabled) {
                return;
            }

            isMoving = true;
            start = y;
            last = scroll;
        };

        const onMove = (y: number) => {
            if (scrollDisabled || !isMoving) {
                return;
            }
            const { mode = 'vertical' } = this.props;
            scroll = last - y + start;
            Velocity.record(scroll);
            this.onScrollChange();
            switch (mode) {
                case "vertical":
                    setTransform(this.contentRef.style, `translate3d(0,${-scroll}px,0)`);
                    break;
                case "horizontal":
                    setTransform(this.contentRef.style, `translate3d(${-scroll}px,0,0)`);
                    break;
            }
        };

        let supportsWheel = false;

        const onWheel = (evt: WheelEvent) => {
            if (evt.type === 'wheel') {
                supportsWheel = true;
            } else if (supportsWheel) {
                return;
            }
            if (!Step) {
               Step = createStep(34);
            }
            const { mode = 'vertical' } = this.props;
            if (mode === 'vertical') {
                const delta: number = evt.deltaY;
                const step = Step.move(delta, evt.deltaMode);
                if (step === 1) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    this.selectNext(this.scrollTo);
                }
                if (step === -1) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    this.selectLast(this.scrollTo);
                }
            }
            return false;
        };

        return {
            touchstart: (evt: TouchEvent) => {
                const { mode = 'vertical' } = this.props;
                onStart(mode === 'vertical' ? evt.touches[0].screenY : evt.touches[0].screenX);
            },
            mousedown: (evt: MouseEvent) => {
                const { mode = 'vertical' } = this.props;
                onStart(mode === 'vertical' ? evt.screenY : evt.screenX);
            },
            touchmove: (evt: TouchEvent) => {
                evt.preventDefault();
                const { mode = 'vertical' } = this.props;
                onMove(mode === 'vertical' ? evt.touches[0].screenY : evt.touches[0].screenX);
            },
            mousemove: (evt: MouseEvent) => {
                evt.preventDefault();
                const { mode = 'vertical' } = this.props;
                onMove(mode === 'vertical' ? evt.screenY : evt.screenX);
            },
            touchend: () => onFinish(),
            touchcancel: () => onFinish(),
            mouseup: () => onFinish(),
            wheel: onWheel,
            getValue: () => {
                return scroll;
            },
            scrollTo,
            setDisabled: (disabled: boolean = false) => {
                scrollDisabled = disabled;
            },
        };
    })();

    private contentRef: HTMLDivElement;
    private indicatorRef: HTMLDivElement;
    private maskRef1: HTMLDivElement;
    private maskRef2: HTMLDivElement;
    private rootRef: HTMLDivElement;
    private readonly gridsRef: Array<React.RefObject<HTMLDivElement>>;
    private readonly gridsOffset: number[];
    private readonly items: React.ReactNode[];
    private scrollValue: number;
    private observer: ResizeObserver;

    public constructor(props: IPickerProps) {
        super(props);

        let selectedValueState;
        const { value, defaultValue } = this.props;
        if (value !== undefined) {
            selectedValueState = value;
        } else if (defaultValue !== undefined) {
            selectedValueState = defaultValue;
        } else {
            const children: any = React.Children.toArray(this.props.children);
            selectedValueState = children && children[0] && children[0].props.value;
        }
        this.state = {
            value: selectedValueState,
            rootWidth: 0,
            rootHeight: 0,
            centerOffset: 0,
        };
        this.items = [];
        const size = this.normedSize();
        this.gridsRef = [];
        this.gridsOffset = [];
        for (let i = 0; i < size; ++i) {
            this.gridsRef[i] = React.createRef();
            this.gridsOffset[i] = 0;
        }
    }

    public componentDidMount() {
        const { rootRef } = this;
        this.layout(rootRef.getBoundingClientRect().width, rootRef.getBoundingClientRect().height);
        this.observer = new ResizeObserver(() => {
            this.layout(rootRef.getBoundingClientRect().width, rootRef.getBoundingClientRect().height);
        });
        this.observer.observe(rootRef);
        this.scrollHandlers.setDisabled(this.props.disabled);
        this.select(this.state.value, this.scrollTo);

        const passiveSupported = this.passiveSupported();
        const willPreventDefault = passiveSupported ? { passive: false } : false;
        const willNotPreventDefault = passiveSupported ? { passive: true } : false;
        rootRef.addEventListener('touchstart', this.scrollHandlers.touchstart, willNotPreventDefault);
        rootRef.addEventListener('touchcancel', this.scrollHandlers.touchcancel, willNotPreventDefault);
        rootRef.addEventListener('touchend', this.scrollHandlers.touchend, willNotPreventDefault);
        rootRef.addEventListener('touchmove', this.scrollHandlers.touchmove, willPreventDefault);
        rootRef.addEventListener('mousedown', this.scrollHandlers.mousedown, willNotPreventDefault);
        rootRef.addEventListener('mousemove', this.scrollHandlers.mousemove, willPreventDefault);
        rootRef.addEventListener('mouseup', this.scrollHandlers.mouseup, willNotPreventDefault);
        rootRef.addEventListener('wheel', this.scrollHandlers.wheel, willPreventDefault);
        rootRef.addEventListener('mousewheel', this.scrollHandlers.wheel, willPreventDefault);
        rootRef.addEventListener('DOMMouseScroll', this.scrollHandlers.wheel, willPreventDefault);
    }

    public componentWillUnmount() {
        const { rootRef } = this;
        rootRef.removeEventListener('touchstart', this.scrollHandlers.touchstart);
        rootRef.removeEventListener('touchcancel', this.scrollHandlers.touchcancel);
        rootRef.removeEventListener('touchend', this.scrollHandlers.touchend);
        rootRef.removeEventListener('touchmove', this.scrollHandlers.touchmove);
        rootRef.removeEventListener('mousedown', this.scrollHandlers.mousedown);
        rootRef.removeEventListener('mousemove', this.scrollHandlers.mousemove);
        rootRef.removeEventListener('mouseup', this.scrollHandlers.mouseup);
        rootRef.removeEventListener('wheel', this.scrollHandlers.wheel);
        rootRef.removeEventListener('mousewheel', this.scrollHandlers.wheel);
        rootRef.removeEventListener('DOMMouseScroll', this.scrollHandlers.wheel);
        this.observer.disconnect();
    }

    public componentWillReceiveProps(nextProps: IPickerProps) {
        if ('value' in nextProps) {
            if (this.state.value !== nextProps.value) {
                this.setState({
                    value: nextProps.value,
                }, () => {
                    this.select(
                        nextProps.value,
                        nextProps.noAnimate ? this.scrollToWithoutAnimation : this.scrollTo,
                    );
                });
            }
        }
        this.scrollHandlers.setDisabled(nextProps.disabled);
    }

    public shouldComponentUpdate(nextProps: Readonly<IPickerProps>, nextState: Readonly<IPickerState>) {
        return this.state.value !== nextState.value
            || this.state.rootWidth !== nextState.rootWidth
            || this.state.rootHeight !== nextState.rootHeight
            || this.props.itemSize !== nextProps.itemSize
            || this.props.itemWeight !== nextProps.itemWeight
            || this.props.itemMargin !== nextProps.itemMargin
            || this.props.children !== nextProps.children;
    }

    public componentDidUpdate() {
        this.select(this.state.value, this.scrollToWithoutAnimation);
    }

    public render() {
        const { props } = this;
        const {
            mode = 'vertical',
            itemStyle,
            indicatorClassName = '',
            children,
        } = props;
        const itemClassName = `${PREFIX_CLASS}-item`;
        const selectedItemClassName = `${itemClassName} ${PREFIX_CLASS}-item-selected`;
        const numChildren = React.Children.count(children);
        const map = (item: React.ReactElement<IItemProps>, index: number) => {
            const { className = '', style, value, onClick, onMouseDown, onMouseUp, onTouchStart, onTouchEnd, ...rest } = item.props;
            let startX: number;
            let startY: number;
            let dist: number = -1;
            const onMStart = (evt: React.MouseEvent<HTMLDivElement>) => {
                startX = evt.clientX;
                startY = evt.clientY;
                if (onMouseDown) {
                    onMouseDown(evt);
                }
            };
            const onMFinish = (evt: React.MouseEvent<HTMLDivElement>) => {
                dist = (evt.clientX - startX) * (evt.clientX - startX) + (evt.clientY - startY) * (evt.clientY - startY);
                if (onMouseUp) {
                    onMouseUp(evt);
                }
            };
            const onTStart = (evt: React.TouchEvent<HTMLDivElement>) => {
                startX = evt.touches[0].clientX;
                startY = evt.touches[0].clientY;
                if (onTouchStart) {
                    onTouchStart(evt);
                }
            };
            const onTFinish = (evt: React.TouchEvent<HTMLDivElement>) => {
                dist = (evt.touches[0].clientX - startX) * (evt.touches[0].clientX - startX) + (evt.touches[0].clientY - startY) * (evt.touches[0].clientY - startY);
                if (onTouchEnd) {
                    onTouchEnd(evt);
                }
            };
            const onClickHandler = (evt: React.MouseEvent<HTMLDivElement>) => {
                if (dist < 1 && onClick) {
                    onClick(evt);
                }
                if (dist < 1 && !evt.isDefaultPrevented()) {
                    this.clickToScroll(value);
                }
            };
            const base = this.calcBaseItemSize();
            const maxOffset = this.calcMaxOffset();
            const offset = this.calcOffset(index, base);
            const itemSize = this.calcItemSize(offset, base);
            const margin = (offset <= maxOffset && offset >= -maxOffset) ? this.calcItemMargin(offset, 0) : 0;
            let finalStyle: React.CSSProperties;
            if (mode === 'vertical') {
                finalStyle = {
                    ...itemStyle,
                    ...style,
                    height: itemSize,
                    lineHeight: `${itemSize}px`,
                    width: '100%',
                    margin: `${index === 0 ? 0 : margin}px 0px ${index === numChildren - 1 ? 0 : margin}px 0px`,
                }
            } else {
                finalStyle = {
                    ...itemStyle,
                    ...style,
                    height: '100%',
                    width: itemSize,
                    lineHeight: `${this.state.rootHeight}px`,
                    float: "left",
                    margin: `0px ${index === 0 ? 0 : margin}px 0px ${index === numChildren - 1 ? 0 : margin}px`,
                }
            }
            return (
                <div
                    style={finalStyle}
                    className={`${value === this.state.value ? selectedItemClassName : itemClassName} ${className}`}
                    key={value}
                    ref={ref => this.items[index] = ref}
                    onMouseDown={onMStart}
                    onMouseUp={onMFinish}
                    onTouchStart={onTStart}
                    onTouchEnd={onTFinish}
                    onClick={onClickHandler}
                    {...rest}
                >
                    { item.props.children || null }
                </div>
            );
        };
        // compatibility for preact
        const items = React.Children ? React.Children.map(children, map) : ([] as any[]).concat(children).map(map);
        const pickerCls = {
            [props.className as string]: !!props.className,
            [PREFIX_CLASS as string]: true,
        };

        let pickerStyle: React.CSSProperties;
        let indicatorStyle: React.CSSProperties;
        const indicatorSize = this.calcItemSize(0);
        if (mode === 'vertical') {
            pickerStyle = {
                ...props.style,
            };
            if (!pickerStyle.height) {
                pickerStyle.height = this.calcContainerSizeByProps();
            }
            indicatorStyle = {
                ...props.indicatorStyle,
                width: '100%',
                height: indicatorSize,
                left: 0,
            }
        } else {
            pickerStyle = {
                ...props.style,
            };
            if (!pickerStyle.width && this.props.itemSize) {
                pickerStyle.width = this.calcContainerSizeByProps();
            }
            indicatorStyle = {
                ...props.indicatorStyle,
                width: indicatorSize,
                height: '100%',
                top: 0,
            }
        }
        return (
            <div className={classNames(pickerCls)} ref={el => this.rootRef = el} style={pickerStyle}>
                <div className={`${PREFIX_CLASS}-mask`} ref={el => this.maskRef1 = el} />
                <div className={`${PREFIX_CLASS}-mask`} ref={el => this.maskRef2 = el} />
                <div
                    className={`${PREFIX_CLASS}-indicator ${PREFIX_CLASS}-indicator-${mode} ${indicatorClassName}`}
                    ref={el => this.indicatorRef = el}
                    style={indicatorStyle}
                />
                <div className={`${PREFIX_CLASS}-content ${PREFIX_CLASS}-content-${mode}`} ref={el => this.contentRef = el}>
                    {items}
                </div>
                <div className={`${PREFIX_CLASS}-grids-${mode}`}>
                    { this.createGrids() }
                </div>
            </div>
        );
    }

    public getValue = () => {
        if ('value' in this.props) {
            return this.props.value;
        }
        const children: any = React.Children.toArray(this.props.children);
        return children && children[0] && children[0].props.value;
    };

    private layout = (width: number, height: number) => {
        const { mode = 'vertical', mask = true } = this.props;
        let centerOffset: number;
        const base = this.calcBaseItemSize(width, height);
        let maskValue: [number, number];
        if (typeof mask === 'boolean') {
            maskValue = mask ? [0.5, 0.9] : [0, 0];
        } else {
            maskValue = mask;
        }
        const indicatorUpMargin = this.calcItemMargin(0, 1);
        const indicatorDownMargin = this.calcItemMargin(0, -1);
        const indicatorSize = this.calcItemSize(0, base) + indicatorUpMargin + indicatorDownMargin;
        if (mode === 'vertical') {
            centerOffset = (height - indicatorSize) / 2;
            this.contentRef.style.top = `${centerOffset + indicatorUpMargin}px`;
            this.indicatorRef.style.top = `${centerOffset + indicatorUpMargin}px`;
            this.maskRef1.style.backgroundImage = `linear-gradient(to bottom, rgba(255, 255, 255, ${maskValue[1]}), rgba(255, 255, 255, ${maskValue[0]}))`;
            this.maskRef1.style.backgroundPosition = 'top';
            this.maskRef1.style.top = '0px';
            this.maskRef1.style.left = '0px';
            this.maskRef1.style.width = '100%';
            this.maskRef1.style.height = `${centerOffset}px`;
            this.maskRef2.style.backgroundImage = `linear-gradient(to top, rgba(255, 255, 255, ${maskValue[1]}), rgba(255, 255, 255, ${maskValue[0]}))`;
            this.maskRef2.style.backgroundPosition = 'bottom';
            this.maskRef2.style.top = `${centerOffset + indicatorSize}px`;
            this.maskRef1.style.left = '0px';
            this.maskRef2.style.width = '100%';
            this.maskRef2.style.height = `${centerOffset}px`;
        } else {
            centerOffset = (width - indicatorSize) / 2;
            this.contentRef.style.left = `${centerOffset + indicatorUpMargin}px`;
            this.indicatorRef.style.left = `${centerOffset + indicatorUpMargin}px`;
            this.maskRef1.style.backgroundImage = `linear-gradient(to right, rgba(255, 255, 255, ${maskValue[1]}), rgba(255, 255, 255, ${maskValue[0]}))`;
            this.maskRef1.style.backgroundPosition = 'left';
            this.maskRef1.style.top = '0px';
            this.maskRef1.style.left = '0px';
            this.maskRef1.style.height = '100%';
            this.maskRef1.style.width = `${centerOffset}px`;
            this.maskRef2.style.backgroundImage = `linear-gradient(to left, rgba(255, 255, 255, ${maskValue[1]}), rgba(255, 255, 255, ${maskValue[0]}))`;
            this.maskRef2.style.backgroundPosition = 'right';
            this.maskRef2.style.top = '0px';
            this.maskRef2.style.left = `${centerOffset + indicatorSize}px`;
            this.maskRef2.style.height = '100%';
            this.maskRef2.style.width = `${centerOffset}px`;
        }
        this.createGridsOffset();
        const state = {
            rootWidth: width,
            rootHeight: height,
            centerOffset,
        };
        this.setState(state);
        return state;
    };

    private getGridRef = (offset: number, maxOffset?: number): React.RefObject<HTMLDivElement> => {
        maxOffset = maxOffset === undefined ? this.calcMaxOffset() : maxOffset;
        return this.gridsRef[offset + maxOffset];
    };

    private createGridsOffset = (maxOffset?: number) => {
        maxOffset = maxOffset === undefined ? this.calcMaxOffset() : maxOffset;
        const { mode = 'vertical' } = this.props;
        const centerGridRef = this.getGridRef(0, maxOffset);
        for (let offset = -maxOffset; offset <= maxOffset; ++offset) {
            const gridRef = this.getGridRef(offset, maxOffset);
            if (centerGridRef.current && gridRef.current) {
                if (mode === 'vertical') {
                    this.gridsOffset[offset + maxOffset] = gridRef.current.getBoundingClientRect().top - centerGridRef.current.getBoundingClientRect().top;
                } else {
                    this.gridsOffset[offset + maxOffset] = gridRef.current.getBoundingClientRect().left - centerGridRef.current.getBoundingClientRect().left;
                }
            } else {
                this.gridsOffset[offset + maxOffset] = 0;
            }
        }
    };

    private getGridOffset = (offset: number, maxOffset?: number) => {
        maxOffset = maxOffset === undefined ? this.calcMaxOffset() : maxOffset;
        return this.gridsOffset[offset + maxOffset];
    };

    private createGrids = () => {
        const maxOffset = this.calcMaxOffset();
        const nodes: React.ReactNode[] = [];
        const { mode = 'vertical' } = this.props;
        for (let i = -maxOffset; i <= maxOffset; ++i) {
            const size = this.calcItemSize(i);
            const margin = this.calcItemMargin(i, 0);
            const style = {
                flexGrow: size,
                flexShrink: size,
                margin: mode === 'vertical'
                    ? `${i === maxOffset ? 0 : margin}px 0px ${i === -maxOffset ? 0 : margin}px 0px`
                    : `0px ${i === maxOffset ? 0 : margin}px 0px ${i === -maxOffset ? 0 : margin}px`,
            };
            nodes.push(
                <div key={i} className="m-style-picker-grid" style={style} ref={this.getGridRef(i, maxOffset)} />
            );
        }
        return nodes;
    };

    private normedSize = (): number => {
        let { size = 7 } = this.props;
        if (size <= 0) {
            size = 1;
        }
        if (size % 2 !== 1) {
            size += 1;
        }
        return size;
    };

    private calcItemWeight = (offset: number, maxOffset?: number): number => {
        if (maxOffset === undefined) { maxOffset = this.calcMaxOffset(); }
        const { itemSize, itemWeight = 1 } = this.props;
        if (typeof itemSize === 'number') {
            return itemSize;
        } else if (typeof itemSize === 'function') {
            if (offset > maxOffset) {
                return itemSize(maxOffset);
            } else if (offset > -maxOffset) {
                const ceil = Math.ceil(offset);
                const floor = Math.floor(offset);
                return ceil === floor ? itemSize(offset) : (itemSize(floor) * (1 - offset + floor) + itemSize(ceil) * (offset - floor));
            } else {
                return itemSize(-maxOffset);
            }
        } else if (typeof itemWeight === 'number') {
            return itemWeight;
        } else if (typeof itemWeight === 'function') {
            if (offset > maxOffset) {
                return itemWeight(maxOffset);
            } else if (offset > -maxOffset) {
                const ceil = Math.ceil(offset);
                const floor = Math.floor(offset);
                return ceil === floor ? itemWeight(offset) : (itemWeight(floor) * (1 - offset + floor) + itemWeight(ceil) * (offset - floor));
            } else {
                return itemWeight(-maxOffset);
            }
        } else {
            return 1;
        }
    };

    private calcBaseItemSize = (rootWidth?: number, rootHeight?: number): number => {
        let cSize;
        const { mode = 'vertical' } = this.props;
        if (mode === 'vertical') {
            cSize = rootHeight === undefined ? this.state.rootHeight : rootHeight;
        } else {
            cSize = rootWidth === undefined ? this.state.rootWidth : rootWidth;
        }
        let multi = 0;
        const maxOffset = this.calcMaxOffset();
        for (let i = -maxOffset; i <= maxOffset; ++i) {
            const weight = this.calcItemWeight(i, maxOffset);
            multi += weight;
            if (i !== maxOffset) {
                cSize -= this.calcItemMargin(i, 1);
            }
        }
        if (cSize <= 0) {
            return 0;
        }
        return Math.max(cSize / multi, 0 );
    };

    private calcItemSize = (offset: number, base?: number): number => {
        if (base === undefined) { base = this.calcBaseItemSize() }
        const weight = this.calcItemWeight(offset);
        return weight * base;
    };

    private calcItemMargin = (offset: number, dir: -1|0|1): number => {
        const {itemMargin = 0 } = this.props;
        if (typeof itemMargin === 'number') {
            return itemMargin;
        } else {
            const margin = itemMargin(offset);
            if (dir === 0) {
                return margin;
            }
            let adjMargin;
            if (dir < 0) {
                adjMargin = itemMargin(offset - 1);
            } else {
                adjMargin = itemMargin(offset + 1);
            }
            if (margin >= 0 && adjMargin >= 0) {
                return Math.max(margin, adjMargin);
            } else if (margin <= 0 && adjMargin <= 0) {
                return Math.min(margin, adjMargin);
            } else {
                return margin + adjMargin;
            }
        }
    };

    private calcMaxOffset = () => {
        return (this.normedSize() - 1) / 2;
    };

    private calcOffset = (index: number, base?: number, maxOffset?: number): number => {
        base = base === undefined ? this.calcBaseItemSize() : base;
        maxOffset = maxOffset === undefined ? this.calcMaxOffset() : maxOffset;
        const max = this.getGridOffset(maxOffset, maxOffset);
        const scroll = this.scrollHandlers.getValue();
        const topItemSize = this.calcItemSize(maxOffset, base);
        if (scroll >= max) {
            return maxOffset + (scroll - max) / topItemSize - index;
        } else if (scroll >= 0) {
            for (let i = 1; i <= maxOffset; ++i) {
                const gOffset = this.getGridOffset(i, maxOffset);
                if (gOffset > scroll) {
                    return i - (gOffset - scroll) / (this.calcItemSize(i, base) + this.calcItemMargin(i, -1)) - index;
                }
            }
            throw new Error('This is impossible!');
        } else {
            return index;
        }
    };

    private calcScroll = (offset: number, base?: number, maxOffset?: number): number => {
        base = base === undefined ? this.calcBaseItemSize() : base;
        maxOffset = maxOffset === undefined ? this.calcMaxOffset() : maxOffset;
        const upBoundScroll = this.getGridOffset(maxOffset, maxOffset);
        const bottomBoundScroll = this.getGridOffset(-maxOffset, maxOffset);
        if (offset > maxOffset) {
            return upBoundScroll + this.calcItemMargin(maxOffset, 1) + (offset - maxOffset) * this.calcItemSize(maxOffset, base);
        } else if (offset < -maxOffset) {
            return bottomBoundScroll - this.calcItemMargin(-maxOffset, -1) + (maxOffset + offset) * this.calcItemSize(maxOffset, base);
        } else {
            return this.getGridOffset(offset, maxOffset);
        }
    };

    private calcOffsetByScroll = (scroll: number, maxOffset?: number,  base?: number): number => {
        if (scroll <= 0) {
            return 0;
        }
        base = base === undefined ? this.calcBaseItemSize() : base;
        maxOffset = maxOffset === undefined ? this.calcMaxOffset() : maxOffset;
        const gridMaxTarget = this.getGridOffset(maxOffset, maxOffset);
        const maxItemSize = this.calcItemSize(maxOffset);
        if (scroll > gridMaxTarget) {
            return maxOffset + clamp((scroll - gridMaxTarget) / maxItemSize, 0, React.Children.count(this.props.children) - maxOffset - 1);
        } else {
            for (let i = 1; i <= maxOffset; ++i) {
                const offset = this.getGridOffset(i, maxOffset);
                if (offset >= scroll) {
                    return i - (offset - scroll) / this.calcItemSize(i, base);
                }
            }
            return 0;
        }
    };

    private calcCurrentIndexByScroll = (scroll: number, maxOffset?: number): number => {
        const offset = this.calcOffsetByScroll(scroll, maxOffset);
        return Math.max(Math.round(offset), 0);
    };

    private adaptScrollTarget = (target: number): number => {
        if (target <= 0) {
            return 0;
        }
        const maxOffset = this.calcMaxOffset();
        const gridMaxTarget = this.getGridOffset(maxOffset, maxOffset);
        const maxItemSize = this.calcItemSize(maxOffset);
        if (target >= gridMaxTarget) {
            return gridMaxTarget + clamp(Math.ceil((target - gridMaxTarget) / maxItemSize), 0, React.Children.count(this.props.children) - maxOffset - 1) * maxItemSize;
        } else {
            for (let i = 1; i <= maxOffset; ++i) {
                const offset = this.getGridOffset(i, maxOffset);
                if (offset >= target) {
                    return offset;
                }
            }
            return target;
        }
    };

    private calcContainerSizeByProps = () => {
        const { itemSize = 34 } = this.props;
        const offset = this.calcMaxOffset();
        let cSize = 0;
        for (let i = -offset; i <= offset; ++i) {
            let size;
            if (typeof itemSize === 'number') {
                size = itemSize;
            } else {
                size = itemSize(i);
            }
            cSize += size;
            if (i !== offset) {
                cSize += this.calcItemMargin(i, 1);
            }
        }
        return cSize;
    };

    private calcIndex = (value: any): number => {
        const children: any = React.Children.toArray(this.props.children);
        for (let i = 0, len = children.length; i < len; ++i) {
            if (children[i].props.value === value) {
                return i;
            }
        }
        return -1;
    };

    private select = (value: any, scrollTo: (offset: number) => void) => {
        const index = this.calcIndex(value);
        this.selectByIndex(index !== -1 ? index : 0, scrollTo);
    };

    private selectByIndex = (index: number, zScrollTo: (offset: number) => void) => {
        if (index < 0 || index >= React.Children.count(this.props.children)) {
            return;
        }
        const scroll = this.calcScroll(index);
        zScrollTo(scroll);
    };

    private selectLast = (scrollTo: (offset: number) => void) => {
        const index = this.calcIndex(this.state.value);
        this.selectByIndex(index !== -1 ? index - 1 : 0, scrollTo);
    };

    private selectNext = (scrollTo: (offset: number) => void) => {
        const index = this.calcIndex(this.state.value);
        this.selectByIndex(index !== -1 ? index + 1 : 0, scrollTo);
    };

    private doScrollingComplete = (top: number, fireValueChange: (v: any) => void) => {
        const children = React.Children.toArray(this.props.children);
        const index = this.calcCurrentIndexByScroll(top);
        const child: any = children[index];
        if (child) {
            fireValueChange(child.props.value);
            // tslint:disable-next-line:no-console
        } else if (console.warn) {
            // tslint:disable-next-line:no-console
            console.warn('child not found', children, index);
        }
    };

    private passiveSupported() {
        let passiveSupported = false;

        try {
            const options = Object.defineProperty({}, 'passive', {
                get: () => {
                    passiveSupported = true;
                },
            });
            window.addEventListener('test', null as any, options);
            // tslint:disable-next-line:no-empty
        } catch (err) {}
        return passiveSupported;
    }

    private scrollTo = (top: number) => {
        this.scrollHandlers.scrollTo(top);
        this.setScrollEffect();
    };

    private scrollToWithoutAnimation = (top: number) => {
        this.scrollHandlers.scrollTo(top, 0);
        this.setScrollEffect();
    };

    private fireValueChange = (value: any) => {
        if (value !== this.state.value) {
            if (!('value' in this.props)) {
                this.setState({
                    value,
                });
            }
            if (this.props.onChange) {
                this.props.onChange(value);
            }
        }
    };

    private onScrollChange = () => {
        const top = this.scrollHandlers.getValue();
        if (top >= 0) {
            this.setScrollEffect();
            const children = React.Children.toArray(this.props.children);
            const index = this.calcCurrentIndexByScroll(top);
            if (this.scrollValue !== index) {
                this.scrollValue = index;
                const child: any = children[index];
                if (child && this.props.onScrollChange) {
                    this.props.onScrollChange(child.props.value);
                    // tslint:disable-next-line:no-console
                } else if (!child && console.warn) {
                    // tslint:disable-next-line:no-console
                    console.warn('child not found', children, index);
                }
            }
        }
    };

    private scrollingComplete = () => {
        const top = this.scrollHandlers.getValue();
        if (top >= 0) {
            this.doScrollingComplete(top, this.fireValueChange);
        }
    };

    // react渲染会有性能问题，故在这里使用传统方法
    private setScrollEffect = (): void => {
        const { mode = 'vertical' } = this.props;
        let { rotate = false } = this.props;
        const maxOffset = this.calcMaxOffset();
        if (rotate === true) {
            rotate = maxOffset && (75 / maxOffset);
        } else if (typeof rotate !== 'number') {
            rotate = 0;
        }
        const angle = (rotate / 180) * Math.PI;
        const children: any = React.Children.toArray(this.props.children) || [];
        const max: number = children.length;
        this.items.forEach((item: any, index: number) => {
            if (!item) {
                return;
            }
            const offset = this.calcOffset(index);
            const itemSize = this.calcItemSize(offset);
            const itemMargin = this.calcItemMargin(offset, 0);
            if (mode === 'vertical') {
                item.style.margin = `${index === 0 ? 0 : itemMargin}px 0px ${index === max - 1 ? 0 : itemMargin}px 0px`;
                if (rotate !== 0 && offset !== 0) {
                    const offsetIndex = clamp(offset, -90 / (rotate as number), 90 / (rotate as number));
                    item.style.transform = `translateY(${
                        itemSize * (offsetIndex - Math.sin(offsetIndex * angle) / angle)
                    }px) rotateX(${-offsetIndex * (rotate as number)}deg)`;
                } else {
                    item.style.transform = '';
                }
            } else {
                item.style.margin = `0px ${index === 0 ? 0 : itemMargin}px 0px ${index === max - 1 ? 0 :itemMargin}px`;
                if (rotate !== 0 && offset !== 0) {
                    const offsetIndex = clamp(offset, -90 / (rotate as number), 90 / (rotate as number));
                    item.style.transform = `translateX(${
                        itemSize * (offsetIndex - Math.sin(offsetIndex * angle) / angle)
                    }px) rotateY(${-offsetIndex * (rotate as number)}deg)`;
                } else {
                    item.style.transform = '';
                }
            }
        });
    };

    private clickToScroll = (value: any) => {
        this.select(value, this.scrollTo);
    };
}