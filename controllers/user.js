'use strict'

var fs = require("fs");
var path = require("path");

var bcrypt = require("bcrypt-nodejs");
var User = require("../models/user");
var jwt = require("../services/jwt");

function pruebas(req, res){
    res.status(200).send({
       message: "Probando una accion del controlador de Usuarios del Api Rest con node y mongo"
    });
}

/* 

Function para guardar usuario
** Recibe parametros para el registro de un usuario    

*/
function saveUser(req, res){
    var user = new User();
    
    var params = req.body;
    
    console.log(params);
    
    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email;
    user.role = 'ROLE_USER';
    user.image = 'null';
    if(params.password){
        //Encriptacion de contraseña
        bcrypt.hash(params.password, null, null, function(err, hash){
            user.password = hash;
            if(user.name != null && user.surname != null && user.email != null){
                //Guardar USuario
                user.save((err, userStored)=>{
                    if(err){
                       res.status(200).send({message: "Error al guardar usuario"});
                    }else{ 
                        if(!userStored){
                            res.status(404).send({message: "No se ha registrado"});
                        }else{
                            res.status(200).send({user: userStored});
                        }
                    }
                    
                });
            }else{
                res.status(200).send({message: "Introduce los campos"});
            }
        });
    }else{
        res.status(200).send({message: "Introduce la contraseña"});
    }
}


/* 
    Función para logueo de usuario
*/
function loginUser(req, res){
    
    var params = req.body;
    
    var email = params.email;
    var password = params.password;
    
    User.findOne({email: email.toLowerCase()}, (err, user) => {
        if(err){
            res.status(500).send({message:"Error en la petición"});
        }else{
            if(!user){
                res.status(404).send({message: "Usuario no existe"});
            }else{
                bcrypt.compare(password, user.password, function (err, check){
                    if(check){
                        // deolver datos del usuario logueado
                        if(params.gethash){
                            // devolver token JWT
                            res.status(200).send({
                                token: jwt.createToken(user)
                            });
                        }else{
                            res.status(200).send({user});
                        }
                    }else{
                        res.status(404).send({message: "Contraseña incorrecta"});   
                    }
                });
            }
                
        }
    });
}
/*
 * Actualiza el usuario
 */

function updateUser(req, res){
    
    var userId = req.params.id;
    var update = req.body;
    
    if(userId != req.user.sub){
       return res.status(500).send({message: "No tienes permiso para actualizar este Usuario"});
    }
    
    User.findByIdAndUpdate(userId, update, (err, userUpdated) => {
        if(err){
            res.status(500).send({message: "Error al actualizar el usuario"});
        }else{
            if(!userUpdated){
                res.status(404).send({message: "No se ha podido actualizar el usuario"});
            }else{
                res.status(200).send({user: userUpdated});
            }
        }
    });
    
}

/*
 * Subir imagen de usuario
 */

function uploadImage(req, res){
    
    var userId = req.params.id
    var filename = "No subido";
    
    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];
        //console.log(ext_split);
        
        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif'){
            
            User.findByIdAndUpdate(userId, {image: file_name}, (err, userUpdated) => {
                if(!userUpdated){
                    res.status(404).send({message: "No se ha podido actualizar el usuario"});
                }else{
                    res.status(200).send({image: file_name, user: userUpdated});
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
    var path_file = "./upload/users/"+ imageFile;
    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(200).send({message: "Imagen no existe"})
        }
    });
    
}






module.exports = {
    pruebas,
    saveUser,
    loginUser,
    updateUser,
    uploadImage,
    getImageFile
};