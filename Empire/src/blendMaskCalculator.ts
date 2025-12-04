export type BlendMap = number[];

export function createSandGrassBlendMap(): BlendMap {
    const map = new Array(256).fill(-1);

    map[255] = 0;
    map[223] = 0;
    map[85] = 1;
    map[64] = 2;
    map[96] = 2;
    map[192] = 2;
    map[224] = 2;
    map[69] = 3;
    map[231] = 3;
    map[207] = 3;
    map[299] = 3;
    map[199] = 3;
    map[65] = 4;
    map[193] = 5;
    map[195] = 5;
    map[225] = 5;
    map[227] = 5;
    map[203] = 5;
    map[68] = 6;
    map[1] = 7;
    map[3] = 7;
    map[129] = 7;
    map[131] = 7;
    map[139] = 7;
    map[163] = 7;
    map[81] = 8;
    map[241] = 8;
    map[243] = 8;
    map[251] = 8;
    map[80] = 9;
    map[112] = 10;
    map[120] = 10;
    map[240] = 10;
    map[248] = 10;
    map[17] = 11;
    map[51] = 11;
    map[4] = 12;
    map[6] = 12;
    map[14] = 12;
    map[12] = 12;
    map[31] = 13;
    map[151] = 13;
    map[63] = 13;
    map[159] = 13;
    map[191] = 13;
    map[5] = 14;
    map[28] = 15;
    map[30] = 15;
    map[60] = 15;
    map[62] = 15;
    map[7] = 16;
    map[15] = 16;
    map[135] = 16;
    map[143] = 16;
    map[16] = 17;
    map[24] = 17;
    map[56] = 17;
    map[48] = 17;
    map[84] = 18;
    map[124] = 18;
    map[20] = 19;

    return map;
}

export function createDirtStoneBlendMap(): BlendMap {
    const map = new Array(256).fill(-1);

    map[255] = 0;
    map[223] = 0;
    map[85] = 1;
    map[64] = 2;
    map[96] = 2;
    map[192] = 2;
    map[224] = 2;
    map[104] = 2;
    map[69] = 3;
    map[231] = 3;
    map[207] = 3;
    map[299] = 3;
    map[199] = 3;
    map[65] = 4;
    map[193] = 5;
    map[195] = 5;
    map[225] = 5;
    map[227] = 5;
    map[203] = 5;
    map[97] = 5;
    map[68] = 6;
    map[198] = 6;
    map[236] = 6;
    map[1] = 7;
    map[3] = 7;
    map[11] = 7;
    map[129] = 7;
    map[131] = 7;
    map[139] = 7;
    map[163] = 7;
    map[81] = 8;
    map[241] = 8;
    map[243] = 8;
    map[249] = 8;
    map[251] = 8;
    map[80] = 9;
    map[112] = 10;
    map[120] = 10;
    map[240] = 10;
    map[248] = 10;
    map[17] = 11;
    map[51] = 11;
    map[4] = 12;
    map[6] = 12;
    map[14] = 12;
    map[12] = 12;
    map[31] = 13;
    map[151] = 13;
    map[63] = 13;
    map[159] = 13;
    map[191] = 13;
    map[5] = 14;
    map[28] = 15;
    map[30] = 15;
    map[60] = 15;
    map[62] = 15;
    map[7] = 16;
    map[15] = 16;
    map[135] = 16;
    map[143] = 16;
    map[16] = 17;
    map[24] = 17;
    map[56] = 17;
    map[48] = 17;
    map[84] = 18;
    map[116] = 18;
    map[124] = 18;
    map[252] = 18;
    map[20] = 19;

    return map;
}

export function calculate8WayMask(neighbors: {
    n: boolean;
    ne: boolean;
    e: boolean;
    se: boolean;
    s: boolean;
    sw: boolean;
    w: boolean;
    nw: boolean;
}): number {
    return (
        (neighbors.n ? 1 : 0) |
        (neighbors.ne ? 2 : 0) |
        (neighbors.e ? 4 : 0) |
        (neighbors.se ? 8 : 0) |
        (neighbors.s ? 16 : 0) |
        (neighbors.sw ? 32 : 0) |
        (neighbors.w ? 64 : 0) |
        (neighbors.nw ? 128 : 0)
    );
}