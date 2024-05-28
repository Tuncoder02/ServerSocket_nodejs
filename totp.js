const crypto = require('crypto');

// Bảng mã hóa Base32
const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Mã hóa Base32
function base32Encode(buffer) {
    let bits = 0;
    let value = 0;
    let output = '';

    for (let i = 0; i < buffer.length; i++) {
        value = (value << 8) | buffer[i];
        bits += 8;

        while (bits >= 5) {
            output += base32Chars[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }

    if (bits > 0) {
        output += base32Chars[(value << (5 - bits)) & 31];
    }

    return output;
}

// Giải mã Base32
function base32Decode(base32) {
    let bits = 0;
    let value = 0;
    const output = [];

    for (let i = 0; i < base32.length; i++) {
        const index = base32Chars.indexOf(base32[i].toUpperCase());
        if (index === -1) throw new Error('Invalid Base32 character');

        value = (value << 5) | index;
        bits += 5;

        if (bits >= 8) {
            output.push((value >>> (bits - 8)) & 255);
            bits -= 8;
        }
    }

    return Buffer.from(output);
}

// Tạo mã TOTP
function generateTOTP(secret, window = 0) {
    const timeStep = 30; // 30 giây
    let time = Math.floor(Date.now() / 1000 / timeStep) + window;
    const key = base32Decode(secret);
    const buffer = Buffer.alloc(8);

    for (let i = 7; i >= 0; i--) {
        buffer[i] = time & 0xff;
        time = time >> 8;
    }

    const hmac = crypto.createHmac('sha1', key).update(buffer).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const token = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1000000;

    return token.toString().padStart(6, '0');
}

// Xác minh mã TOTP
function verifyTOTP(token, secret, window = 1) {
    for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
        if (generateTOTP(secret, errorWindow) === token) {
            return true;
        }
    }
    return false;
}

// Tạo một secret base32
function generateSecret() {
    const randomBytes = crypto.randomBytes(10);
    return base32Encode(randomBytes);
}

module.exports = {
    generateTOTP,
    verifyTOTP,
    generateSecret
};
