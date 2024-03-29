document.addEventListener('DOMContentLoaded', function () {
    var dropArea = document.getElementById('dropArea');
    var imagePreview = document.getElementById('imagePreview');

    // Style the drop area on dragover
    dropArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropArea.style.borderColor = 'green';
    });

    // Revert drop area style on dragleave
    dropArea.addEventListener('dragleave', function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropArea.style.borderColor = '#ccc';
    });

    // Handle dropped files
    dropArea.addEventListener('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropArea.style.borderColor = '#ccc';

        var files = e.dataTransfer.files;
        handleFiles(files);
    });

    document.getElementById('imageUpload').addEventListener('change', function(e) {
        var files = e.target.files;
        handleFiles(files);
    });

    // Process and display dropped files
    function handleFiles(files) {
        for (let i = 0; i < files.length; i++) {
            if (files[i].type.startsWith('image/')) {
                var img = document.createElement('img'); // Changed from new Image() to document.createElement('img')
                img.src = URL.createObjectURL(files[i]);
                img.onload = function () {
                    URL.revokeObjectURL(this.src);
                };
                img.style.maxWidth = '100px'; // Ensure images are visible within the container
                img.style.height = '100px'; // Maintain aspect ratio
                imagePreview.appendChild(img);
            }
        }
    }
});


// Manage drag-and-drop events
const uploadedImagesDiv = document.getElementById('uploadedImages');
const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadedImagesDiv.innerHTML = 'Dragged Over:';
};

const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    uploadedImagesDiv.innerHTML = ''; // Clear previous content
    if (files.length > 0) {
        Array.from(files).forEach((file) => {
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.onload = function () {
                    URL.revokeObjectURL(this.src); // Free up memory
                };
                img.style.maxWidth = '200px'; // Set max width for display
                img.style.maxHeight = '200px'; // Set max height for display
                uploadedImagesDiv.appendChild(img);
            }
        });
    }
};

// Add event listeners for drag-and-drop functionality
let dropZone = document.getElementById('dropZone');
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('drop', handleDrop);

// Trigger file input when clicking on the drop zone
dropZone.addEventListener('click', function() {
    document.getElementById('imageUpload').click();
});





// Event listener for the 'Create Collage' button
document.getElementById('createCollage').addEventListener('click', function() {
    // console.log(document.getElementById('overlay')); // This should not be null

    // document.getElementById('overlay ').style.display = 'flex';

    // Retrieve files, counts, and create canvas elements
    let images = document.getElementById('imageUpload').files;
    let watermark = document.getElementById('watermarkUpload').files[0];
    let horizontalCount = parseInt(document.getElementById('horizontalCount').value);
    let verticalCount = parseInt(document.getElementById('verticalCount').value);
    
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');

    // Set canvas dimensions
    canvas.width = 2000;
    canvas.height = 2000;
    
    // Array to store promises for image loading
    let promises = [];

    // Check if at least one image is selected
  
    // Load images and create promises to track loading
    for (let i = 0; i < images.length; i++) {
        let img = new Image();
        img.src = URL.createObjectURL(images[i]);
        promises.push(new Promise((resolve, reject) => {
            img.onload = function() {
                resolve(img);
            };
            images.onerror = reject;
        }));
    }

    // Maximum dimensions for the collage preview
    let maxHeight = 2000;
    let maxWidth = 2000;

    // Initially hide the collage preview
    let collagePreview = document.getElementById('collagePreview');
    collagePreview.style.display = 'none';

    // Create a new Image object for the collage
    let img = new Image();
    img.src = canvas.toDataURL('image/png');

    // Adjust the size of the collage preview based on aspect ratio
    img.onload = function() {
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
    
    // Process all loaded images and create the collage
    Promise.all(promises).then(images => {
        console.log(images);
        if (images.length > 0 && images[0].width) {
            // Calculate total width and height for all images
            let totalWidth = images[0].width * horizontalCount;
            let totalHeight = images[0].height * verticalCount;

            // Calculate the aspect ratio
            let aspectRatio = totalWidth / totalHeight;

            // Determine the new dimensions based on the maximum allowed size
            if (totalWidth > totalHeight) {
                canvas.width = Math.min(2000, totalWidth);
                canvas.height = Math.min(2000, canvas.width / aspectRatio);
            } else {
                canvas.height = Math.min(2000, totalHeight);
                canvas.width = Math.min(2000, canvas.height * aspectRatio);
            }
        } else {
            console.error('No images or invalid image width');
        }
        
        // Draw images onto the canvas
        let scaleWidth = canvas.width / (images[0].width * horizontalCount);
        let scaleHeight = canvas.height / (images[0].height * verticalCount);

        // Draw images onto the canvas with adjusted scale
        for (let i = 0; i < verticalCount; i++) {
            for (let j = 0; j < horizontalCount; j++) {
                let index = i * horizontalCount + j;
                if (index < images.length) {
                    let scaledWidth = images[index].width * scaleWidth;
                    let scaledHeight = images[index].height * scaleHeight;
                    context.drawImage(images[index], j * scaledWidth, i * scaledHeight, scaledWidth, scaledHeight);
                }   
            }
        }
        
        // Create watermark canvas and draw watermark pattern
        let watermarkCanvas = document.createElement('canvas');
        let watermarkContext = watermarkCanvas.getContext('2d');
        watermarkCanvas.width = canvas.width;
        watermarkCanvas.height = canvas.height;
        
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
        
            // Convert canvas to blobs and create a zip file for download
            canvas.toBlob(function(pngBlob) {
                canvas.toBlob(function(jpgBlob) {
                    var zip = new JSZip();
                    zip.file("collage.png", pngBlob, { base64: true });
                    zip.file("collage.jpg", jpgBlob, { base64: true });
                    zip.generateAsync({ type: "blob" }).then(function(content) {
                        saveAs(content, "collage.zip");
                    });

                    // Display the collage on the page
                    let collageResultDiv = document.getElementById('collageResult');
                    collageResultDiv.style.display = 'block'; // Show the collage result div
                    collageResultDiv.innerHTML = `<img src="${canvas.toDataURL('image/png')}" alt="Collage">`;
                }, 'image/jpeg');
            }, 'image/png');
        };

    });
});


// Setup for drag-and-drop functionality
