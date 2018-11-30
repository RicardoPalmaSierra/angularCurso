'user strict'

var fs = require("fs");
var path = require("path");

var mongoosePaginate = require("mongoose-pagination");

var Artist = require("../models/artist");
var Album = require("../models/album");
var Song = require("../models/song");


function getSong(req, res){
    
    var SongId = req.params.id;
    
    Song.findById(SongId).populate({path: 'album'}).exec((err, songStored) =>{
       if(err) {
           res.status(500).send({message: "Error en la peticion"});
       }else{
           if(!songStored){
               res.status(404).send({message: "No existe cancion"});
           }else{
               res.status(200).send({song: songStored});
           }
       }
    });
    
};

function getSongs(req, res){
    
    var albumId = req.params.album;
    
    if(!albumId){
        var find = Song.find({}).sort('number');
    }else{
        var find = Song.find({album: albumId}).sort('number');
    }
    
    find.populate({
        path: 'album',
        populate:{
            path: 'artist',
            model: 'Artist'
        }
    }).exec(function(err, songs){
        if(err){
            res.status(500).send({message: "Error en el servidor"});
        }else{
            if(!songs){
                res.status(404).send({message:"No existen canciones"});
            }else{
                res.status(200).send({songs: songs});
            }
        }
    })
}

function saveSong(req, res){
    var song = new Song();
    
    var params = req.body;
    
    song.number = params.number;
    song.name = params.name;
    song.duration = params.duration;
    song.file = null;
    song.album = params.album;
    
    song.save((err, songStored) =>{
       if(err) {
           res.status(500).send({message: "Error al guardar"});
       }else{
           if(!songStored){
               res.status(404).send({message: "Error al guardar"});
           }else{
               res.status(200).send({song: songStored});
           }
       }
    });
    
    
}

function updateSong(req, res){
    
    var songId = req.params.id;
    var update = req.body;
    
    Song.findByIdAndUpdate(songId, update, (err, songUpdated)=>{
        if(err){
            res.status(500).send({message: "Error server"})
        }else{
            if(!songUpdated){
                res.status(404).send({message: "no se acutlizo porque no existe"});
            }else{
                res.status(200).send({song: songUpdated});
            }
        }
    });
}

function deleteSong(req, res){
    
    var SongId = req.params.id;
    
    Song.findByIdAndRemove(SongId, (err, songRemove) =>{
        if(err){
            res.status(500).send({message: "Error"});
        }else{
            if(!songRemove){
                res.status(404).send({message: "No existe Song"});
            }else{
                res.status(200).send({song: songRemove});
            }
        }
    });
    
}


function uploadFile(req, res){
    
    
    var songID = req.params.id;
    
    var file_name = "No subido...";
    
    if(req.files){
        var file_path = req.files.file.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];
        //console.log(ext_split);
        
        if(file_ext == 'mp3'){
            
            Song.findByIdAndUpdate(songID, {file: file_name}, (err, songUpdated) => {
                if(!songUpdated){
                    res.status(404).send({message: "No se ha podido actualizar la canción"});
                }else{
                    res.status(200).send({song: songUpdated});
                }
            });
            
        }else{
            res.status(200).send({message: "Extensión del archivo no valida"});
        }
    }else{
        res.status(200).send({message: "Fichero no se ha subido"});
    }
    
      
}


function getSongFile(req, res){
    
    var imageFile = req.params.songFile;
    var path_file = "./upload/songs/"+ imageFile;
    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(200).send({message: "Imagen no el fichero"})
        }
    });
    
}


module.exports = {
    getSong,
    saveSong,
    getSongs,
    updateSong,
    deleteSong,
    uploadFile,
    getSongFile
}