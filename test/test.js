import { aesEncrypt, aesDecrypt } from "../script/aesAlgorithm.js";

// Chuyển văn bản thành mảng byte (Hỗ trợ Unicode)
function textToBytes(text) {
    return Array.from(new TextEncoder().encode(text)); // Chuyển Uint8Array thành mảng số nguyên
}

// Chuyển mảng byte thành văn bản (Hỗ trợ Unicode)
function bytesToText(bytes) {
    return new TextDecoder().decode(new Uint8Array(bytes)); // Chuyển về chuỗi UTF-8
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

function toStateMatrix(input) {
    let state = [];
    for (let i = 0; i < 4; i++) {
        state[i] = input.slice(i * 4, (i + 1) * 4);
    }
    return state;
}

const plaintext = "Xin chào bạn khỏe không?";
const plaintext2 = "早安中國，我正在吃冰淇淋";
const plaintext3 = 'नमस्ते दुनिया, मैं अब सिंगल हूँ 🗣🔥'
const key = "SecretAES128Key@"
const iv = "MyInitialVector@"

function aesEncryptText(plaintext, key) {
    let bytes = padText(plaintext); // Đảm bảo đủ bội số của 16 byte
    let ciphertext = [];
  
    for (let i = 0; i < bytes.length; i += 16) {
      let block = bytes.slice(i, i + 16);
      ciphertext.push(aesEncrypt(block, key));
    }
    return ciphertext;
}
  
function aesDecryptText(ciphertext, key) {
    let decryptedBytes = [];
  
    for (let i = 0; i < ciphertext.length; i++) {
      let state = aesDecrypt(ciphertext[i], key);
      decryptedBytes.push(...state.flat()); // Chuyển ma trận 4x4 về mảng 1D
    }
  
    let text = unpadText(decryptedBytes);
    return text;
}

function xorBlocks(block1, block2) {
    return block1.map((byte, i) => byte ^ block2[i]);
}

function aesEncryptCBC(plaintext, key, iv) {
    let bytes = padText(plaintext);
    let ciphertext = [];
    let prevBlock = iv; // Khối IV ban đầu
  
    for (let i = 0; i < bytes.length; i += 16) {
      let block = bytes.slice(i, i + 16);
      let xoredBlock = xorBlocks(block, prevBlock); // XOR với khối trước đó
      let encryptedBlock = aesEncrypt(xoredBlock, key);
      ciphertext.push(encryptedBlock);
      prevBlock = encryptedBlock; // Cập nhật khối trước cho vòng tiếp theo
    }
  
    return [iv, ...ciphertext]; // Trả về IV + ciphertext để giải mã đúng
}

function aesDecryptCBC(ciphertext, key) {
    let iv = ciphertext[0]; // Lấy IV từ ciphertext
    let decryptedText = [];
    let prevBlock = iv;

    for (let i = 1; i < ciphertext.length; i++) {
        let decryptedBlock = aesDecrypt(ciphertext[i], key); 
        decryptedBlock = decryptedBlock.flat(); // Phẳng hóa ma trận 4x4

        let xoredBlock = xorBlocks(decryptedBlock, prevBlock); // XOR với khối trước đó
        decryptedText.push(...xoredBlock);
        prevBlock = ciphertext[i]; // Cập nhật khối trước cho vòng lặp tiếp theo
    }

    let text = unpadText(decryptedText);
    return text; // Loại bỏ padding và chuyển về text
}

console.log('Test byteToText và textToByte');
console.log(textToBytes(plaintext));
console.log(bytesToText(textToBytes(plaintext)));

console.log(textToBytes(plaintext2));
console.log(bytesToText(textToBytes(plaintext2)));
console.log('Test OK');
console.log('Test pad và unpad');
console.log(padText(plaintext));
console.log(padText(plaintext2));
console.log(unpadText(padText(plaintext2)));
console.log(unpadText(padText(plaintext)));
console.log('Test OK');
const ciphertext = aesEncryptText(plaintext3,textToBytes(key));
console.log(ciphertext);
const decryptedText = aesDecryptText(JSON.parse(JSON.stringify(ciphertext)),textToBytes(key))
console.log(decryptedText);

const ciphertextCBC = aesEncryptCBC(plaintext2,textToBytes(key),textToBytes(iv));
console.log(ciphertextCBC);
const decryptedTextCBC = aesDecryptCBC(JSON.parse(JSON.stringify(ciphertextCBC)),textToBytes(key))
console.log(decryptedTextCBC);