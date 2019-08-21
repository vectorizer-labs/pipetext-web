function XYZtoAdobeRGB(color)
{
    //X, Y and Z input refer to a D65/2° standard illuminant.
    //aR, aG and aB (RGB Adobe 1998) output range = 0 ÷ 255
    let X = color.x / 100;
    let Y = color.y / 100;
    let Z = color.z / 100;

    let R = (X *  2.04137) + (Y * -0.56495) + (Z * -0.34469);
    let G = (X * -0.96927) + (Y *  1.87601) + (Z *  0.04156);
    let B = (X *  0.01345) + (Y * -0.11839) + (Z *  1.01541);

    R = Math.max(0, R);
    G = Math.max(0, G);
    B = Math.max(0, B);

    R = Math.pow(R, ( 1 / 2.19921875 ));
    G = Math.pow(G, ( 1 / 2.19921875 ));
    B = Math.pow(B, ( 1 / 2.19921875 ));

    let aR = R * 255;
    let aG = G * 255;
    let aB = B * 255;

    return {r: Math.round(aR), g: Math.round(aG), b: Math.round(aB) };
}

function CIELabtoXYZ(L,a,b, Reference)
{
    //Reference-X, Y and Z refer to specific illuminants and observers.
    //Common reference values are available below in this same page.

    let Y = ( L + 16.0 ) / 116.0;
    let X = a / 500.0 + Y;
    let Z = (Y -b) / 200.0;

    if ( Y^3  > 0.008856 ) Y = Math.pow(Y,3);
    else                   Y = ( Y - 16.0 / 116.0 ) / 7.787;
    if ( X^3  > 0.008856 ) X = Math.pow(X,3);
    else                   X = ( X - 16.0 / 116.0 ) / 7.787;
    if ( Z^3  > 0.008856 ) Z = Math.pow(Z,3);
    else                   Z = ( Z - 16.0 / 116.0 ) / 7.787;

    X = X * Reference.X;
    Y = Y * Reference.Y;
    Z = Z * Reference.Z;

    console.log("x : " + X + ", y: " + Y + ", z: " + Z);
    return {x: X, y: Y, z: Z};
}

function XYZtosRGB(color)
{
    //X, Y and Z input refer to a D65/2° standard illuminant.
    //sR, sG and sB (standard RGB) output range = 0 ÷ 255

    let X = color.x / 100;
    let Y = color.y / 100;
    let Z = color.z / 100;

    let R = (X *  3.2406) + (Y * -1.5372) + (Z * -0.4986);
    let G = (X * -0.9689) + (Y *  1.8758) + (Z *  0.0415);
    let B = (X *  0.0557) + (Y * -0.2040) + (Z *  1.0570);

    if ( R > 0.0031308) R = 1.055 * (( Math.pow(R, ( 1 / 2.4 ) )) - 0.055);
    else                R = 12.92 * R;
    if ( G > 0.0031308) G = 1.055 * (( Math.pow(G, ( 1 / 2.4 ) )) - 0.055);
    else                G = 12.92 * G;
    if ( B > 0.0031308) B = 1.055 * (( Math.pow(B, ( 1 / 2.4 ) )) - 0.055);
    else                B = 12.92 * B;

    let sR = R * 255;
    let sG = G * 255;
    let sB = B * 255;

    return {r: Math.round(sR), g: Math.round(sG), b: Math.round(sB) };
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
  
function rgbToHex(color) {
    return "#" + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
}
  
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

let D65Reference2 = { X: 95.047, Y: 100.000 , Z : 108.883};
let D65Reference10 = { X: 94.811, Y: 100.000 , Z : 107.304};


console.log(XYZtosRGB(CIELabtoXYZ(23.0, -12.0, -12.0, D65Reference2)));
console.log(XYZtosRGB(CIELabtoXYZ(28, -13, -13, D65Reference2)));


console.log("Adobe");
console.log(rgbToHex(XYZtoAdobeRGB(CIELabtoXYZ(23.0, -12.0, -12.0, D65Reference2))));
console.log(rgbToHex(XYZtoAdobeRGB(CIELabtoXYZ(28, -13, -13, D65Reference2))));