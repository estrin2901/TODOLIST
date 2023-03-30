//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Michelle:2540Trev.@cluster0.ohd3ih7.mongodb.net/todolistDB2");

const puntoSchema = {
  name: String
};

const Punto = mongoose.model("Punto", puntoSchema);

const listaSchema = {
  name: String,
  items: [puntoSchema]
};

const Lista = mongoose.model("Lista", listaSchema);



const punto1 = new Punto({
  name: "Bienvenido a tu lista de tareas!"
});

const punto2 = new Punto({
  name: "Presiona + para agregar una nueva tarea"
});

const punto3 = new Punto({
  name: "<-- Apreta este para borrar una tarea"
});

const puntosPrincipales = [punto1, punto2, punto3];

//Punto.insertMany(puntosPrincipales)


app.get("/", function(req, res) {

Punto.find()
  .then (puntos => {
    res.render("list", {listTitle: "Hoy", newListItems: puntos});
  })
    .catch(err => {
      console.log(err);
    });
    //Cierre GET
});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const nombreDeLista = req.body.list;

  const nuevoPunto = new Punto({
    name: item
  });

  if (nombreDeLista === "Hoy"){
  nuevoPunto.save();
  res.redirect("/");
  } else {
      Lista.findOne({name: nombreDeLista})
      .then((result)=>{
        result.items.push(nuevoPunto);
        result.save();
        res.redirect("/" + result.name);
      })
  }
});

//Borrar elemento según la lista

app.post("/delete", async(req,res)=>{

    const checkItemId = req.body.checkbox;
    const nombreDeListado = req.body.listName;


    if(nombreDeListado === "Hoy") {

      await Punto.findByIdAndRemove(checkItemId);

      res.redirect("/");

    } else {

        Lista.findOneAndUpdate({name: nombreDeListado}, {$pull: {items: {_id: checkItemId}}})
        .then(result=>{
        res.redirect("/" + nombreDeListado);
        })
        .catch(err => {
          res.send("Ha ocurrido un error");
        })
      }


});



app.get("/:postName", function(req,res){

  const ListaNueva = _capitalize(req.params.postName);

  Lista.findOne({name: ListaNueva})
  .then(function(result){
    if (result === null){

      const lista = new Lista({
        name: ListaNueva,
        items: puntosPrincipales
      });

      lista.save();
      res.redirect("/"+ ListaNueva)

    } else{
      res.render ("list", {listTitle: result.name, newListItems: result.items});
    }
  })
  .catch(function (e){
    console.log(e);
  })

});




app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
