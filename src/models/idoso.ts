import mongoose from "mongoose";

const idosoSchema = new mongoose.Schema({
    nome: {type: String, required: true},
    cpf: {type: String, required: true, unique: true},
    rg: {type: String, required: true, unique: true},
    sus: {type: String, required: true, unique: true},
    data_nascimento: {type: Date, required: true},
    sexo: {type: String, required: true},
    nacionalidade: {type: String, required: true},
    naturalidade: {type: String, required: true}
});

const Idoso = mongoose.model('Idoso', idosoSchema);
export default Idoso;