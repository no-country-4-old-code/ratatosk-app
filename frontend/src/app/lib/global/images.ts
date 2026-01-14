interface ImagePaths {
    appSmall: string;
    twitter: string;
    designer: string;
    // third party
    coin_gecko: string,
    crypto_compare: string
}

const imagePath = 'assets/icons/svg';
const imagePathThirdParty = 'assets/icons/third-party';


export const imagePaths: Readonly<ImagePaths> = {
    appSmall: `${imagePath}/icon-144x144-clean.png`,
    twitter: `${imagePath}/twitter.svg`,
    designer: `${imagePath}/format_paint-24px.svg`,
    // third party
    coin_gecko: `${imagePathThirdParty}/coin_gecko.png`,
    crypto_compare: `${imagePathThirdParty}/crypto_compare.png`,

};
