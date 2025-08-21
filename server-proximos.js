import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
const PORT = process.env.PORT || 8080;

// TheSportsDB não precisa de token para rotas básicas (usa chave demo)
const TSD_BASE = "https://www.thesportsdb.com/api/v1/json/3";

async function getTeamId(team) {
  const r = await fetch(`${TSD_BASE}/searchteams.php?t=${encodeURIComponent(team)}`);
  const j = await r.json();
  const t = j?.teams?.[0];
  return t?.idTeam || null;
}

function toBrDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

app.get("/api/next", async (req, res) => {
  try {
    const team = req.query.team || "Cruzeiro";
    const id = await getTeamId(team);
    if (!id) return res.json({ event: null });

    const r = await fetch(`${TSD_BASE}/eventsnext.php?id=${id}`);
    const j = await r.json();
    const ev = j?.events?.[0];
    if (!ev) return res.json({ event: null });

    // strTimestamp já vem em UTC; se não houver, monta com dateEvent/strTime
    const ts = ev.strTimestamp ? ev.strTimestamp.replace(" ", "T") + (ev.strTimestamp.endsWith("Z") ? "" : "Z")
              : (ev.dateEvent && ev.strTime ? `${ev.dateEvent}T${ev.strTime}Z` : null);

    res.json({
      event: {
        homeTeam: ev.strHomeTeam,
        awayTeam: ev.strAwayTeam,
        whenUtc: ts,
        whenBr: ts ? toBrDate(ts) : null,
        league: ev.strLeague,
        venue: ev.strVenue
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao obter próximo jogo" });
  }
});

app.get("/", (req, res) => res.send("Proximos-server OK"));

app.listen(PORT, () => console.log("📅 Proximos-server na porta " + PORT));
