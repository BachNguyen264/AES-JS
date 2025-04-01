//Phép nhân Galois
function gfMultiply(a, b) {
    let result = 0;
    while (b > 0) {
        if (b & 1) result ^= a; // Nếu b lẻ, cộng (XOR) a vào kết quả
        a = (a << 1) ^ (a & 0x80 ? 0x1B : 0); // Nếu bit cao nhất của a là 1, XOR với 0x1B (m(x))
        b >>= 1; // Dịch phải b
    }
    return result & 0xFF; // Giữ kết quả trong phạm vi 8 bit
}

//Hàm chuyển mảng 1D -> 2D 
function toStateMatrix(input) {
    let state = [];
    for (let i = 0; i < 4; i++) {
        state[i] = input.slice(i * 4, (i + 1) * 4);
    }
    return state;
}

// Chuyển văn bản thành mảng byte (Hỗ trợ Unicode)
function textToBytes(text) {
    return Array.from(new TextEncoder().encode(text)); // Chuyển Uint8Array thành mảng số nguyên
}

// Chuyển mảng byte thành văn bản (Hỗ trợ Unicode)
function bytesToText(bytes) {
    return new TextDecoder().decode(new Uint8Array(bytes)); // Chuyển về chuỗi UTF-8
}

function bytesToBase64(bytes) {
    return btoa(String.fromCharCode(...bytes));
}
function base64ToBytes(base64) {
    return new Uint8Array(atob(base64).split('').map(c => c.charCodeAt(0)));
}

// Hàm padding: làm đầy dữ liệu sao cho đủ bội số 16 byte
function padText(text) {
    let textBytes = textToBytes(text); // Chuyển thành bytes (UTF-8)
    let padLength = 16 - (textBytes.length % 16);
    let padding = new Array(padLength).fill(padLength); // Mảng padding

    return textBytes.concat(padding); // Trả về mảng byte đã padding
}

// Hàm unpadding: loại bỏ padding sau khi giải mã
function unpadText(paddedBytes) {
    let padLength = paddedBytes[paddedBytes.length - 1]; // Lấy số padding từ cuối chuỗi
    let textBytes = paddedBytes.slice(0, -padLength); // Cắt bỏ padding
    return bytesToText(textBytes); // Chuyển về UTF-8 string
}

//Sinh khóa ngẫu nhiên
function generateAESKey(bits) {
    const byteLength = bits / 8; // 128-bit => 16 byte, 192-bit => 24 byte, 256-bit => 32 byte
    const key = new Uint8Array(byteLength);
  
    // Sinh khóa ngẫu nhiên
    crypto.getRandomValues(key);
  
    return Array.from(key); // Trả về mảng các byte
}

function generateAESKeyString(bits) {
    const charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()-_=+";
    const keyLength = bits / 8; // 128-bit => 16 ký tự, 192-bit => 24 ký tự, 256-bit => 32 ký tự
    let key = "";

    for (let i = 0; i < keyLength; i++) {
        key += charSet[Math.floor(Math.random() * charSet.length)];
    }

    return key; // Trả về chuỗi khóa ngẫu nhiên
}

//Download file
function downloadFile(content, filename) {
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

export {gfMultiply, toStateMatrix, textToBytes,
        bytesToText, padText, unpadText, downloadFile,
        generateAESKey, generateAESKeyString,
        bytesToBase64, base64ToBytes
}