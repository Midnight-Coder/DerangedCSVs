window.addEventListener("load", Ready);
function Ready(){
    var socket = io();
    if(window.File && window.FileReader){ //HTML5 rocks!
        /*TODO
         *Allow only csv
         *Validate employee file is csv1
        */
        document.getElementById('FileBox1').addEventListener('change', function(e){
            document.getElementById('NameBox1').value = e.target.files[0].name;
        });
        document.getElementById('FileBox2').addEventListener('change', function(e){
            document.getElementById('NameBox2').value = e.target.files[0].name;
        });
    }
    else{
        document.getElementById('UploadArea').innerHTML = "Your Browser Doesn't Support The File API Please Update Your Browser";
    }
    socket.on('uploadProgress', function(msg){
        console.log(msg);
        dumper(msg);
    });
    socket.on('error', function(err){
        console.err(err);
    });
    socket.on('dump', dumper);
}
function dumper(data){
    var dump = document.getElementById('dumper');
    dump.innerHTML = dump.innerHTML + "<br/>" + data;
}