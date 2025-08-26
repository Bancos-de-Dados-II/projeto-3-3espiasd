import mongoose from "mongoose";

const eventoSchema = new mongoose.Schema({
    nome:{
        type: String,
        required: true
    },
    descricao:{
        type: String,
    },
    data: {
        type: Date,
        default: Date.now,
    },
     local: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], 
            required: true
        }
    },
    participantes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Idoso", // referencia o model Idoso
    }]
    
});

// Indices de busca de texto
eventoSchema.index(
    {nome: 'text', descricao: 'text'},
    { default_language: 'portuguese',
        weights:{
            nome: 2,
            descricao: 1
        }
    }
);

// Indice geoespacial
eventoSchema.index({ local: '2dsphere'});

const Evento = mongoose.model('Evento', eventoSchema);
export default Evento;