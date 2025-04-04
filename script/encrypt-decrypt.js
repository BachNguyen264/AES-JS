import { aesEncryptText, aesDecryptText, aesEncryptCBC, aesDecryptCBC} from "../script/aesMode.js";
import { downloadFile, bytesToBase64, bytesToText, generateAESKeyString,textToBytes, base64ToBytes, toStateMatrix } from "../script/util.js";

document.getElementById("encryptBtn").addEventListener("click", () => {
    const fileInput = document.getElementById("plainFileInput");
    const mode = document.querySelector('#encryptMode').value;
    if (fileInput.files.length === 0) {
        alert("Vui lòng chọn một file để mã hóa!");
        return;
    }
    
    const key = document.getElementById('encryptKey').value;
    if(![16,24,32].includes(key.length)){
        alert(`Độ dài key phải là 16,24 hoặc 32.
Độ dài hiện tại: ${key.length}`);
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const fileContent = event.target.result; // Nội dung file

        if (mode === "ECB") {
            const start = performance.now();
            const ciphertext = aesEncryptText(fileContent,textToBytes(key));
            const end = performance.now();
            document.getElementById('encryptedOutput').value = bytesToText(ciphertext.flat(Infinity));
            document.getElementById('encryptTime').innerHTML = `${(end-start).toFixed(2)} ms`;
            const dataEncrypted = bytesToBase64(ciphertext.flat(Infinity));
            downloadFile(dataEncrypted,'Encryption.txt');
        } else if (mode === "CBC") {
            const iv = document.getElementById('encrypt-iv').value;
            if(iv.length !== 16){
                alert(`Độ dài của iv phải là 16 kí tự.
Độ dài hiện tại: ${iv.length}`);
                return;
            }
            const start = performance.now();
            const ciphertext = aesEncryptCBC(fileContent,textToBytes(key),textToBytes(iv));
            const end = performance.now();
            document.getElementById('encryptedOutput').value = bytesToText(ciphertext.flat(Infinity).slice(17));
            document.getElementById('encryptTime').innerHTML = `${(end-start).toFixed(2)} ms`;
            const dataEncrypted = bytesToBase64(ciphertext.flat(Infinity));
            downloadFile(dataEncrypted,'Encryption.txt');
        }
    };

    reader.readAsText(file);
});

document.getElementById("decryptBtn").addEventListener('click', ()=>{
    const fileInput = document.getElementById("cipherFileInput");
    const mode = document.querySelector('#decryptMode').value;
    if (fileInput.files.length === 0) {
        alert("Vui lòng chọn một file để giải mã!");
        return;
    };
    const key = document.getElementById('decryptKey').value;
    if(![16,24,32].includes(key.length)){
        alert(`Độ dài key phải là 16,24 hoặc 32.
Độ dài hiện tại: ${key.length}`);
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const fileContent = event.target.result; // Nội dung file
        const cipherBytes = Array.from(base64ToBytes(fileContent));
    
        if (mode === "ECB") {
            let cipherState = [];
            for (let i = 0; i < cipherBytes.length; i += 16) {
                let block = cipherBytes.slice(i, i + 16);
                cipherState.push(toStateMatrix(block));
            }
            const start = performance.now();
            const decryptedText = aesDecryptText(cipherState,textToBytes(key));
            const end = performance.now();
            document.getElementById('decryptedOutput').value = decryptedText;
            document.getElementById('decryptTime').innerHTML = `${(end-start).toFixed(2)} ms`;
            downloadFile(decryptedText,'Decryption.txt');
        } else if (mode === "CBC") {
            let cipherState = [cipherBytes.slice(0,16)];
            for (let i = 16; i < cipherBytes.length; i += 16) {
                let block = cipherBytes.slice(i, i + 16);
                cipherState.push(toStateMatrix(block));
            }
            const start = performance.now();
            const decryptedText = aesDecryptCBC(cipherState,textToBytes(key));
            const end = performance.now();
            document.getElementById('decryptedOutput').value = decryptedText;
            document.getElementById('decryptTime').innerHTML = `${(end-start).toFixed(2)} ms`;
            downloadFile(decryptedText,'Decryption.txt');
        }
    };

    reader.readAsText(file);
});

document.getElementById('generateKey').addEventListener('click',()=>{
    const keySize = parseInt(document.querySelector('#encryptKeySize').value);
    const keyGenerated = generateAESKeyString(keySize);
    document.getElementById('encryptKey').value = keyGenerated;
});

document.getElementById('encryptMode').addEventListener('change', function(event) {
    const ivInput = document.getElementById('encrypt-iv');
    if (event.target.value === 'CBC') {
        ivInput.style.display = 'inline-block'; // Hiển thị ô IV
    } else {
        ivInput.style.display = 'none'; // Ẩn ô IV khi chọn ECB
    }
});
