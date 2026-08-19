document.addEventListener("DOMContentLoaded", function() {
    const fileInput = document.getElementById('fileInput');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const tupperNumberElement = document.getElementById('tupperNumber');
    const convertedImageElement = document.getElementById('convertedImage');

    fileInput.addEventListener('change', handleFile);

    function handleFile(event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Set canvas size based on the uploaded image
                canvas.width = img.width;
                canvas.height = img.height;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const binaryMatrix = imageDataToBinaryMatrix(imageData);
                const tupperNumber = calculateTupperNumber(binaryMatrix);
                tupperNumberElement.textContent = `Tupper's number: ${tupperNumber}`;
                displayConvertedImage(binaryMatrix);
            }
            img.src = e.target.result;
        }

        reader.readAsDataURL(file);
    }

    function imageDataToBinaryMatrix(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        const binaryMatrix = Array.from({ length: height }, () => Array(width).fill(0));

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const oldPixel = (data[index] + data[index + 1] + data[index + 2]) / 3;
                const newPixel = oldPixel < 128 ? 0 : 255;
                const error = oldPixel - newPixel;

                binaryMatrix[y][x] = newPixel === 0 ? 1 : 0;

                data[index] = data[index + 1] = data[index + 2] = newPixel;

                if (x + 1 < width) {
                    data[(y * width + x + 1) * 4] += error * 7 / 16;
                    data[(y * width + x + 1) * 4 + 1] += error * 7 / 16;
                    data[(y * width + x + 1) * 4 + 2] += error * 7 / 16;
                }
                if (y + 1 < height) {
                    if (x > 0) {
                        data[((y + 1) * width + x - 1) * 4] += error * 3 / 16;
                        data[((y + 1) * width + x - 1) * 4 + 1] += error * 3 / 16;
                        data[((y + 1) * width + x - 1) * 4 + 2] += error * 3 / 16;
                    }
                    data[((y + 1) * width + x) * 4] += error * 5 / 16;
                    data[((y + 1) * width + x) * 4 + 1] += error * 5 / 16;
                    data[((y + 1) * width + x) * 4 + 2] += error * 5 / 16;
                    if (x + 1 < width) {
                        data[((y + 1) * width + x + 1) * 4] += error * 1 / 16;
                        data[((y + 1) * width + x + 1) * 4 + 1] += error * 1 / 16;
                        data[((y + 1) * width + x + 1) * 4 + 2] += error * 1 / 16;
                    }
                }
            }
        }
        return binaryMatrix;
    }

    function calculateTupperNumber(image) {
        let binaryString = '';
        for (let col = 0; col < image[0].length; col++) {
            for (let row = image.length - 1; row >= 0; row--) {
                binaryString += image[row][col];
            }
        }
        return BigInt('0b' + binaryString);
    }

    function displayConvertedImage(binaryMatrix) {
        const convertedCanvas = document.createElement('canvas');
        convertedCanvas.width = binaryMatrix[0].length;
        convertedCanvas.height = binaryMatrix.length;
        const convertedCtx = convertedCanvas.getContext('2d');

        for (let y = 0; y < binaryMatrix.length; y++) {
            for (let x = 0; x < binaryMatrix[0].length; x++) {
                convertedCtx.fillStyle = binaryMatrix[y][x] === 1 ? 'black' : 'white';
                convertedCtx.fillRect(x, y, 1, 1);
            }
        }

        // Clear previous image and append the new one
        convertedImageElement.innerHTML = '';
        convertedImageElement.appendChild(convertedCanvas);
    }
});
