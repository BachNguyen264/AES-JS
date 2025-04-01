import { padText, unpadText, textToBytes, bytesToText } from "../script/util.js";
import { aesEncrypt, aesDecrypt } from "../script/aesAlgorithm.js";

function aesEncryptText(plaintext, key) {
    plaintext = padText(plaintext); // Đảm bảo đủ bội số của 16 byte
    let bytes = textToBytes(plaintext);
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
    let text = bytesToText(decryptedBytes);
    return unpadText(text);
}

const key = "SecretAES128Key@"
const plaintext = `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. 
Aenean commodo ligula eget dolor. Aenean massa. 
Cum sociis natoque penatibus et magnis dis parturient montes, 
nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.
Nulla consequat massa quis enim. 
Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. 
In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. 
Nullam dictum felis eu pede mollis pretium. Integer tincidunt. 
Cras dapibus. Vivamus elementum semper nisi. 
Aenean vulputate eleifend tellus. HelloWorldABCXYZ`;
const ciphertext = aesEncryptText(plaintext,textToBytes(key));
console.log(ciphertext);
const decryptedText = aesDecryptText(JSON.parse(JSON.stringify(ciphertext)),textToBytes(key))
console.log(decryptedText);

const testText = "Hello World. I am single now!";
console.log(textToBytes(testText));
console.log(bytesToText(textToBytes(testText)));
console.log(padText(testText));
console.log(unpadText(padText(testText)))
console.log(textToBytes(padText(testText)));
console.log(bytesToText(textToBytes(padText(testText))));