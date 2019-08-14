export const smooth = (fun: (offset: number, maxOffset: number) => number): (offset: number, maxOffset: number) => number =>
    (offset: number, maxOffset: number): number => {
        const floor = Math.floor(offset);
        const ceil = Math.ceil(offset);
        if (floor === ceil) {
            return fun(offset, maxOffset);
        } else {
            return fun(floor, maxOffset) * (1 - offset + floor) + fun(ceil, maxOffset) * (offset - floor);
        }
    };

export const clamp = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
};
