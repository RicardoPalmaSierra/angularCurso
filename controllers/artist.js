'user strict'

var fs = require("fs");
var path = require("path");

var mongoosePaginate = require("mongoose-pagination");

var Artist = require("../models/artist");
var Album = require("../models/album");
var Song = require("../models/song");


function getArtists(req, res) {
    if(req.params.page){
        var page = req.params.page;    
    }else{
        var page = 1;
    }
    
    var itemsPerPage = 4;
    
    Artist.find().sort("name").paginate(page, itemsPerPage, function(err, artists, total){
        if(err){
            res.status(500).send({message: "Error en la petición"});
        }else{
            if(!artists){
                res.status(404).send({message: "No hay artistas"})
            }else{
                return res.status(200).send({
                    pages: total,
                    artists: artists
                });
            }
        }
    })
}

function updateArtist(req, res){
    var artistId = req.params.id;
    var update = req.body;
    
    
    Artist.findByIdAndUpdate(artistId, update, (err, artistUpdated)=>{
        if(err){
            res.status(500).send({message: "Error al guardar Artista"})
        }else{
            if(!artistUpdated){
                res.status(404).send({message: "El artista no ha sido actualizado"});
            }else{
                res.status(200).send({artist: artistUpdated});
            }
        }
    })
}


function getArtist(req, res){
    
    var artistId = req.params.id;
    
    Artist.findById(artistId, (err, artist) => {
        if(err){
            res.status(500).send({message: "Error en la petición"});       
        }else{
            if(!artist){
                res.status(404).send({message: "Artisata no existe"});
            }else{
                res.status(200).send({artist});
            }
        }
    });
    
}

function saveArtist(req, res){
    
    var artist = new Artist();
    
    var params = req.body;
    
    artist.name = params.name;
    artist.description = params.description;
    artist.image = null;
    
    artist.save((err, artistStored) => {
        if(err){
            res.status(500).send({message: "Error al guardar Artista"});
        }else{
            if(!artistStored){
                res.status(404).send({message: "Artista no guardado"});
            }else{
                res.status(200).send({artist: artistStored});
            }
        }
    });
}


function deleteArtist(req, res){
    
    var artistId = req.params.id;
    
    //console.log(artistId);
    
    Artist.findByIdAndRemove(artistId, (err, artistRemove) => {
        if(err){
            res.status(500).send({message: "Error al eliminar artista"});
        }else{
            if(!artistRemove){
                res.status(404).send({message: "Error No ha sido eliminado"});
            }else{
                //res.status(200).send({artist: artistRemove});
                
                Album.find({artist: artistRemove._id}).remove((err, albumRemove)=>{
                    if(err){
                        res.status(500).send({message: "Error al eliminar el album"})
                    }else{
                        if(!albumRemove){
                            res.status(404).send({message: "Album no ha sido eliminado"})
                        }else{
                            Song.find({artist: albumRemove._id}).remove((err, songRemove)=>{
                                if(err){
                                    res.status(500).send({message: "Error al eliminar el Song"})
                                }else{
                                    if(!songRemove){
                                        res.status(404).send({message: "Song no ha sido eliminado"})
                                    }else{
                                        res.status(200).send({artist: artistRemove});
                                    }
                                }
                            })
                        }
                    }
                })
            }
        }
    });
}


function uploadImage(req, res){
    
    var artistId = req.params.id;
    
    var file_name = "No subido...";
    
    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];
        //console.log(ext_split);
        
        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif' || file_ext == 'jpeg'){
            
            Artist.findByIdAndUpdate(artistId, {image: file_name}, (err, artistUpdated) => {
                if(!artistUpdated){
                    res.status(404).send({message: "No se ha podido actualizar el usuario"});
                }else{
                    res.status(200).send({artist: artistUpdated});
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
    var path_file = "./upload/artists/"+ imageFile;
    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(200).send({message: "Imagen no existe"})
        }
    });
    
}


module.exports = {
    getArtists,
    getArtist,
    saveArtist,
    updateArtist,
    deleteArtist,
    uploadImage,
    getImageFile
}