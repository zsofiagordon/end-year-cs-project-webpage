

function doOnLoad() {
    function preventDefaults (e) {
        e.preventDefault()
        e.stopPropagation()
    }
    
    function highlight(e) {
        dropArea.classList.add('highlight');
    }
    function unhighlight(e) {
        dropArea.classList.remove('highlight');
    }
    
    function handleDrop(e) {
        let dt = e.dataTransfer;
        let files = dt.files;
      
        console.log(files);
    }

    let dropArea = document.getElementById('drop-area');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    dropArea.addEventListener('drop', handleDrop, false);
}