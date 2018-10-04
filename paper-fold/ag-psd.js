(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.agPsd = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var effectsHelpers_1 = require("./effectsHelpers");
var helpers_1 = require("./helpers");
var handlers = [];
var handlersMap = {};
function addHandler(handler) {
    handlers.push(handler);
    handlersMap[handler.key] = handler;
}
function getHandler(key) {
    return handlersMap[key];
}
exports.getHandler = getHandler;
function getHandlers() {
    return handlers;
}
exports.getHandlers = getHandlers;
addHandler({
    key: 'luni',
    has: function (target) { return typeof target.name !== 'undefined'; },
    read: function (reader, target, left) {
        target.name = reader.readUnicodeString();
        reader.skip(left()); // TEMP: skipping
    },
    write: function (writer, target) {
        writer.writeUnicodeString(target.name);
    }
});
addHandler({
    key: 'lnsr',
    has: function (target) { return typeof target.nameSource !== 'undefined'; },
    read: function (reader, target) { return target.nameSource = reader.readSignature(); },
    write: function (writer, target) { return writer.writeSignature(target.nameSource); },
});
addHandler({
    key: 'lyid',
    has: function (target) { return typeof target.id !== 'undefined'; },
    read: function (reader, target) { return target.id = reader.readUint32(); },
    write: function (writer, target) { return writer.writeUint32(target.id); },
});
addHandler({
    key: 'clbl',
    has: function (target) { return typeof target.blendClippendElements !== 'undefined'; },
    read: function (reader, target) {
        target.blendClippendElements = !!reader.readUint8();
        reader.skip(3);
    },
    write: function (writer, target) {
        writer.writeUint8(target.blendClippendElements ? 1 : 0);
        writer.writeZeros(3);
    },
});
addHandler({
    key: 'infx',
    has: function (target) { return typeof target.blendInteriorElements !== 'undefined'; },
    read: function (reader, target) {
        target.blendInteriorElements = !!reader.readUint8();
        reader.skip(3);
    },
    write: function (writer, target) {
        writer.writeUint8(target.blendInteriorElements ? 1 : 0);
        writer.writeZeros(3);
    },
});
addHandler({
    key: 'knko',
    has: function (target) { return typeof target.knockout !== 'undefined'; },
    read: function (reader, target) {
        target.knockout = !!reader.readUint8();
        reader.skip(3);
    },
    write: function (writer, target) {
        writer.writeUint8(target.knockout ? 1 : 0);
        writer.writeZeros(3);
    },
});
addHandler({
    key: 'lspf',
    has: function (target) { return typeof target.protected !== 'undefined'; },
    read: function (reader, target) {
        var flags = reader.readUint32();
        target.protected = {
            transparency: (flags & 0x01) !== 0,
            composite: (flags & 0x02) !== 0,
            position: (flags & 0x04) !== 0,
        };
    },
    write: function (writer, target) {
        var flags = (target.protected.transparency ? 0x01 : 0) |
            (target.protected.composite ? 0x02 : 0) |
            (target.protected.position ? 0x04 : 0);
        writer.writeUint32(flags);
    },
});
addHandler({
    key: 'lclr',
    has: function (target) { return typeof target.sheetColors !== 'undefined'; },
    read: function (reader, target) {
        target.sheetColors = {
            color1: reader.readUint32(),
            color2: reader.readUint32(),
        };
    },
    write: function (writer, target) {
        writer.writeUint32(target.sheetColors.color1);
        writer.writeUint32(target.sheetColors.color2);
    },
});
addHandler({
    key: 'fxrp',
    has: function (target) { return typeof target.referencePoint !== 'undefined'; },
    read: function (reader, target) {
        target.referencePoint = {
            x: reader.readFloat64(),
            y: reader.readFloat64(),
        };
    },
    write: function (writer, target) {
        writer.writeFloat64(target.referencePoint.x);
        writer.writeFloat64(target.referencePoint.y);
    },
});
addHandler({
    key: 'lsct',
    has: function (target) { return typeof target.sectionDivider !== 'undefined'; },
    read: function (reader, target, left) {
        var item = {};
        item.type = reader.readUint32();
        if (left()) {
            var signature = reader.readSignature();
            if (signature !== '8BIM')
                throw new Error("Invalid signature: '" + signature + "'");
            item.key = reader.readSignature();
        }
        if (left()) {
            // 0 = normal
            // 1 = scene group, affects the animation timeline.
            item.subType = reader.readUint32();
        }
        target.sectionDivider = item;
    },
    write: function (writer, target) {
        writer.writeUint32(target.sectionDivider.type);
        if (target.sectionDivider.key) {
            writer.writeSignature('8BIM');
            writer.writeSignature(target.sectionDivider.key);
            if (typeof target.sectionDivider.subtype !== 'undefined')
                writer.writeUint32(target.sectionDivider.subtype);
        }
    },
});
addHandler({
    key: 'FMsk',
    has: function (target) { return typeof target.filterMask !== 'undefined'; },
    read: function (reader, target) {
        target.filterMask = {
            colorSpace: helpers_1.readColor(reader),
            opacity: reader.readUint16(),
        };
    },
    write: function (writer, target) {
        writer.writeBytes(new Uint8Array(target.filterMask.colorSpace));
        writer.writeUint16(target.filterMask.opacity);
    },
});
addHandler({
    key: 'shmd',
    has: function (target) { return typeof target.metadata !== 'undefined'; },
    read: function (reader, target) {
        var count = reader.readUint32();
        target.metadata = [];
        for (var i = 0; i < count; i++) {
            var signature = reader.readSignature();
            if (signature !== '8BIM')
                throw new Error("Invalid signature: '" + signature + "'");
            var key = reader.readSignature();
            var copy = !!reader.readUint8();
            reader.skip(3);
            var length_1 = reader.readUint32();
            var data = helpers_1.toArray(reader.readBytes(length_1));
            target.metadata.push({ key: key, copy: copy, data: data });
        }
    },
    write: function (writer, target) {
        writer.writeUint32(target.metadata.length);
        for (var i = 0; i < target.metadata.length; i++) {
            var item = target.metadata[i];
            writer.writeSignature('8BIM');
            writer.writeSignature(item.key);
            writer.writeUint8(item.copy ? 1 : 0);
            writer.writeZeros(3);
            writer.writeUint32(item.data.length);
            writer.writeBytes(new Uint8Array(item.data));
        }
    },
});
addHandler({
    key: 'lyvr',
    has: function (target) { return typeof target.version !== 'undefined'; },
    read: function (reader, target) {
        target.version = reader.readUint32();
    },
    write: function (writer, target) {
        writer.writeUint32(target.version);
    },
});
addHandler({
    key: 'lrFX',
    has: function (target) { return typeof target.effects !== 'undefined'; },
    read: function (reader, target, left) {
        target.effects = effectsHelpers_1.readEffects(reader);
        reader.skip(left()); // TEMP: skipping
    },
    write: function (writer, target) {
        effectsHelpers_1.writeEffects(writer, target.effects);
    },
});
// function readStringOrClassId(reader: PsdReader) {
// 	const text = reader.readUnicodeString();
// 	return text.length === 0 ? reader.readSignature() : text;
// }
// function readStringOrClassId2(reader: PsdReader) {
// 	const text = reader.readPascalString();
// 	return text.length === 0 ? reader.readSignature() : text;
// }
addHandler({
    key: 'lfx2',
    has: function (target) { return typeof target.objectBasedEffectsLayerInfo !== 'undefined'; },
    read: function (reader, _target, left) {
        reader.skip(left());
        // const version = reader.readUint32();
        // const descriptorVersion = reader.readUint32();
        // const name = reader.readUnicodeString();
        // const classId = readStringOrClassId(reader);
        // const itemsCount = reader.readUint32();
        //for (let i = 0; i < itemsCount; i++) {
        //	console.log('read item');
        //	const key = readStringOrClassId(reader);
        //	console.log('key', [key]);
        //}
        //target.objectBasedEffectsLayerInfo = {
        //	version,
        //	descriptorVersion,
        //	descriptor: {
        //		name,
        //		classId,
        //		//...
        //	},
        //};
    },
    write: function (_writer, _target) {
        //...
    },
});


},{"./effectsHelpers":5,"./helpers":6}],2:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var psdReader_1 = require("./psdReader");
/* istanbul ignore next */
var ArrayBufferPsdReader = /** @class */ (function (_super) {
    __extends(ArrayBufferPsdReader, _super);
    function ArrayBufferPsdReader(buffer) {
        var _this = _super.call(this) || this;
        _this.buffer = buffer;
        _this.view = new DataView(_this.buffer);
        return _this;
    }
    ArrayBufferPsdReader.prototype.readInt8 = function () {
        this.offset += 1;
        return this.view.getInt8(this.offset - 1);
    };
    ArrayBufferPsdReader.prototype.readUint8 = function () {
        this.offset += 1;
        return this.view.getUint8(this.offset - 1);
    };
    ArrayBufferPsdReader.prototype.readInt16 = function () {
        this.offset += 2;
        return this.view.getInt16(this.offset - 2, false);
    };
    ArrayBufferPsdReader.prototype.readUint16 = function () {
        this.offset += 2;
        return this.view.getUint16(this.offset - 2, false);
    };
    ArrayBufferPsdReader.prototype.readInt32 = function () {
        this.offset += 4;
        return this.view.getInt32(this.offset - 4, false);
    };
    ArrayBufferPsdReader.prototype.readUint32 = function () {
        this.offset += 4;
        return this.view.getUint32(this.offset - 4, false);
    };
    ArrayBufferPsdReader.prototype.readFloat32 = function () {
        this.offset += 4;
        return this.view.getFloat32(this.offset - 4, false);
    };
    ArrayBufferPsdReader.prototype.readFloat64 = function () {
        this.offset += 8;
        return this.view.getFloat64(this.offset - 8, false);
    };
    ArrayBufferPsdReader.prototype.readBytes = function (length) {
        this.offset += length;
        return new Uint8Array(this.view.buffer, this.offset - length, length);
    };
    ArrayBufferPsdReader.prototype.createCanvas = function (width, height) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    };
    return ArrayBufferPsdReader;
}(psdReader_1.PsdReader));
exports.ArrayBufferPsdReader = ArrayBufferPsdReader;


},{"./psdReader":9}],3:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var psdWriter_1 = require("./psdWriter");
var ArrayBufferPsdWriter = /** @class */ (function (_super) {
    __extends(ArrayBufferPsdWriter, _super);
    function ArrayBufferPsdWriter(size) {
        if (size === void 0) { size = 1024; }
        var _this = _super.call(this) || this;
        _this.buffer = new ArrayBuffer(size);
        _this.view = new DataView(_this.buffer);
        return _this;
    }
    ArrayBufferPsdWriter.prototype.ensureSize = function (size) {
        if (size > this.buffer.byteLength) {
            var newLength = this.buffer.byteLength;
            do {
                newLength *= 2;
            } while (size > newLength);
            var newBuffer = new ArrayBuffer(newLength);
            var newBytes = new Uint8Array(newBuffer);
            var oldBytes = new Uint8Array(this.buffer);
            newBytes.set(oldBytes);
            this.buffer = newBuffer;
            this.view = new DataView(this.buffer);
        }
    };
    ArrayBufferPsdWriter.prototype.addSize = function (size) {
        var offset = this.offset;
        this.ensureSize(this.offset += size);
        return offset;
    };
    ArrayBufferPsdWriter.prototype.writeInt8 = function (value) {
        var offset = this.addSize(1);
        this.view.setInt8(offset, value);
    };
    ArrayBufferPsdWriter.prototype.writeUint8 = function (value) {
        var offset = this.addSize(1);
        this.view.setUint8(offset, value);
    };
    ArrayBufferPsdWriter.prototype.writeInt16 = function (value) {
        var offset = this.addSize(2);
        this.view.setInt16(offset, value, false);
    };
    ArrayBufferPsdWriter.prototype.writeUint16 = function (value) {
        var offset = this.addSize(2);
        this.view.setUint16(offset, value, false);
    };
    ArrayBufferPsdWriter.prototype.writeInt32 = function (value) {
        var offset = this.addSize(4);
        this.view.setInt32(offset, value, false);
    };
    ArrayBufferPsdWriter.prototype.writeUint32 = function (value) {
        var offset = this.addSize(4);
        this.view.setUint32(offset, value, false);
    };
    ArrayBufferPsdWriter.prototype.writeFloat32 = function (value) {
        var offset = this.addSize(4);
        this.view.setFloat32(offset, value, false);
    };
    ArrayBufferPsdWriter.prototype.writeFloat64 = function (value) {
        var offset = this.addSize(8);
        this.view.setFloat64(offset, value, false);
    };
    ArrayBufferPsdWriter.prototype.writeBytes = function (buffer) {
        if (buffer) {
            this.ensureSize(this.offset + buffer.length);
            var bytes = new Uint8Array(this.buffer);
            bytes.set(buffer, this.offset);
            this.offset += buffer.length;
        }
    };
    ArrayBufferPsdWriter.prototype.getBuffer = function () {
        return this.buffer.slice(0, this.offset);
    };
    return ArrayBufferPsdWriter;
}(psdWriter_1.PsdWriter));
exports.ArrayBufferPsdWriter = ArrayBufferPsdWriter;


},{"./psdWriter":10}],4:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var arrayBufferPsdReader_1 = require("./arrayBufferPsdReader");
var arrayBufferPsdWriter_1 = require("./arrayBufferPsdWriter");
__export(require("./psd"));
var psdReader_1 = require("./psdReader");
exports.PsdReader = psdReader_1.PsdReader;
var psdWriter_1 = require("./psdWriter");
exports.PsdWriter = psdWriter_1.PsdWriter;
function readPsd(buffer, options) {
    var reader = new arrayBufferPsdReader_1.ArrayBufferPsdReader(buffer);
    return reader.readPsd(options);
}
exports.readPsd = readPsd;
function writePsd(psd, options) {
    var writer = new arrayBufferPsdWriter_1.ArrayBufferPsdWriter();
    writer.writePsd(psd, options);
    return writer.getBuffer();
}
exports.writePsd = writePsd;


},{"./arrayBufferPsdReader":2,"./arrayBufferPsdWriter":3,"./psd":8,"./psdReader":9,"./psdWriter":10}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("./helpers");
function readBlendMode(reader) {
    reader.checkSignature('8BIM');
    return reader.readSignature();
}
function readShadowInfo(reader) {
    var size = reader.readUint32();
    var version = reader.readUint32();
    if (size !== 41 && size !== 51)
        throw new Error("Invalid effects shadow info size: " + size);
    if (version !== 0 && version !== 2)
        throw new Error("Invalid effects shadow info version: " + version);
    var blur = reader.readInt32();
    var intensity = reader.readInt32();
    var angle = reader.readInt32();
    var distance = reader.readInt32();
    var color = helpers_1.readColor(reader);
    var blendMode = readBlendMode(reader);
    var enabled = !!reader.readUint8();
    var useAngleInAllEffects = !!reader.readUint8();
    var opacity = reader.readUint8();
    var nativeColor = size >= 51 ? helpers_1.readColor(reader) : undefined;
    return { blur: blur, intensity: intensity, angle: angle, distance: distance, color: color, blendMode: blendMode, enabled: enabled, useAngleInAllEffects: useAngleInAllEffects, opacity: opacity, nativeColor: nativeColor };
}
function readOuterGlowInfo(reader) {
    var size = reader.readUint32();
    var version = reader.readUint32();
    if (size !== 32 && size !== 42)
        throw new Error("Invalid effects outer glow info size: " + size);
    if (version !== 0 && version !== 2)
        throw new Error("Invalid effects outer glow info version: " + version);
    var blur = reader.readUint32();
    var intensity = reader.readUint32();
    var color = helpers_1.readColor(reader);
    var blendMode = readBlendMode(reader);
    var enabled = !!reader.readUint8();
    var opacity = reader.readUint8();
    var nativeColor = size >= 42 ? helpers_1.readColor(reader) : undefined;
    return { blur: blur, intensity: intensity, color: color, blendMode: blendMode, enabled: enabled, opacity: opacity, nativeColor: nativeColor };
}
function readInnerGlowInfo(reader) {
    var size = reader.readUint32();
    var version = reader.readUint32();
    if (size !== 33 && size !== 43)
        throw new Error("Invalid effects inner glow info size: " + size);
    if (version !== 0 && version !== 2)
        throw new Error("Invalid effects inner glow info version: " + version);
    var blur = reader.readUint32();
    var intensity = reader.readUint32();
    var color = helpers_1.readColor(reader);
    var blendMode = readBlendMode(reader);
    var enabled = !!reader.readUint8();
    var opacity = reader.readUint8();
    var invert = size >= 43 ? !!reader.readUint8() : undefined;
    var nativeColor = size >= 43 ? helpers_1.readColor(reader) : undefined;
    return { blur: blur, intensity: intensity, color: color, blendMode: blendMode, enabled: enabled, opacity: opacity, invert: invert, nativeColor: nativeColor };
}
function readBevelInfo(reader) {
    var size = reader.readUint32();
    var version = reader.readUint32();
    if (size !== 58 && size !== 78)
        throw new Error("Invalid effects bevel info size: " + size);
    if (version !== 0 && version !== 2)
        throw new Error("Invalid effects bevel info version: " + version);
    var angle = reader.readUint32();
    var strength = reader.readUint32();
    var blur = reader.readUint32();
    var highlightBlendMode = readBlendMode(reader);
    var shadowBlendMode = readBlendMode(reader);
    var highlightColor = helpers_1.readColor(reader);
    var shadowColor = helpers_1.readColor(reader);
    var bevelStyle = reader.readUint8();
    var highlightOpacity = reader.readUint8();
    var shadowOpacity = reader.readUint8();
    var enabled = !!reader.readUint8();
    var useAngleInAllEffects = !!reader.readUint8();
    var up = !!reader.readUint8();
    var realHighlightColor = size >= 78 ? helpers_1.readColor(reader) : undefined;
    var realShadowColor = size >= 78 ? helpers_1.readColor(reader) : undefined;
    return {
        angle: angle, strength: strength, blur: blur, highlightBlendMode: highlightBlendMode, shadowBlendMode: shadowBlendMode, highlightColor: highlightColor, shadowColor: shadowColor,
        bevelStyle: bevelStyle, highlightOpacity: highlightOpacity, shadowOpacity: shadowOpacity, enabled: enabled, useAngleInAllEffects: useAngleInAllEffects, up: up,
        realHighlightColor: realHighlightColor, realShadowColor: realShadowColor
    };
}
function readSolidFillInfo(reader) {
    var size = reader.readUint32();
    var version = reader.readUint32();
    if (size !== 34)
        throw new Error("Invalid effects solid fill info size: " + size);
    if (version !== 2)
        throw new Error("Invalid effects solid fill info version: " + version);
    var blendMode = readBlendMode(reader);
    var color = helpers_1.readColor(reader);
    var opacity = reader.readUint8();
    var enabled = !!reader.readUint8();
    var nativeColor = helpers_1.readColor(reader);
    return { blendMode: blendMode, color: color, opacity: opacity, enabled: enabled, nativeColor: nativeColor };
}
function readEffects(reader) {
    var version = reader.readUint16();
    if (version !== 0)
        throw new Error("Invalid effects layer version: " + version);
    var effectsCount = reader.readUint16();
    var effects = {};
    for (var i = 0; i < effectsCount; i++) {
        reader.checkSignature('8BIM');
        var type = reader.readSignature();
        switch (type) {
            case 'cmnS': // common state (see See Effects layer, common state info)
                var size = reader.readUint32();
                var version_1 = reader.readUint32();
                var visible = !!reader.readUint8();
                reader.skip(2);
                if (size !== 7 || version_1 !== 0 || !visible)
                    throw new Error("Invalid effects common state");
                break;
            case 'dsdw': // drop shadow (see See Effects layer, drop shadow and inner shadow info)
                effects.dropShadow = readShadowInfo(reader);
                break;
            case 'isdw': // inner shadow (see See Effects layer, drop shadow and inner shadow info)
                effects.innerShadow = readShadowInfo(reader);
                break;
            case 'oglw': // outer glow (see See Effects layer, outer glow info)
                effects.outerGlow = readOuterGlowInfo(reader);
                break;
            case 'iglw': // inner glow (see See Effects layer, inner glow info)
                effects.innerGlow = readInnerGlowInfo(reader);
                break;
            case 'bevl': // bevel (see See Effects layer, bevel info)
                effects.bevel = readBevelInfo(reader);
                break;
            case 'sofi': // solid fill ( Photoshop 7.0) (see See Effects layer, solid fill (added in Photoshop 7.0))
                effects.solidFill = readSolidFillInfo(reader);
                break;
            default:
                throw new Error("Invalid effect type: '" + type + "'");
        }
    }
    return effects;
}
exports.readEffects = readEffects;
function writeEffects(_writer, _effects) {
    throw new Error('Not implemented');
}
exports.writeEffects = writeEffects;


},{"./helpers":6}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var psd_1 = require("./psd");
function offsetForChannel(channelId) {
    switch (channelId) {
        case psd_1.ChannelID.Red: return 0;
        case psd_1.ChannelID.Green: return 1;
        case psd_1.ChannelID.Blue: return 2;
        case psd_1.ChannelID.Transparency: return 3;
        default: return channelId + 1;
    }
}
exports.offsetForChannel = offsetForChannel;
function toArray(value) {
    var result = new Array(value.length);
    for (var i = 0; i < value.length; i++)
        result[i] = value[i];
    return result;
}
exports.toArray = toArray;
function readColor(reader) {
    return toArray(reader.readBytes(10));
}
exports.readColor = readColor;
function hasAlpha(data) {
    var size = data.width * data.height;
    for (var i = 0; i < size; i++) {
        if (data.data[i * 4 + 3] !== 255)
            return true;
    }
    return false;
}
exports.hasAlpha = hasAlpha;
function trimData(data) {
    var top = 0;
    var left = 0;
    var right = data.width;
    var bottom = data.height;
    function isEmpty(x, y) {
        return data.data[(y * data.width + x) * 4 + 3] === 0;
    }
    function isRowEmpty(y) {
        for (var x = left; x < right; x++) {
            if (!isEmpty(x, y))
                return false;
        }
        return true;
    }
    function isColEmpty(x) {
        for (var y = top; y < bottom; y++) {
            if (!isEmpty(x, y))
                return false;
        }
        return true;
    }
    while (top < bottom && isRowEmpty(top))
        top++;
    while (bottom > top && isRowEmpty(bottom - 1))
        bottom--;
    while (left < right && isColEmpty(left))
        left++;
    while (right > left && isColEmpty(right - 1))
        right--;
    return { top: top, left: left, right: right, bottom: bottom };
}
function getChannels(layer, background) {
    if (typeof layer.top === 'undefined')
        layer.top = 0;
    if (typeof layer.left === 'undefined')
        layer.left = 0;
    if (typeof layer.right === 'undefined')
        layer.right = layer.canvas ? layer.canvas.width : layer.left;
    if (typeof layer.bottom === 'undefined')
        layer.bottom = layer.canvas ? layer.canvas.height : layer.top;
    var canvas = layer.canvas;
    var layerWidth = layer.right - layer.left;
    var layerHeight = layer.bottom - layer.top;
    var result = [{
            channelId: psd_1.ChannelID.Transparency,
            compression: psd_1.Compression.RawData,
            buffer: undefined,
            length: 2,
        }];
    if (!canvas || !layerWidth || !layerHeight)
        return result;
    var context = canvas.getContext('2d');
    var data = context.getImageData(layer.left, layer.top, layerWidth, layerHeight);
    var _a = trimData(data), left = _a.left, top = _a.top, right = _a.right, bottom = _a.bottom;
    if (left !== 0 || top !== 0 || right !== data.width || bottom !== data.height) {
        layer.left += left;
        layer.top += top;
        layer.right -= (data.width - right);
        layer.bottom -= (data.height - bottom);
        layerWidth = layer.right - layer.left;
        layerHeight = layer.bottom - layer.top;
        if (!layerWidth || !layerHeight)
            return result;
        data = context.getImageData(layer.left, layer.top, layerWidth, layerHeight);
    }
    result = [];
    var channels = [
        psd_1.ChannelID.Red,
        psd_1.ChannelID.Green,
        psd_1.ChannelID.Blue,
    ];
    if (!background || layerWidth !== canvas.width || layerHeight !== canvas.height || hasAlpha(data))
        channels.unshift(psd_1.ChannelID.Transparency);
    for (var _i = 0, channels_1 = channels; _i < channels_1.length; _i++) {
        var channel = channels_1[_i];
        var offset = offsetForChannel(channel);
        var buffer = writeDataRLE(data, layerWidth, layerHeight, [offset]);
        result.push({
            channelId: channel,
            compression: psd_1.Compression.RleCompressed,
            buffer: buffer,
            length: 2 + buffer.length,
        });
    }
    return result;
}
exports.getChannels = getChannels;
function resetCanvas(data) {
    var size = data.width * data.height * 4;
    for (var p = 0; p < size;) {
        data.data[p++] = 0;
        data.data[p++] = 0;
        data.data[p++] = 0;
        data.data[p++] = 255;
    }
}
exports.resetCanvas = resetCanvas;
function decodeBitmap(input, output, width, height) {
    for (var y = 0, p = 0, o = 0; y < height; y++) {
        for (var x = 0; x < width;) {
            var b = input[o++];
            for (var i = 0; i < 8 && x < width; i++, x++) {
                var v = b & 0x80 ? 0 : 255;
                b = b << 1;
                output[p++] = v;
                output[p++] = v;
                output[p++] = v;
                output[p++] = 255;
            }
        }
    }
}
exports.decodeBitmap = decodeBitmap;
function writeDataRaw(data, offset, width, height) {
    if (!width || !height)
        return undefined;
    var array = new Uint8Array(width * height);
    for (var i = 0; i < array.length; i++)
        array[i] = data.data[i * 4 + offset];
    return array;
}
exports.writeDataRaw = writeDataRaw;
function readDataRaw(reader, data, offset, width, height) {
    var size = width * height;
    var buffer = reader.readBytes(size);
    if (data && offset < 4) {
        for (var i = 0; i < size; i++) {
            data.data[i * 4 + offset] = buffer[i];
        }
    }
}
exports.readDataRaw = readDataRaw;
function writeDataRLE(imageData, width, height, offsets) {
    if (!width || !height)
        return undefined;
    var data = imageData.data;
    var channels = [];
    var totalLength = 0;
    for (var i = 0; i < offsets.length; i++) {
        var lengths = [];
        var lines = [];
        var offset = offsets[i];
        for (var y = 0, p = 0; y < height; y++, p += width) {
            var line = [];
            var length_1 = 0;
            var last2 = -1;
            var last = data[p * 4 + offset];
            var count = 1;
            var same = false;
            for (var x = 1; x < width; x++) {
                var v = data[(p + x) * 4 + offset];
                if (count === 2)
                    same = last === v && last2 === v;
                if (same && last !== v) {
                    length_1 += 2;
                    line.push(count);
                    count = 0;
                    same = false;
                }
                else if (!same && count > 2 && v === last && v === last2) {
                    length_1 += count - 1;
                    line.push(count - 2);
                    count = 2;
                    same = true;
                }
                else if (count === 128) {
                    length_1 += same ? 2 : count + 1;
                    line.push(count);
                    count = 0;
                    same = false;
                }
                last2 = last;
                last = v;
                count++;
            }
            length_1 += same ? 2 : 1 + count;
            line.push(count);
            lines.push(line);
            lengths.push(length_1);
            totalLength += 2 + length_1;
        }
        channels.push({ lengths: lengths, lines: lines, offset: offset });
    }
    var buffer = new Uint8Array(totalLength);
    var o = 0;
    for (var _i = 0, channels_2 = channels; _i < channels_2.length; _i++) {
        var channel = channels_2[_i];
        for (var _a = 0, _b = channel.lengths; _a < _b.length; _a++) {
            var length_2 = _b[_a];
            buffer[o++] = (length_2 >> 8) & 0xff;
            buffer[o++] = length_2 & 0xff;
        }
    }
    for (var _c = 0, channels_3 = channels; _c < channels_3.length; _c++) {
        var channel = channels_3[_c];
        for (var y = 0, p = 0; y < height; y++, p += width) {
            var line = channel.lines[y];
            var offset = channel.offset;
            var x = 0;
            for (var i = 0; i < line.length; i++) {
                var v = data[(p + x) * 4 + offset];
                var same = line[i] > 2 && v === data[(p + x + 1) * 4 + offset] && v === data[(p + x + 2) * 4 + offset];
                if (same) {
                    buffer[o++] = 1 - line[i];
                    buffer[o++] = v;
                }
                else {
                    buffer[o++] = line[i] - 1;
                    for (var j = 0; j < line[i]; j++)
                        buffer[o++] = data[(p + x + j) * 4 + offset];
                }
                x += line[i];
            }
        }
    }
    return buffer;
}
exports.writeDataRLE = writeDataRLE;
function readDataRLE(reader, data, step, _width, height, offsets) {
    var lengths = [];
    for (var c = 0; c < offsets.length; c++) {
        lengths[c] = [];
        for (var y = 0; y < height; y++) {
            lengths[c][y] = reader.readUint16();
        }
    }
    for (var c = 0; c < offsets.length; c++) {
        var channelLengths = lengths[c];
        var extra = c > 3 || offsets[c] > 3;
        var p = offsets[c];
        for (var y = 0; y < height; y++) {
            var length_3 = channelLengths[y];
            var buffer = reader.readBytes(length_3);
            for (var i = 0; i < length_3; i++) {
                var header = buffer[i];
                if (header >= 128) {
                    var value = buffer[++i];
                    header = 256 - header;
                    for (var j = 0; j <= header; j++) {
                        if (data && !extra) {
                            data.data[p] = value;
                        }
                        p += step;
                    }
                }
                else if (header < 128) {
                    for (var j = 0; j <= header; j++) {
                        i++;
                        if (data && !extra) {
                            data.data[p] = buffer[i];
                        }
                        p += step;
                    }
                }
                /* istanbul ignore if */
                if (i >= length_3) {
                    throw new Error("Exceeded buffer size " + i + "/" + length_3);
                }
            }
        }
    }
}
exports.readDataRLE = readDataRLE;


},{"./psd":8}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var handlers = [];
var handlersMap = {};
function addHandler(handler) {
    handlers.push(handler);
    handlersMap[handler.key] = handler;
}
function getHandler(key, _name) {
    return handlersMap[key];
}
exports.getHandler = getHandler;
function getHandlers() {
    return handlers;
}
exports.getHandlers = getHandlers;
// 32-bit fixed-point number 16.16
function readFixedPoint32(reader) {
    return reader.readUint32() / (1 << 16);
}
// 32-bit fixed-point number 16.16
function writeFixedPoint32(writer, value) {
    writer.writeUint32(value * (1 << 16));
}
var RESOLUTION_UNITS = [undefined, 'PPI', 'PPCM'];
var MEASUREMENT_UNITS = [undefined, 'Inches', 'Centimeters', 'Points', 'Picas', 'Columns'];
addHandler({
    key: 1005,
    has: function (target) { return typeof target.resolutionInfo !== 'undefined'; },
    read: function (reader, target) {
        var horizontalResolution = readFixedPoint32(reader);
        var horizontalResolutionUnit = reader.readUint16();
        var widthUnit = reader.readUint16();
        var verticalResolution = readFixedPoint32(reader);
        var verticalResolutionUnit = reader.readUint16();
        var heightUnit = reader.readUint16();
        target.resolutionInfo = {
            horizontalResolution: horizontalResolution,
            horizontalResolutionUnit: RESOLUTION_UNITS[horizontalResolutionUnit] || 'PPI',
            widthUnit: MEASUREMENT_UNITS[widthUnit] || 'Inches',
            verticalResolution: verticalResolution,
            verticalResolutionUnit: RESOLUTION_UNITS[verticalResolutionUnit] || 'PPI',
            heightUnit: MEASUREMENT_UNITS[heightUnit] || 'Inches',
        };
    },
    write: function (writer, target) {
        var info = target.resolutionInfo;
        writeFixedPoint32(writer, info.horizontalResolution || 0);
        writer.writeUint16(Math.max(1, RESOLUTION_UNITS.indexOf(info.horizontalResolutionUnit)));
        writer.writeUint16(Math.max(1, MEASUREMENT_UNITS.indexOf(info.widthUnit)));
        writeFixedPoint32(writer, info.verticalResolution || 0);
        writer.writeUint16(Math.max(1, RESOLUTION_UNITS.indexOf(info.verticalResolutionUnit)));
        writer.writeUint16(Math.max(1, MEASUREMENT_UNITS.indexOf(info.heightUnit)));
    },
});
addHandler({
    key: 1006,
    has: function (target) { return typeof target.alphaChannelNames !== 'undefined'; },
    read: function (reader, target, left) {
        target.alphaChannelNames = [];
        while (left()) {
            target.alphaChannelNames.push(reader.readPascalString(1));
        }
    },
    write: function (writer, target) {
        for (var _i = 0, _a = target.alphaChannelNames; _i < _a.length; _i++) {
            var name_1 = _a[_i];
            writer.writePascalString(name_1);
        }
    },
});
addHandler({
    key: 1024,
    has: function (target) { return typeof target.layerState !== 'undefined'; },
    read: function (reader, target) {
        target.layerState = reader.readUint16();
    },
    write: function (writer, target) {
        writer.writeUint16(target.layerState);
    },
});
addHandler({
    key: 1026,
    has: function (target) { return typeof target.layersGroup !== 'undefined'; },
    read: function (reader, target, left) {
        target.layersGroup = [];
        while (left())
            target.layersGroup.push(reader.readUint16());
    },
    write: function (writer, target) {
        for (var _i = 0, _a = target.layersGroup; _i < _a.length; _i++) {
            var g = _a[_i];
            writer.writeUint32(g);
        }
    },
});
addHandler({
    key: 1032,
    has: function (target) { return typeof target.gridAndGuidesInformation !== 'undefined'; },
    read: function (reader, target) {
        target.gridAndGuidesInformation = {
            version: reader.readUint32(),
            grid: {
                horizontal: reader.readUint32(),
                vertical: reader.readUint32(),
            },
            guides: [],
        };
        var count = reader.readUint32();
        while (count--) {
            target.gridAndGuidesInformation.guides.push({
                location: reader.readUint32() / 32,
                direction: reader.readUint8() ? 'horizontal' : 'vertical'
            });
        }
    },
    write: function (writer, target) {
        var info = target.gridAndGuidesInformation;
        var version = info.version || 1;
        var grid = info.grid || { horizontal: 18 * 32, vertical: 18 * 32 };
        var guides = info.guides || [];
        writer.writeUint32(version);
        writer.writeUint32(grid.horizontal);
        writer.writeUint32(grid.vertical);
        writer.writeUint32(guides.length);
        guides.forEach(function (g) {
            writer.writeUint32(g.location * 32);
            writer.writeUint8(g.direction === 'horizontal' ? 1 : 0);
        });
    },
});
addHandler({
    key: 1037,
    has: function (target) { return typeof target.globalAngle !== 'undefined'; },
    read: function (reader, target) {
        target.globalAngle = reader.readUint32();
    },
    write: function (writer, target) {
        writer.writeUint32(target.globalAngle);
    },
});
addHandler({
    key: 1045,
    has: function (target) { return typeof target.unicodeAlphaNames !== 'undefined'; },
    read: function (reader, target, left) {
        target.unicodeAlphaNames = [];
        while (left())
            target.unicodeAlphaNames.push(reader.readUnicodeString());
    },
    write: function (writer, target) {
        for (var _i = 0, _a = target.unicodeAlphaNames; _i < _a.length; _i++) {
            var name_2 = _a[_i];
            writer.writeUnicodeString(name_2);
        }
    },
});
addHandler({
    key: 1049,
    has: function (target) { return typeof target.globalAltitude !== 'undefined'; },
    read: function (reader, target) {
        target.globalAltitude = reader.readUint32();
    },
    write: function (writer, target) {
        writer.writeUint32(target.globalAltitude);
    },
});
addHandler({
    key: 1053,
    has: function (target) { return typeof target.alphaIdentifiers !== 'undefined'; },
    read: function (reader, target, left) {
        target.alphaIdentifiers = [];
        while (left() >= 4)
            target.alphaIdentifiers.push(reader.readUint32());
    },
    write: function (writer, target) {
        for (var _i = 0, _a = target.alphaIdentifiers; _i < _a.length; _i++) {
            var id = _a[_i];
            writer.writeUint32(id);
        }
    },
});
addHandler({
    key: 1054,
    has: function (target) { return typeof target.urlsList !== 'undefined'; },
    read: function (reader, target) {
        var count = reader.readUint32();
        target.urlsList = [];
        if (count)
            throw new Error('Not implemented: URL List');
    },
    write: function (writer, target) {
        writer.writeUint32(target.urlsList.length);
        if (target.urlsList.length)
            throw new Error('Not implemented: URL List');
    },
});
addHandler({
    key: 1057,
    has: function (target) { return typeof target.versionInfo !== 'undefined'; },
    read: function (reader, target) {
        target.versionInfo = {
            version: reader.readUint32(),
            hasRealMergedData: !!reader.readUint8(),
            writerName: reader.readUnicodeString(),
            readerName: reader.readUnicodeString(),
            fileVersion: reader.readUint32(),
        };
    },
    write: function (writer, target) {
        var versionInfo = target.versionInfo;
        writer.writeUint32(versionInfo.version);
        writer.writeUint8(versionInfo.hasRealMergedData ? 1 : 0);
        writer.writeUnicodeString(versionInfo.writerName);
        writer.writeUnicodeString(versionInfo.readerName);
        writer.writeUint32(versionInfo.fileVersion);
    },
});
addHandler({
    key: 1064,
    has: function (target) { return typeof target.pixelAspectRatio !== 'undefined'; },
    read: function (reader, target) {
        target.pixelAspectRatio = {
            version: reader.readUint32(),
            aspect: reader.readFloat64(),
        };
    },
    write: function (writer, target) {
        writer.writeUint32(target.pixelAspectRatio.version);
        writer.writeFloat64(target.pixelAspectRatio.aspect);
    },
});
addHandler({
    key: 1069,
    has: function (target) { return typeof target.layerSelectionIds !== 'undefined'; },
    read: function (reader, target) {
        var count = reader.readUint16();
        target.layerSelectionIds = [];
        while (count--)
            target.layerSelectionIds.push(reader.readUint32());
    },
    write: function (writer, target) {
        writer.writeUint16(target.layerSelectionIds.length);
        for (var _i = 0, _a = target.layerSelectionIds; _i < _a.length; _i++) {
            var id = _a[_i];
            writer.writeUint32(id);
        }
    },
});
addHandler({
    key: 1072,
    has: function (target) { return typeof target.layerGroupsEnabledId !== 'undefined'; },
    read: function (reader, target, left) {
        target.layerGroupsEnabledId = [];
        while (left())
            target.layerGroupsEnabledId.push(reader.readUint8());
    },
    write: function (writer, target) {
        for (var _i = 0, _a = target.layerGroupsEnabledId; _i < _a.length; _i++) {
            var id = _a[_i];
            writer.writeUint8(id);
        }
    },
});
//private writeThumbnailResource(thumb: HTMLCanvasElement) {
// this.writeSignature('8BIM');
// this.writeUint16(1036); // resource ID
// this.writeUint16(0); // name (pascal string)
// this.section(2,() => { // size
//     this.writeUint32(0); // format (1 = kJpegRGB; 0 = kRawRGB)
//     this.writeUint32(thumb.width); // width
//     this.writeUint32(thumb.height); // height
//     // Widthbytes: Padded row bytes = (width * bits per pixel + 31) / 32 * 4
//     this.writeUint32((((thumb.width * 8 * 4 + 31) / 32) | 0) * 4);
//     var compressedSizeOffset = writer.getOffset();
//     this.writeUint32(0); // size after compression
//     this.writeUint16(24); // bits per pixel
//     this.writeUint16(1); // number of planes
//     // TODO: actual JFIF thumbnail data here
//
//     const array = new Uint8Array(thumbData);
//
//     for (let i = 0; i < array.length; i++)
//         this.writeUint8(array[i]);
// });
//}


},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromBlendMode = {};
exports.toBlendMode = {
    'pass': 'pass through',
    'norm': 'normal',
    'diss': 'dissolve',
    'dark': 'darken',
    'mul ': 'multiply',
    'idiv': 'color burn',
    'lbrn': 'linear burn',
    'dkCl': 'darker color',
    'lite': 'lighten',
    'scrn': 'screen',
    'div ': 'color dodge',
    'lddg': 'linear dodge',
    'lgCl': 'lighter color',
    'over': 'overlay',
    'sLit': 'soft light',
    'hLit': 'hard light',
    'vLit': 'vivid light',
    'lLit': 'linear light',
    'pLit': 'pin light',
    'hMix': 'hard mix',
    'diff': 'difference',
    'smud': 'exclusion',
    'fsub': 'subtract',
    'fdiv': 'divide',
    'hue ': 'hue',
    'sat ': 'saturation',
    'colr': 'color',
    'lum ': 'luminosity',
};
Object.keys(exports.toBlendMode).forEach(function (key) { return exports.fromBlendMode[exports.toBlendMode[key]] = key; });
var ColorSpace;
(function (ColorSpace) {
    ColorSpace[ColorSpace["RGB"] = 0] = "RGB";
    ColorSpace[ColorSpace["HSB"] = 1] = "HSB";
    ColorSpace[ColorSpace["CMYK"] = 2] = "CMYK";
    ColorSpace[ColorSpace["Lab"] = 7] = "Lab";
    ColorSpace[ColorSpace["Grayscale"] = 8] = "Grayscale";
})(ColorSpace = exports.ColorSpace || (exports.ColorSpace = {}));
var ColorMode;
(function (ColorMode) {
    ColorMode[ColorMode["Bitmap"] = 0] = "Bitmap";
    ColorMode[ColorMode["Grayscale"] = 1] = "Grayscale";
    ColorMode[ColorMode["Indexed"] = 2] = "Indexed";
    ColorMode[ColorMode["RGB"] = 3] = "RGB";
    ColorMode[ColorMode["CMYK"] = 4] = "CMYK";
    ColorMode[ColorMode["Multichannel"] = 7] = "Multichannel";
    ColorMode[ColorMode["Duotone"] = 8] = "Duotone";
    ColorMode[ColorMode["Lab"] = 9] = "Lab";
})(ColorMode = exports.ColorMode || (exports.ColorMode = {}));
var ChannelID;
(function (ChannelID) {
    ChannelID[ChannelID["Red"] = 0] = "Red";
    ChannelID[ChannelID["Green"] = 1] = "Green";
    ChannelID[ChannelID["Blue"] = 2] = "Blue";
    ChannelID[ChannelID["Transparency"] = -1] = "Transparency";
    ChannelID[ChannelID["UserMask"] = -2] = "UserMask";
    ChannelID[ChannelID["RealUserMask"] = -3] = "RealUserMask";
})(ChannelID = exports.ChannelID || (exports.ChannelID = {}));
var Compression;
(function (Compression) {
    Compression[Compression["RawData"] = 0] = "RawData";
    Compression[Compression["RleCompressed"] = 1] = "RleCompressed";
    Compression[Compression["ZipWithoutPrediction"] = 2] = "ZipWithoutPrediction";
    Compression[Compression["ZipWithPrediction"] = 3] = "ZipWithPrediction";
})(Compression = exports.Compression || (exports.Compression = {}));
var SectionDividerType;
(function (SectionDividerType) {
    SectionDividerType[SectionDividerType["Other"] = 0] = "Other";
    SectionDividerType[SectionDividerType["OpenFolder"] = 1] = "OpenFolder";
    SectionDividerType[SectionDividerType["ClosedFolder"] = 2] = "ClosedFolder";
    SectionDividerType[SectionDividerType["BoundingSectionDivider"] = 3] = "BoundingSectionDivider";
})(SectionDividerType = exports.SectionDividerType || (exports.SectionDividerType = {}));


},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var psd_1 = require("./psd");
var helpers_1 = require("./helpers");
var additionalInfo_1 = require("./additionalInfo");
var imageResources_1 = require("./imageResources");
var supportedColorModes = [psd_1.ColorMode.Bitmap, psd_1.ColorMode.Grayscale, psd_1.ColorMode.RGB];
function setupGrayscale(data) {
    var size = data.width * data.height * 4;
    for (var i = 0; i < size; i += 4) {
        data.data[i + 1] = data.data[i];
        data.data[i + 2] = data.data[i];
    }
}
var NOT_IMPLEMENTED = 'Not implemented';
var PsdReader = /** @class */ (function () {
    function PsdReader() {
        this.offset = 0;
    }
    PsdReader.prototype.readInt8 = function () { throw new Error(NOT_IMPLEMENTED); };
    PsdReader.prototype.readUint8 = function () { throw new Error(NOT_IMPLEMENTED); };
    PsdReader.prototype.readInt16 = function () { throw new Error(NOT_IMPLEMENTED); };
    PsdReader.prototype.readUint16 = function () { throw new Error(NOT_IMPLEMENTED); };
    PsdReader.prototype.readInt32 = function () { throw new Error(NOT_IMPLEMENTED); };
    PsdReader.prototype.readUint32 = function () { throw new Error(NOT_IMPLEMENTED); };
    PsdReader.prototype.readFloat32 = function () { throw new Error(NOT_IMPLEMENTED); };
    PsdReader.prototype.readFloat64 = function () { throw new Error(NOT_IMPLEMENTED); };
    PsdReader.prototype.readBytes = function (_length) { throw new Error(NOT_IMPLEMENTED); };
    PsdReader.prototype.createCanvas = function (_width, _height) { throw new Error(NOT_IMPLEMENTED); };
    PsdReader.prototype.skip = function (count) {
        this.offset += count;
    };
    PsdReader.prototype.readString = function (length) {
        var buffer = this.readBytes(length);
        return String.fromCharCode.apply(String, buffer);
    };
    PsdReader.prototype.readSignature = function () {
        return this.readString(4);
    };
    PsdReader.prototype.readPascalString = function (padTo) {
        if (padTo === void 0) { padTo = 2; }
        var length = this.readUint8();
        var text = this.readString(length);
        while (++length % padTo)
            this.skip(1);
        return text;
    };
    PsdReader.prototype.readUnicodeString = function () {
        var length = this.readUint32();
        var text = '';
        while (length--)
            text += String.fromCharCode(this.readUint16());
        return text;
    };
    PsdReader.prototype.readSection = function (round, func) {
        var _this = this;
        var length = this.readUint32();
        var end = this.offset + length;
        var result;
        if (length > 0)
            result = func(function () { return end - _this.offset; });
        /* istanbul ignore if */
        if (this.offset > end)
            throw new Error('Exceeded section limits');
        /* istanbul ignore if */
        if (this.offset !== end)
            throw new Error("Unread section data: " + (end - this.offset) + " bytes at 0x" + this.offset.toString(16));
        while (end % round)
            end++;
        this.offset = end;
        return result;
    };
    PsdReader.prototype.checkSignature = function () {
        var expected = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            expected[_i] = arguments[_i];
        }
        var offset = this.offset;
        var signature = this.readSignature();
        /* istanbul ignore if */
        if (expected.indexOf(signature) === -1)
            throw new Error("Invalid signature: '" + signature + "' at 0x" + offset.toString(16));
    };
    PsdReader.prototype.readPsd = function (options) {
        var opt = options || {};
        var psd = this.readHeader();
        this.readColorModeData(psd);
        this.readImageResources(psd);
        var globalAlpha = this.readLayerAndMaskInfo(psd, !!opt.skipLayerImageData);
        var hasChildren = psd.children && psd.children.length;
        var skipComposite = opt.skipCompositeImageData && (opt.skipLayerImageData || hasChildren);
        if (!skipComposite)
            this.readImageData(psd, globalAlpha);
        return psd;
    };
    PsdReader.prototype.readHeader = function () {
        this.checkSignature('8BPS');
        var version = this.readUint16();
        /* istanbul ignore if */
        if (version !== 1)
            throw new Error("Invalid PSD file version: " + version);
        this.skip(6);
        var channels = this.readUint16();
        var height = this.readUint32();
        var width = this.readUint32();
        var bitsPerChannel = this.readUint16();
        var colorMode = this.readUint16();
        /* istanbul ignore if */
        if (supportedColorModes.indexOf(colorMode) === -1)
            throw new Error("Color mode not supported: " + colorMode);
        return { width: width, height: height, channels: channels, bitsPerChannel: bitsPerChannel, colorMode: colorMode };
    };
    PsdReader.prototype.readColorModeData = function (_psd) {
        this.readSection(1, function () {
            throw new Error('Not Implemented: color mode data');
        });
    };
    PsdReader.prototype.readImageResources = function (psd) {
        var _this = this;
        this.readSection(1, function (left) {
            while (left())
                _this.readImageResource(psd);
        });
    };
    PsdReader.prototype.readImageResource = function (psd) {
        var _this = this;
        this.checkSignature('8BIM');
        var id = this.readUint16();
        var name = this.readPascalString();
        this.readSection(2, function (left) {
            var handler = imageResources_1.getHandler(id, name);
            if (!psd.imageResources)
                psd.imageResources = {};
            if (handler) {
                handler.read(_this, psd.imageResources, left);
            }
            else {
                //console.log(`Image resource: ${id} ${name} ${getImageResourceName(id).substr(0, 90) }`);
                _this.skip(left());
            }
        });
    };
    PsdReader.prototype.readLayerAndMaskInfo = function (psd, skipImageData) {
        var _this = this;
        var globalAlpha = false;
        this.readSection(1, function (left) {
            globalAlpha = _this.readLayerInfo(psd, skipImageData);
            _this.readGlobalLayerMaskInfo();
            while (left()) {
                if (left() > 2) {
                    _this.readAdditionalLayerInfo(psd);
                }
                else {
                    _this.skip(left());
                }
            }
        });
        return globalAlpha;
    };
    PsdReader.prototype.readLayerInfo = function (psd, skipImageData) {
        var _this = this;
        var globalAlpha = false;
        this.readSection(2, function (left) {
            var layerCount = _this.readInt16();
            if (layerCount < 0) {
                globalAlpha = true;
                layerCount = -layerCount;
            }
            var layers = [];
            var layerChannels = [];
            for (var i = 0; i < layerCount; i++) {
                var _a = _this.readLayerRecord(), layer = _a.layer, channels = _a.channels;
                layers.push(layer);
                layerChannels.push(channels);
            }
            if (!skipImageData) {
                for (var i = 0; i < layerCount; i++)
                    _this.readLayerChannelImageData(psd, layers[i], layerChannels[i]);
            }
            _this.skip(left());
            if (!psd.children)
                psd.children = [];
            var stack = [psd];
            for (var i = layers.length - 1; i >= 0; i--) {
                var l = layers[i];
                var type = l.sectionDivider ? l.sectionDivider.type : psd_1.SectionDividerType.Other;
                if (type === psd_1.SectionDividerType.OpenFolder || type === psd_1.SectionDividerType.ClosedFolder) {
                    l.opened = type === psd_1.SectionDividerType.OpenFolder;
                    l.children = [];
                    stack[stack.length - 1].children.unshift(l);
                    stack.push(l);
                }
                else if (type === psd_1.SectionDividerType.BoundingSectionDivider) {
                    stack.pop();
                }
                else {
                    stack[stack.length - 1].children.unshift(l);
                }
            }
        });
        return globalAlpha;
    };
    PsdReader.prototype.readLayerRecord = function () {
        var _this = this;
        var layer = {};
        layer.top = this.readInt32();
        layer.left = this.readInt32();
        layer.bottom = this.readInt32();
        layer.right = this.readInt32();
        var channelCount = this.readUint16();
        var channels = [];
        for (var i = 0; i < channelCount; i++) {
            var channelID = this.readInt16();
            var channelLength = this.readUint32();
            channels.push({ id: channelID, length: channelLength });
        }
        this.checkSignature('8BIM');
        var blendMode = this.readSignature();
        /* istanbul ignore if */
        if (!psd_1.toBlendMode[blendMode])
            throw new Error("Invalid blend mode: '" + blendMode + "'");
        layer.blendMode = psd_1.toBlendMode[blendMode];
        layer.opacity = this.readUint8();
        layer.clipping = this.readUint8() === 1;
        var flags = this.readUint8();
        layer.transparencyProtected = (flags & 0x01) !== 0;
        layer.hidden = (flags & 0x02) !== 0;
        this.readUint8(); // filler
        this.readSection(1, function (left) {
            _this.readLayerMaskData();
            _this.readLayerBlendingRanges();
            layer.name = _this.readPascalString();
            var last = 0;
            while (left() && (last = _this.readUint8()) === 0)
                ;
            if (last !== 0)
                _this.offset--;
            while (left() > 4)
                _this.readAdditionalLayerInfo(layer);
        });
        return { layer: layer, channels: channels };
    };
    PsdReader.prototype.readLayerMaskData = function () {
        this.readSection(1, function (left) {
            /* istanbul ignore if */
            if (left())
                throw new Error("Not Implemented: layer mask data");
        });
    };
    PsdReader.prototype.readLayerBlendingRanges = function () {
        var _this = this;
        return this.readSection(1, function (left) {
            var compositeGrayBlendSource = _this.readUint32();
            var compositeGraphBlendDestinationRange = _this.readUint32();
            var ranges = [];
            while (left()) {
                var sourceRange = _this.readUint32();
                var destRange = _this.readUint32();
                ranges.push({ sourceRange: sourceRange, destRange: destRange });
            }
            return { compositeGrayBlendSource: compositeGrayBlendSource, compositeGraphBlendDestinationRange: compositeGraphBlendDestinationRange, ranges: ranges };
        });
    };
    PsdReader.prototype.readLayerChannelImageData = function (psd, layer, channels) {
        var layerWidth = layer.right - layer.left;
        var layerHeight = layer.bottom - layer.top;
        var canvas;
        var context;
        var data;
        if (layerWidth && layerHeight) {
            canvas = this.createCanvas(layerWidth, layerHeight);
            context = canvas.getContext('2d');
            data = context.createImageData(layerWidth, layerHeight);
            helpers_1.resetCanvas(data);
        }
        for (var _i = 0, channels_1 = channels; _i < channels_1.length; _i++) {
            var channel = channels_1[_i];
            var compression = this.readUint16();
            var offset = helpers_1.offsetForChannel(channel.id);
            /* istanbul ignore if */
            if (offset < 0) {
                throw new Error("Channel not supported: " + channel.id);
            }
            if (compression === psd_1.Compression.RawData) {
                helpers_1.readDataRaw(this, data, offset, layerWidth, layerHeight);
            }
            else if (compression === psd_1.Compression.RleCompressed) {
                helpers_1.readDataRLE(this, data, 4, layerWidth, layerHeight, [offset]);
            }
            else {
                throw new Error("Compression type not supported: " + compression);
            }
            if (data && psd.colorMode === psd_1.ColorMode.Grayscale) {
                setupGrayscale(data);
            }
        }
        if (context && data) {
            context.putImageData(data, 0, 0);
            layer.canvas = canvas;
        }
    };
    PsdReader.prototype.readGlobalLayerMaskInfo = function () {
        var _this = this;
        return this.readSection(1, function (left) {
            if (left()) {
                var overlayColorSpace = _this.readUint16();
                var colorSpace1 = _this.readUint16();
                var colorSpace2 = _this.readUint16();
                var colorSpace3 = _this.readUint16();
                var colorSpace4 = _this.readUint16();
                var opacity = _this.readUint16();
                var kind = _this.readUint8();
                _this.skip(left());
                return { overlayColorSpace: overlayColorSpace, colorSpace1: colorSpace1, colorSpace2: colorSpace2, colorSpace3: colorSpace3, colorSpace4: colorSpace4, opacity: opacity, kind: kind };
            }
        });
    };
    PsdReader.prototype.readAdditionalLayerInfo = function (target) {
        var _this = this;
        this.checkSignature('8BIM', '8B64');
        var key = this.readSignature();
        this.readSection(2, function (left) {
            var handler = additionalInfo_1.getHandler(key);
            if (handler) {
                handler.read(_this, target, left);
            }
            else {
                console.log("Unhandled additional info: " + key);
                _this.skip(left());
            }
            if (left()) {
                console.log("Unread " + left() + " bytes left for tag: " + key);
                _this.skip(left());
            }
        });
    };
    PsdReader.prototype.readImageData = function (psd, globalAlpha) {
        var compression = this.readUint16();
        if (supportedColorModes.indexOf(psd.colorMode) === -1)
            throw new Error("Color mode not supported: " + psd.colorMode);
        if (compression !== psd_1.Compression.RawData && compression !== psd_1.Compression.RleCompressed)
            throw new Error("Compression type not supported: " + compression);
        var canvas = this.createCanvas(psd.width, psd.height);
        var context = canvas.getContext('2d');
        var data = context.createImageData(psd.width, psd.height);
        helpers_1.resetCanvas(data);
        if (psd.colorMode === psd_1.ColorMode.Bitmap) {
            var bytes = [];
            if (compression === psd_1.Compression.RawData) {
                bytes = this.readBytes(Math.ceil(psd.width / 8) * psd.height);
            }
            else if (compression === psd_1.Compression.RleCompressed) {
                helpers_1.readDataRLE(this, { data: bytes, width: psd.width, height: psd.height }, 1, psd.width, psd.height, [0]);
            }
            helpers_1.decodeBitmap(bytes, data.data, psd.width, psd.height);
        }
        else { // Grayscale | RGB
            var channels = psd.colorMode === psd_1.ColorMode.RGB ? [0, 1, 2] : [0];
            if (psd.channels && psd.channels > 3) {
                for (var i = 3; i < psd.channels; i++) {
                    channels.push(i);
                }
            }
            else if (globalAlpha) {
                channels.push(3);
            }
            if (compression === psd_1.Compression.RawData) {
                for (var i = 0; i < channels.length; i++) {
                    helpers_1.readDataRaw(this, data, channels[i], psd.width, psd.height);
                }
            }
            else if (compression === psd_1.Compression.RleCompressed) {
                helpers_1.readDataRLE(this, data, 4, psd.width, psd.height, channels);
            }
            if (psd.colorMode === psd_1.ColorMode.Grayscale) {
                setupGrayscale(data);
            }
        }
        context.putImageData(data, 0, 0);
        psd.canvas = canvas;
    };
    return PsdReader;
}());
exports.PsdReader = PsdReader;


},{"./additionalInfo":1,"./helpers":6,"./imageResources":7,"./psd":8}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var psd_1 = require("./psd");
var helpers_1 = require("./helpers");
var additionalInfo_1 = require("./additionalInfo");
var imageResources_1 = require("./imageResources");
function addChildren(layers, children) {
    if (!children)
        return;
    for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
        var c = children_1[_i];
        if (c.children && c.canvas)
            throw new Error("Invalid layer: cannot have both 'canvas' and 'children' properties set");
        if (c.children) {
            c.sectionDivider = {
                type: c.opened === false ? psd_1.SectionDividerType.ClosedFolder : psd_1.SectionDividerType.OpenFolder,
                key: 'pass',
                subtype: 0,
            };
            layers.push({
                name: '</Layer group>',
                sectionDivider: {
                    type: psd_1.SectionDividerType.BoundingSectionDivider,
                },
            });
            addChildren(layers, c.children);
            layers.push(c);
        }
        else {
            layers.push(c);
        }
    }
}
var NOT_IMPLEMENTED = 'Not implemented';
var PsdWriter = /** @class */ (function () {
    function PsdWriter() {
        this.offset = 0;
    }
    PsdWriter.prototype.writeInt8 = function (_value) { throw new Error(NOT_IMPLEMENTED); };
    PsdWriter.prototype.writeUint8 = function (_value) { throw new Error(NOT_IMPLEMENTED); };
    PsdWriter.prototype.writeInt16 = function (_value) { throw new Error(NOT_IMPLEMENTED); };
    PsdWriter.prototype.writeUint16 = function (_value) { throw new Error(NOT_IMPLEMENTED); };
    PsdWriter.prototype.writeInt32 = function (_value) { throw new Error(NOT_IMPLEMENTED); };
    PsdWriter.prototype.writeUint32 = function (_value) { throw new Error(NOT_IMPLEMENTED); };
    PsdWriter.prototype.writeFloat32 = function (_value) { throw new Error(NOT_IMPLEMENTED); };
    PsdWriter.prototype.writeFloat64 = function (_value) { throw new Error(NOT_IMPLEMENTED); };
    PsdWriter.prototype.writeBytes = function (_buffer) { throw new Error(NOT_IMPLEMENTED); };
    PsdWriter.prototype.writeBuffer = function (buffer) {
        if (buffer) {
            this.writeBytes(new Uint8Array(buffer));
        }
    };
    PsdWriter.prototype.writeSignature = function (signature) {
        if (!signature || signature.length !== 4)
            throw new Error("Invalid signature: '" + signature + "'");
        for (var i = 0; i < 4; i++)
            this.writeUint8(signature.charCodeAt(i));
    };
    PsdWriter.prototype.writeZeros = function (count) {
        for (var i = 0; i < count; i++)
            this.writeUint8(0);
    };
    PsdWriter.prototype.writePascalString = function (text, padTo) {
        if (padTo === void 0) { padTo = 2; }
        var length = text.length;
        this.writeUint8(length);
        for (var i = 0; i < length; i++) {
            var code = text.charCodeAt(i);
            this.writeUint8(code < 128 ? code : '?'.charCodeAt(0));
        }
        while (++length % padTo)
            this.writeUint8(0);
    };
    PsdWriter.prototype.writeUnicodeString = function (text) {
        this.writeUint32(text.length);
        for (var i = 0; i < text.length; i++)
            this.writeUint16(text.charCodeAt(i));
    };
    PsdWriter.prototype.writeSection = function (round, func) {
        var offset = this.offset;
        this.writeUint32(0);
        func();
        var length = this.offset - offset - 4;
        while ((length % round) !== 0) {
            this.writeUint8(0);
            length++;
        }
        var temp = this.offset;
        this.offset = offset;
        this.writeUint32(length);
        this.offset = temp;
    };
    PsdWriter.prototype.writePsd = function (psd, _options) {
        if (!(+psd.width > 0 && +psd.height > 0))
            throw new Error('Invalid document size');
        var canvas = psd.canvas;
        var globalAlpha = !!canvas && helpers_1.hasAlpha(canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height));
        this.writeHeader(psd, globalAlpha);
        this.writeColorModeData(psd);
        this.writeImageResources(psd);
        this.writeLayerAndMaskInfo(psd, globalAlpha);
        this.writeImageData(psd, globalAlpha);
    };
    PsdWriter.prototype.writeHeader = function (psd, globalAlpha) {
        this.writeSignature('8BPS');
        this.writeUint16(1); // version
        this.writeZeros(6);
        this.writeUint16(globalAlpha ? 4 : 3); // channels
        this.writeUint32(psd.height);
        this.writeUint32(psd.width);
        this.writeUint16(8); // bits per channel
        this.writeUint16(psd_1.ColorMode.RGB);
    };
    PsdWriter.prototype.writeColorModeData = function (_psd) {
        this.writeSection(1, function () {
        });
    };
    PsdWriter.prototype.writeImageResources = function (psd) {
        var _this = this;
        this.writeSection(1, function () {
            var imageResources = psd.imageResources;
            if (imageResources) {
                var _loop_1 = function (handler) {
                    if (handler.has(imageResources)) {
                        _this.writeSignature('8BIM');
                        _this.writeUint16(handler.key);
                        _this.writePascalString('');
                        _this.writeSection(2, function () { return handler.write(_this, imageResources); });
                    }
                };
                for (var _i = 0, _a = imageResources_1.getHandlers(); _i < _a.length; _i++) {
                    var handler = _a[_i];
                    _loop_1(handler);
                }
            }
        });
    };
    PsdWriter.prototype.writeLayerAndMaskInfo = function (psd, globalAlpha) {
        var _this = this;
        this.writeSection(2, function () {
            _this.writeLayerInfo(psd, globalAlpha);
            _this.writeGlobalLayerMaskInfo();
            _this.writeAdditionalLayerInfo(psd);
        });
    };
    PsdWriter.prototype.writeLayerInfo = function (psd, globalAlpha) {
        var _this = this;
        this.writeSection(2, function () {
            var layers = [];
            addChildren(layers, psd.children);
            if (!layers.length)
                layers.push({});
            var channels = layers.map(function (l, i) { return helpers_1.getChannels(l, i === 0); });
            _this.writeInt16(globalAlpha ? -layers.length : layers.length);
            layers.forEach(function (l, i) { return _this.writeLayerRecord(psd, l, channels[i]); });
            channels.forEach(function (c) { return _this.writeLayerChannelImageData(c); });
        });
    };
    PsdWriter.prototype.writeLayerRecord = function (psd, layer, channels) {
        var _this = this;
        this.writeUint32(layer.top || 0);
        this.writeUint32(layer.left || 0);
        this.writeUint32(layer.bottom || 0);
        this.writeUint32(layer.right || 0);
        this.writeUint16(channels.length);
        for (var _i = 0, channels_1 = channels; _i < channels_1.length; _i++) {
            var c = channels_1[_i];
            this.writeInt16(c.channelId);
            this.writeUint32(c.length);
        }
        this.writeSignature('8BIM');
        this.writeSignature(psd_1.fromBlendMode[layer.blendMode || 'normal']);
        this.writeUint8(typeof layer.opacity !== 'undefined' ? layer.opacity : 255);
        this.writeUint8(layer.clipping ? 1 : 0);
        var flags = 0;
        if (layer.transparencyProtected)
            flags = flags | 0x01;
        if (layer.hidden)
            flags = flags | 0x02;
        this.writeUint8(flags);
        this.writeUint8(0); // filler
        this.writeSection(1, function () {
            _this.writeLayerMaskData();
            _this.writeLayerBlendingRanges(psd);
            _this.writePascalString(layer.name || '', 4);
            _this.writeAdditionalLayerInfo(layer);
        });
    };
    PsdWriter.prototype.writeLayerMaskData = function () {
        this.writeSection(1, function () {
        });
    };
    PsdWriter.prototype.writeLayerBlendingRanges = function (psd) {
        var _this = this;
        this.writeSection(1, function () {
            _this.writeUint32(65535);
            _this.writeUint32(65535);
            var channels = psd.channels || 0;
            for (var i = 0; i < channels; i++) {
                _this.writeUint32(65535);
                _this.writeUint32(65535);
            }
        });
    };
    PsdWriter.prototype.writeLayerChannelImageData = function (channels) {
        for (var _i = 0, channels_2 = channels; _i < channels_2.length; _i++) {
            var channel = channels_2[_i];
            this.writeUint16(channel.compression);
            if (channel.buffer)
                this.writeBuffer(channel.buffer);
        }
    };
    PsdWriter.prototype.writeGlobalLayerMaskInfo = function () {
        this.writeSection(1, function () {
        });
    };
    PsdWriter.prototype.writeAdditionalLayerInfo = function (target) {
        var _this = this;
        var _loop_2 = function (handler) {
            if (handler.has(target)) {
                this_1.writeSignature('8BIM');
                this_1.writeSignature(handler.key);
                this_1.writeSection(2, function () { return handler.write(_this, target); });
            }
        };
        var this_1 = this;
        for (var _i = 0, _a = additionalInfo_1.getHandlers(); _i < _a.length; _i++) {
            var handler = _a[_i];
            _loop_2(handler);
        }
    };
    PsdWriter.prototype.writeImageData = function (psd, globalAlpha) {
        var channels = globalAlpha ? [0, 1, 2, 3] : [0, 1, 2];
        var data;
        if (psd.canvas) {
            data = psd.canvas.getContext('2d').getImageData(0, 0, psd.width, psd.height);
        }
        else {
            data = {
                data: new Uint8Array(4 * psd.width * psd.height),
                width: psd.width,
                height: psd.height,
            };
        }
        this.writeUint16(psd_1.Compression.RleCompressed);
        this.writeBytes(helpers_1.writeDataRLE(data, psd.width, psd.height, channels));
    };
    return PsdWriter;
}());
exports.PsdWriter = PsdWriter;


},{"./additionalInfo":1,"./helpers":6,"./imageResources":7,"./psd":8}]},{},[4])(4)
});
