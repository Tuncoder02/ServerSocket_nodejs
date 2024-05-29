const crypto = require('crypto');

// Convert key to 32 bytes (256 bits)
const key = crypto.createHash('sha256').update('tuanhuysy').digest();
const key2 = crypto.createHash('sha256').update('khacsinh').digest();


// Function to encrypt data
function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-ecb', key, null);
    cipher.setAutoPadding(true); // PKCS7 padding is enabled by default
    let encrypted = cipher.update(text, 'utf8', 'base64'); // Using base64 for compatibility
    encrypted += cipher.final('base64');
    return encrypted;
}

// Function to decrypt data
function decrypt(encryptedText) {
    const decipher = crypto.createDecipheriv('aes-256-ecb', key, null);
    decipher.setAutoPadding(true); // PKCS7 padding is enabled by default
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8'); // Using base64 for compatibility
    decrypted += decipher.final('utf8');
    return decrypted;
}

function encryptWithKey2(text) {
    const cipher = crypto.createCipheriv('aes-256-ecb', key2, null);
    cipher.setAutoPadding(true); // PKCS7 padding is enabled by default
    let encrypted = cipher.update(text, 'utf8', 'base64'); // Using base64 for compatibility
    encrypted += cipher.final('base64');
    return encrypted;
}

// Function to decrypt data with key2
function decryptWithKey2(encryptedText) {
    const decipher = crypto.createDecipheriv('aes-256-ecb', key2, null);
    decipher.setAutoPadding(true); // PKCS7 padding is enabled by default
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8'); // Using base64 for compatibility
    decrypted += decipher.final('utf8');
    return decrypted;
}
module.exports = { encrypt, decrypt,encryptWithKey2,decryptWithKey2 };
