window.addEventListener("load", Ready);
function Ready(){
    var socket = io();
    if(!window.File && window.FileReader){ //HTML5 rocks!
        //TODO Validate employee file is csv1
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
