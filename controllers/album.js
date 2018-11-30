'user strict'

var fs = require("fs");
var path = require("path");

var mongoosePaginate = require("mongoose-pagination");

var Artist = require("../models/artist");
var Album = require("../models/album");
var Song = require("../models/song");


function getAlbum(req, res) {
    
    var albumId = req.params.id;
    
    Album.findById(albumId).populate({path:'artist'}).exec((err, album) =>{
        if(err){
            res.status(500).send({message: "Error en la petición"})
        }else{
            if(!album){
                res.status(404).send({message: "No se encontro album"});
            }else{
                res.status(200).send({album: album});
            }
        }
    });

}


function getAlbums(req, res){
    var artistId = req.params.id;
    var find;
    //res.status(200).send({message: "Artista: "+ artistId});
    if(!artistId){
        //Salen todos los albumes
        
        find = Album.find({}).sort('title');
    }else{
        //Sacar album de un artista
        find = Album.find({artist:artistId}).sort('year');
    }

    
    find.populate({path: 'artist'}).exec((err, albums)=>{
        if(err){
            res.status(500).send({message: "Error en la consulta"});
        }else{
            if(!albums){
                res.status(404).send({message: "No existen albums"});
            }else{
                res.status(200).send({albums: albums});
            }
        }
    })
}

function saveAlbum(req, res){
    
    var album = new Album();
    
    var params = req.body;
    
    album.title = params.title;
    album.description = params.description;
    album.year = params.year;
    album.image = null;
    album.artist = params.artist;
    
    album.save((err, albumStored)=>{
        if(err){
            res.status(500).send({message:"Error en la peticion"});
        }else{
            if(!albumStored){
                res.status(404).send({message:"Error al guardar album"});
            }else{
                res.status(200).send({album: albumStored});
            }
        }
    });
}

function updateAlbum(req, res){
    var albumId = req.params.id;
    
    var update = req.body;
    
    Album.findByIdAndUpdate(albumId, update, (err, albumUpdated)=>{
        if(err){
            res.status(500).send({message: "Error"});
        }else{
            if(!albumUpdated){
                res.status(404).send({message: "Album no se ha actualizado"});
            }else{
                res.status(200).send({album:albumUpdated});
            }
        }
    });
}

function deleteAlbum(req, res){
    
    var albumId = req.params.id;
    
    Album.findByIdAndRemove(albumId, (err, albumRemove)=>{
        if(err){
            res.status(500).send({message: "Error al eliminar el album"})
        }else{
            if(!albumRemove){
                res.status(404).send({message: albumRemove});
            }else{
                Song.find({artist: albumRemove._id}).remove((err, songRemove)=>{
                    if(err){
                        res.status(500).send({message: "Error al eliminar el Song"})
                    }else{
                        if(!songRemove){
                            res.status(404).send({message: "Song no ha sido eliminado"})
                        }else{
                            res.status(200).send({album: albumRemove});
                        }
                    }
                })
            }
        }
    }); 
    
}


function uploadImage(req, res){
    
    
    var albumId = req.params.id;
    
    var file_name = "No subido...";
    
    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];
        //console.log(ext_split);
        
        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif'){
            
            Album.findByIdAndUpdate(albumId, {image: file_name}, (err, albumUpdated) => {
                if(!albumUpdated){
                    res.status(404).send({message: "No se ha podido actualizar la imagen del album"});
                }else{
                    res.status(200).send({album: albumUpdated});
                }
            });
            
        }else{
            res.status(200).send({message: "Extensión del archivo no valida"});
        }
    }else{
        res.status(200).send({message: "Imagen no se ha subido"});
    }
    
      
}


function getImageFile(req, res){
    
    var imageFile = req.params.imageFile;
    var path_file = "./upload/albums/"+ imageFile;
    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(200).send({message: "Imagen no existe"})
        }
    });
    
}

                            
module.exports = {
    getAlbum,
    saveAlbum,
    getAlbums,
    updateAlbum,
    deleteAlbum,
    uploadImage,
    getImageFile
}