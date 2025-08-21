import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
const PORT = process.env.PORT || 8080;

const TSD_BASE = "https://www.thesportsdb.com/api/v1/json/3";
// ID fixo do Cruzeiro Esporte Clube (Brasil)
const CRUZEIRO_ID = "134116";

function toBrDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
}

app.get("/api/next", async (req, res) => {
  try {
    const team = req.query.team || "Cruzeiro";
    let id = CRUZEIRO_ID;

    // Só busca ID se não for Cruzeiro
    if (team.toLowerCase() !== "cruzeiro") {
      const r = await fetch(`${TSD_BASE}/searchteams.php?t=${encodeURIComponent(team)}`);
      const j = await r.json();
      id = j?.teams?.[0]?.idTeam || null;
    }

    if (!id) return res.json({ event: null });

    const r = await fetch(`${TSD_BASE}/eventsnext.php?id=${id}`);
    const j = await r.json();
    const eventos = j?.events || [];
    if (!eventos.length) return res.json({ event: null });

    // 🔎 FILTRAR: só jogos válidos (excluir Europa e amistosos)
    const ev = eventos.find(e =>
      e.strLeague?.includes("Brasileirão") ||
      e.strLeague?.includes("Copa do Brasil") ||
      e.strLeague?.includes("Mineiro")
    ) || eventos[0]; // fallback para o primeiro

    if (!ev) return res.json({ event: null });

    const ts = ev.strTimestamp
      ? ev.strTimestamp.replace(" ", "T") + (ev.strTimestamp.endsWith("Z") ? "" : "Z")
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
