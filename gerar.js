const fs = require("fs");
const path = require("path");
const axios = require("axios");
const csv = require("csv-parser");


const filePath = path.join(process.cwd(), "input.csv");
const outputPath = path.join(process.cwd(), "resultado.csv");

const formatado = async (req, res) => {
 async function main() {
  try {
    const token = await connect(
      "patriciaporto0709@gmail.com",
      "Tama4480@",
      "Patrícia Porto"
    );

    console.log("Login realizado");

    await filterCities();
  } catch (error) {
    console.log("Erro:", error.response?.data || error.message);
  }
}

function readCSV() {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv({ separator: ";" }))
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

async function getData(url) {
  const response = await axios.get(url);
  return response.data;
}

async function filterCities() {
  const registros = await readCSV();

  const cidadesMap = {};
    registros.forEach((r) => {
    cidadesMap[formatado(r.municipio)] = r.populacao;
  });

  const url = "https://servicodados.ibge.gov.br/api/v1/localidades/estados/%7BUF%7D/mesorregioes";
  const data = await getData(url);

  const resultado = [];

  data.forEach((item) => {

    const nomeApi = formatado(item.nome);

    if (cidadesMap[nomeApi]) {
      resultado.push({
        municipio: item.nome,
        populacao: cidadesMap[nomeApi],
        id_ibge: item.id
      });
    }
  });

  console.log("\nResultado cruzado:\n");
  resultado.forEach((r) => console.log(r));
}

async function connect(email, password, name) {
  const url = "https://mynxlubykylncinttggu.supabase.co/auth/v1/token?grant_type=password";

  const response = await axios.post(
    url,
    {
      email,
      password,
      data: { nome: name }
    },
    {
    headers: {
     "Content-Type": "application/json",
     "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15bnhsdWJ5a3lsbmNpbnR0Z2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxODg2NzAsImV4cCI6MjA4MDc2NDY3MH0.Z-zqiD6_tjnF2WLU167z7jT5NzZaG72dWH0dpQW1N-Y"
    }
  },
  );

  return response.data;
}

async function getMunicipiosIBGE() {
  const response = await axios.get(
    "https://servicodados.ibge.gov.br/api/v1/localidades/municipios"
  );
  return response.data;
}

function generateCSV(data) {
  const header =
    "municipio_input,populacao_input,municipio_ibge,uf,regiao,id_ibge,status\n";

  const rows = data
    .map((r) =>
      [
        r.municipio_input,
        r.populacao_input,
        r.municipio_ibge,
        r.uf,
        r.regiao,
        r.id_ibge,
        r.status
      ].join(",")
    )
    .join("\n");

  fs.writeFileSync(outputPath, header + rows);
}

function calcularEstatisticas(resultado) {
  const stats = {
    total_municipios: resultado.length,
    total_ok: 0,
    total_nao_encontrado: 0,
    total_erro_api: 0,
    pop_total_ok: 0,
    medias_por_regiao: {}
  };

  const somaRegiao = {};
  const countRegiao = {};

  resultado.forEach((r) => {
    const pop = Number(r.populacao_input) || 0;

    if (r.status === "OK") {
      stats.total_ok++;
      stats.pop_total_ok += pop;

      if (!somaRegiao[r.regiao]) {
        somaRegiao[r.regiao] = 0;
        countRegiao[r.regiao] = 0;
      }

      somaRegiao[r.regiao] += pop;
      countRegiao[r.regiao]++;
    }

    if (r.status === "NAO_ENCONTRADO") stats.total_nao_encontrado++;
    if (r.status === "ERRO_API") stats.total_erro_api++;
  });

  Object.keys(somaRegiao).forEach((regiao) => {
    stats.medias_por_regiao[regiao] =
      somaRegiao[regiao] / countRegiao[regiao];
  });

  return stats;
}

async function main() {
  try {
    const input = await readCSV();
    const ibge = await getMunicipiosIBGE();

    const ibgeMap = {};

    ibge.forEach((m) => {
      const key = formatado(m.nome);
      if (!ibgeMap[key]) ibgeMap[key] = [];
      ibgeMap[key].push(m);
    });

    const resultado = input.map((item) => {
      const nomeOriginal = item.municipio;
      const populacao = item.populacao;
      const nomeNormalizado = formatado(nomeOriginal);

      const matches = ibgeMap[nomeNormalizado];

      if (!matches) {
        return {
          municipio_input: nomeOriginal,
          populacao_input: populacao,
          municipio_ibge: "",
          uf: "",
          regiao: "",
          id_ibge: "",
          status: "NAO_ENCONTRADO"
        };
      }

      if (matches.length > 1) {
        return {
          municipio_input: nomeOriginal,
          populacao_input: populacao,
          municipio_ibge: "",
          uf: "",
          regiao: "",
          id_ibge: "",
          status: "AMBIGUO"
        };
      }

      const m = matches[0];

      return {
        municipio_input: nomeOriginal,
        populacao_input: populacao,
        municipio_ibge: m.nome,
        uf: m.microrregiao.mesorregiao.UF.sigla,
        regiao: m.microrregiao.mesorregiao.UF.regiao.nome,
        id_ibge: m.id,
        status: "OK"
      };
    });

    generateCSV(resultado);

    const stats = calcularEstatisticas(resultado);

    console.log("\nEstatísticas:\n");
    console.log(stats);

  } catch (error) {
    console.log("Erro geral:", error.message);
  }    
}
}


