const express = require("express");
const axios = require("axios");

const { createClient } = require("@supabase/supabase-js");
const autenticaLogin = require("./funcoes/autenticalLogin");
const login = require("./funcoes/login");
const { processarMunicipios } = require("./funcoes/gerar");

const app = express();
app.use(express.json());

app.get("/login", autenticaLogin, (req, res) => {
  res.json("ok");
});

app.post("/login", login);
app.get("/.retorno", processarMunicipios)



const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});