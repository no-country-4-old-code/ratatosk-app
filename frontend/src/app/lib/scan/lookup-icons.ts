
const path = 'assets/icons/scan/';

export const lookupScanIcon: Record<number, string> = {
    0: path + 'origami_squirrel.png',
    1: path + 'origami_bear.png',
    2: path + 'origami_bird.png',
    3: path + 'origami_fish.png',
    4: path + 'origami_hedge.png',
    5: path + 'origami_krab.png',
    6: path + 'origami_mouse.png',
    7: path + 'origami_owl.png',
    8: path + 'origami_pinguin.png',
    9: path + 'origami_seahorse.png',
    10: path + 'origami_bat.png',
    11: path + 'origami_swan.png',
};

export const numberOfIcons = Object.keys(lookupScanIcon).length;

export function getScanIconIds(): number[] {
    return Object.keys(lookupScanIcon).map(id => Number(id));
}

export function getRandomScanIconId(): number {
    const ids = getScanIconIds();
    const maxIdx = ids.length - 1;
    const idx = Math.round(Math.random() * maxIdx);
    return ids[idx];
}
