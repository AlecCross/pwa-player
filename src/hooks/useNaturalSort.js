// src/hooks/useNaturalSort.js

const useNaturalSort = () => {
    const naturalSort = (a, b) => {
        const re = /(^-?[0-9]+(\.[0-9]+)?$)|(^-?\.?[0-9]+$)|(^-?[0-9]+\.$)/i,
            sre = /(^[ ]*|[ ]*$)/g,
            dre = /(^([\w ]+,?[\w ]+)?([ ]*(.+[^,])+,?)*[. ]*([ ]*[^\w]+)+[ ]*$)/g,
            hre = /^0[x]0*([0-9a-f]+|[ ]*)$/i,
            ore = /^0(0*([0-7]+|[ ]*)+|[ ]*)$/i,
            i = (s) => (naturalSort.insensitive && ("" + s).toLowerCase()) || "" + s,
            // convert all to strings strip whitespace
            x = i(a).replace(sre, '') || '',
            y = i(b).replace(sre, '') || '',
            // chunk/tokenize
            xN = x.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0'),
            yN = y.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0'),
            // hex/octal detection
            xD = parseInt(x.match(hre)) || (xN.length !== 1 && x.match(ore) && parseInt(x)) || 0,
            yD = parseInt(y.match(hre)) || (yN.length !== 1 && y.match(ore) && parseInt(y)) || 0;
        let oFxNcL, oFyNcL; // Оголошуємо oFxNcL та oFyNcL без ініціалізації

        // first try and sort Hex/Oct first
        if (xD && yD && xD !== yD) return (xD > yD) ? 1 : -1;
        // natural sorting through split numeric strings and default strings
        for (let cLoc = 0, numS = Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
            oFxNcL = !(xN[cLoc] || '').match(re) && parseFloat(xN[cLoc]) || xN[cLoc] || '';
            oFyNcL = !(yN[cLoc] || '').match(re) && parseFloat(yN[cLoc]) || yN[cLoc] || '';
            // handle numeric vs string comparison - number < string - (Kyle Adams)
            if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
            // rely on string comparison if different types - i.e. '2' < '2a'
            else if (typeof oFxNcL !== typeof oFyNcL) {
                oFxNcL += '';
                oFyNcL += '';
            }
            if (oFxNcL < oFyNcL) return -1;
            if (oFxNcL > oFyNcL) return 1;
        }
        return 0;
    };

    return naturalSort;
};

export default useNaturalSort;
