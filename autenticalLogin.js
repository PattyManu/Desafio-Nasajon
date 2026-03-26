const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://mynxlubykylncinttggu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15bnhsdWJ5a3lsbmNpbnR0Z2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxODg2NzAsImV4cCI6MjA4MDc2NDY3MH0.Z-zqiD6_tjnF2WLU167z7jT5NzZaG72dWH0dpQW1N-Y"
);
const autenticaLogin = async (req, res, next) => {
  try {
    const { authorization } = req.headers;


    if (!authorization) {
      return res.status(401).json({ erro: "Token não informado" });
    }


    const token = authorization.replace("Bearer", "eyJhbGciOiJIUzI1NiIsImtpZCI6ImR0TG03UVh1SkZPVDJwZEciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL215bnhsdWJ5a3lsbmNpbnR0Z2d1LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI3NWNlYWY3Mi04MWYxLTQzMTEtOGU2Mi1jMTFkYTJlZjU2ZWIiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzc0NDc5OTE2LCJpYXQiOjE3NzQ0NzYzMTYsImVtYWlsIjoicGF0cmljaWFwb3J0bzA3MDlAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6InBhdHJpY2lhcG9ydG8wNzA5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6Ijc1Y2VhZjcyLTgxZjEtNDMxMS04ZTYyLWMxMWRhMmVmNTZlYiJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzc0NDc2MzE2fV0sInNlc3Npb25faWQiOiI3MjUwNzJiNy03YTY0LTQ5YjQtOTU1Yy1mNzhjNDdiYjQ3NGUiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.1Pv7_y2CZIJHZu2WGXx-aaxREuy9-Q3xrCxN_MlGQqM").trim();

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ erro: "Token inválido" });
    }

  
    req.usuario = data.user;

    next();
  } catch (err) {
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
};

module.exports = autenticaLogin;