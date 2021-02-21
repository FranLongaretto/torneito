'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const campeonatoSchema = Schema({
    campeonato: [{
        pos: String,
        escudo: String,
        nombre: String,
        jugados: String,
        ganados: String,
        perdidos: String,
        empatados: String,
        dif_gol: String,
        puntos: String
    }]
})


module.exports = mongoose.model('Campeonato', campeonatoSchema)

