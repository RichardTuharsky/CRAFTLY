document.getElementById('createCollage').addEventListener('click', function() {

    let images = document.getElementById('imageUpload').files;
    let watermark = document.getElementById('watermarkUpload').files[0];
    let horizontalCount = parseInt(document.getElementById('horizontalCount').value);
    let verticalCount = parseInt(document.getElementById('verticalCount').value);
    
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');

    canvas.width = 2000;
    canvas.height = 2000;
    
    let promises = [];
    for (let i = 0; i < images.length; i++) {
        let img = new Image();
        img.src = URL.createObjectURL(images[i]);
        promises.push(new Promise(resolve => {
            img.onload = function() {
                resolve(img);
            };
        }));
    }

    let maxHeight = 2000;
    let maxWidth = 2000;

   // After creating the collage image (before displaying it)
    let collageImage = canvas.toDataURL('image/png');
    let collagePreview = document.getElementById('collagePreview');
    collagePreview.src = collageImage;

   

    // Create a new Image object for the collage image
    let img = new Image();
    img.src = collageImage;

    img.onload = function() {
        // Calculate new width and height while maintaining aspect ratio
        let newWidth, newHeight;
        if (img.width > img.height) {
            newWidth = maxWidth;
            newHeight = (img.height / img.width) * maxWidth;
        } else {
            newHeight = maxHeight;
            newWidth = (img.width / img.height) * maxHeight;
        }

        collagePreview.width = newWidth;
        collagePreview.height = newHeight;
    };



    Promise.all(promises).then(images => {
        canvas.width = images[0].width * horizontalCount; // Assuming all images have the same width
        canvas.height = images[0].height * verticalCount; // Assuming all images have the same height

        // Draw images onto the canvas
        for (let i = 0; i < verticalCount; i++) {
            for (let j = 0; j < horizontalCount; j++) {
                let index = i * horizontalCount + j;
                if (index < images.length) {
                    context.drawImage(images[index], j * images[0].width, i * images[0].height, images[0].width, images[0].height);

                }   
            }
        }
        

        let watermarkCanvas = document.createElement('canvas');
        let watermarkContext = watermarkCanvas.getContext('2d');
        watermarkCanvas.width = canvas.width;
        watermarkCanvas.height = canvas.height;
        
        // Draw watermark pattern onto watermark canvas
        let watermarkImg = new Image();
        watermarkImg.src = URL.createObjectURL(watermark);
        watermarkImg.onload = function() {
            let watermarkWidth = watermarkImg.width;
            let watermarkHeight = watermarkImg.height;
        
            for (let i = 0; i < watermarkCanvas.height; i += watermarkHeight) {
                for (let j = 0; j < watermarkCanvas.width; j += watermarkWidth) {
                    watermarkContext.globalAlpha = 0.3;
                    watermarkContext.drawImage(watermarkImg, j, i, watermarkWidth, watermarkHeight);
                }
            }
        
            // Draw watermark canvas onto main canvas
            context.drawImage(watermarkCanvas, 0, 0);
        
            // ... rest of your code

            // Convert canvas to blob
            canvas.toBlob(function(pngBlob) {
                // Convert canvas to JPG blob
                canvas.toBlob(function(jpgBlob) {
                    // Create a new JSZip instance
                    var zip = new JSZip();
        
                    // Add PNG collage image blob to the zip file
                    zip.file("collage.png", pngBlob, { base64: true });
        
                    // Add JPG collage image blob to the zip file
                    zip.file("collage.jpg", jpgBlob, { base64: true });
        
                    // Generate the zip file asynchronously and trigger download
                    zip.generateAsync({ type: "blob" }).then(function(content) {
                        saveAs(content, "collage.zip");
                    });
        
                    // Display the collage on the page (optional)
                    let collageResultDiv = document.getElementById('collageResult');
                    collageResultDiv.innerHTML = `<img src="${canvas.toDataURL('image/png')}" alt="Collage">`;
                }, 'image/jpeg');
            }, 'image/png');
        };
    });

});