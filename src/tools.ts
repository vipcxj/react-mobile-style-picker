export const smooth = (fun: (offset: number) => number): (offset: number) => number =>
    (offset: number): number => {
        const floor = Math.floor(offset);
        const ceil = Math.ceil(offset);
        if (floor === ceil) {
            return fun(offset);
        } else {
            return fun(floor) * (1 - offset + floor) + fun(ceil) * (offset - floor);
        }
    };

export const clamp = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
};
