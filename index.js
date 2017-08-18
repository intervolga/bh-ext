const BhExt = require('bh/lib/bh');

BhExt.prototype.cbc = function(src, dest) {
    if (!this._replacements) {
        this._replacements = {};
    }
    if (src) {
        this._replacements[src] = dest;
    }
};

BhExt.prototype.replaceBemCssClasses = function(cls) {
    const self = this;

    return !cls || !self._replacements ? cls : cls
        .split(' ')
        .map(function(c) {
            return self._replacements.hasOwnProperty(c) ?
                self._replacements[c] : c;
        })
        .filter(function(c) {
            return c.length > 0;
        })
        .join(' ')
        .trim();
};

/**
 * Приватные функции, объявленные в контексте переопделяемого метода
 */
const xmlEscape = BhExt.prototype.xmlEscape;
const attrEscape = BhExt.prototype.attrEscape;
const jsAttrEscape = BhExt.prototype.jsAttrEscape;
const toBemCssClasses = function(json, base, parentBase, nobase, delimMod) {
    let mods;
    let mod;
    let res = '';
    let i;

    if (parentBase !== base) {
        if (parentBase) res += ' ';
        res += base;
    }

    if (mods = json.elem && json.elemMods || json.mods) {
        for (i in mods) {
            if (!mods.hasOwnProperty(i)) {
                continue;
            }
            mod = mods[i];
            if (mod || mod === 0) {
                res += ' ' + (nobase ? delimMod : base + delimMod) + i +
                    (mod === true ? '' : delimMod + mod);
            }
        }
    }
    return res;
};

/**
 * Переопределяемый метод
 *
 * @param {Object} json
 */
BhExt.prototype._html = function(json) {
    /* eslint-disable one-var */
    /* eslint-disable no-var */
    /* eslint-disable guard-for-in */
    /* eslint-disable max-len */
    var i, l, item;
    if (json === false || json == null) return;
    if (typeof json !== 'object') {
        this._buf += this._optEscapeContent ? xmlEscape(json) : json;
    } else if (Array.isArray(json)) {
        for (i = 0, l = json.length; i < l; i++) {
            item = json[i];
            if (item !== false && item != null) {
                this._html(item);
            }
        }
    } else {
        if (json.toHtml) {
            var html = json.toHtml.call(this, json) || '';
            this._buf += html;
            return;
        }
        var isBEM = json.bem !== false;
        if (typeof json.tag !== 'undefined' && !json.tag) {
            if (json.html) {
                this._buf += json.html;
            } else {
                this._html(json.content);
            }
            return;
        }
        if (json.mix && !Array.isArray(json.mix)) {
            json.mix = [json.mix];
        }
        var cls = '',
            jattr, jval, attrs = '', jsParams, hasMixJsParams = false;

        if (jattr = json.attrs) {
            for (i in jattr) {
                jval = jattr[i];
                if (jval === true) {
                    attrs += ' ' + i;
                } else if (jval !== false && jval !== null && jval !== undefined) {
                    attrs += ' ' + i + '="' + attrEscape(jval) + '"';
                }
            }
        }

        if (isBEM) {
            var base = json.block + (json.elem ? this._optDelimElem + json.elem : '');

            if (json.block) {
                cls = toBemCssClasses(json, base, null, this._optNobaseMods, this._optDelimMod);
                if (json.js) {
                    (jsParams = {})[base] = json.js === true ? {} : json.js;
                }
            }

            var addJSInitClass = this._optJsCls && (this._optJsElem || !json.elem);

            var mixes = json.mix;
            if (mixes && mixes.length) {
                for (i = 0, l = mixes.length; i < l; i++) {
                    var mix = mixes[i];
                    if (mix && mix.bem !== false) {
                        var mixBlock = mix.block || json.block || '',
                            mixElem = mix.elem || (mix.block ? null : json.block && json.elem),
                            mixBase = mixBlock + (mixElem ? this._optDelimElem + mixElem : '');

                        if (mixBlock) {
                            cls += toBemCssClasses(mix, mixBase, base, this._optNobaseMods, this._optDelimMod);
                            if (mix.js) {
                                (jsParams = jsParams || {})[mixBase] = mix.js === true ? {} : mix.js;
                                hasMixJsParams = true;
                                if (!addJSInitClass) {
                                    addJSInitClass = mixBlock && (this._optJsCls && (this._optJsElem || !mixElem));
                                }
                            }
                        }
                    }
                }
            }

            if (jsParams) {
                if (addJSInitClass) cls += ' ' + this._optJsCls;
                var jsData = (!hasMixJsParams && json.js === true ?
                '{"' + base + '":{}}' :
                    jsAttrEscape(JSON.stringify(jsParams)));
                attrs += ' ' + (json.jsAttr || this._optJsAttrName) + '=\'' +
                    (this._optJsAttrIsJs ? 'return ' + jsData : jsData) + '\'';
            }
        }

        if (json.cls) {
            cls = (cls ? cls + ' ' : '') + attrEscape(json.cls).trim();
        }

        cls = this.replaceBemCssClasses(cls);

        var tag = (json.tag || 'div');
        this._buf += '<' + tag + (cls ? ' class="' + cls + '"' : '') + (attrs ? attrs : '');

        if (this._shortTags[tag]) {
            this._buf += this._optShortTagCloser;
        } else {
            this._buf += '>';
            if (json.html) {
                this._buf += json.html;
            } else {
                this._html(json.content);
            }
            this._buf += '</' + tag + '>';
        }
    }
};

module.exports = BhExt;
