window.addEventListener("load", Ready);
function Ready(){
    if(window.File && window.FileReader){ //These are the relevant HTML5 objects that we are going to use
        // document.getElementById('UploadButton').addEventListener('click', StartUpload);
        document.getElementById('FileBox1').addEventListener('change', function(e){
            document.getElementById('NameBox1').value = e.target.files[0].name;
        });
        document.getElementById('FileBox2').addEventListener('change', function(e){
            document.getElementById('NameBox2').value = e.target.files[0].name;
        });
    }
    else
    {
        document.getElementById('UploadArea').innerHTML = "Your Browser Doesn't Support The File API Please Update Your Browser";
    }
}