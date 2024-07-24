export const randomFloat = ( min: number, max: number ): number => {
    return Math.random() * ( max - min ) + min;
};

export const randInt = ( min: number, max: number ): number => {
    return Math.round( randomFloat( min, max ));
};