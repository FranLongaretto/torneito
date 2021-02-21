'use strict'

const express = require('express')
const bodyparser = require('body-parser')
const cheerio = require('cheerio')
const request = require('request-promise')
const mongoose = require('mongoose')
const hbs = require('express-handlebars')
const path = require('path')
const Handlebars = require('handlebars');


const Campeonato = require('./models/campeonato')
const campeonato = require('./models/campeonato')
const { findOne } = require('./models/campeonato')

const app = express()
const port = process.env.PORT || 3000;

async function scrapdata() {
    console.log("  Scrapping data   ")
    const $ = await request({ 
        uri: 'https://defensorsporting.com.uy/tabla/tabla-anual/',
        transform: body => cheerio.load(body)
    });

    var a = $(this);
    var arrayteam = [];

    for(var i=0;i<16;i++){

        var team = {}
        var pos = $('.sp-row-no-'+i+' .data-rank').text();
        var escudo = $('.sp-row-no-'+i+' .team-logo Img').attr('src');
        var nombre = $('.sp-row-no-'+i+' .data-name').text();
        var jugados = $('.sp-row-no-'+i+' .data-p').text();
        var ganados = $('.sp-row-no-'+i+' .data-w').text();
        var empatados = $('.sp-row-no-'+i+' .data-d').text();
        var perdidos = $('.sp-row-no-'+i+' .data-l').text();
        var dif_gol = $('.sp-row-no-'+i+' .data-gd').text();
        var puntos = $('.sp-row-no-'+i+' .data-pts').text();

        team.pos=pos;
        team.escudo=escudo;
        team.nombre=nombre;
        team.jugados=jugados;
        team.ganados=ganados;
        team.empatados=empatados;
        team.perdidos=perdidos;
        team.dif_gol=dif_gol;
        team.puntos=puntos;
        
        arrayteam.push(team)        
    }

    var data = new Campeonato();
    data.campeonato = arrayteam    
    
    Campeonato.findOne((err, res) => {
    if (err) {
        console.log(err);
        return
    }
    res.updateOne({$set: {campeonato:arrayteam}}, (err, campeonatoupdate) => {
        if (err) {
            console.log(err) 
            return
        } 
        console.log('campeonato update')
        return 
        })
    })  
}

async function init() {
    setInterval(scrapdata, 	18000000);
}
init(); 

app.engine('.hbs', hbs({
    defaultLayout: 'default', extname: '.hbs'
}))

app.set('view engine', '.hbs')

app.get('/', (req, res) => {

    Campeonato.findOne().lean()
    .exec(function(err, arreglo) {
        if (err){
            console.log(err)
            return 
        } 
        if (!arreglo){
             console.log('sin campeonato')
             return 
        }
        var parametros = {}
        parametros.campeonato = arreglo.campeonato;
        res.render('index', {
            parametros:parametros
        })
    });
})

app.use(bodyparser.urlencoded({ extended: false })) 
app.use(bodyparser.json())

app.get('/anual', (req, res) => {})

const publicPath = path.resolve(__dirname, "public");

app.use(express.static('public'));

mongoose.connect('mongodb+srv://dbFran:franlonga@cluster1.mznfs.mongodb.net/mydb?retryWrites=true&w=majority', (err, res) => {
    if (err) throw err
    console.log('Conexion establecida con la db')

    app.listen(port, () => {
        console.log(`API REST corriendo en http://localhost:${port}`)
    })
})

Handlebars.registerHelper("getcolorbypos", function(pos) {
    var color = '';
    if (pos<5) { 
        color = "primeros"
    } else {
        if (pos>12) {
            color = "ultimos"
        }
    }    
    return color
  });
  Handlebars.registerHelper("getcolorbyindex", function(index) {
    var fondo = '';
    if ((index==0) || (index%2==0)) { 
        fondo = "fondocolor"
    }  
    return fondo
  });