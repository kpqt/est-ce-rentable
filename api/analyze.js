export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { idea, location, budget } = req.body || {};

    if (!idea) {
      return res.status(400).json({ error: "Décris ton projet." });
    }

    const prompt = `
Tu es l'analyste du site "Est-ce rentable ?".

Projet :
${idea}

Zone géographique :
${location || "non précisée"}

Budget disponible :
${budget || "non précisé"}

Analyse cette idée d'investissement.

IMPORTANT :
- Recherche des informations actuelles sur Internet avant de donner des prix.
- Ne jamais inventer un prix d'achat ou un tarif de location.
- Compare plusieurs sources lorsque c'est possible.
- Si une donnée est incertaine, indique-le clairement.
- Utilise des hypothèses prudentes et réalistes.
- Vérifie que les calculs sont cohérents.

Je veux obtenir :

1. Un verdict : RENTABLE / À ÉTUDIER / PEU RENTABLE / INCERTAIN
2. Un résumé simple.
3. Les prix d'achat réalistes actuellement.
4. Les tarifs de location réalistes.
5. Une estimation prudente du nombre de locations par an.
6. Le chiffre d'affaires annuel estimé.
7. Les principaux coûts.
8. Le bénéfice annuel estimé.
9. Le ROI.
10. Le délai d'amortissement.
11. Le prix maximum auquel il serait intéressant d'acheter.
12. Les principaux risques.
13. Si possible, 2 ou 3 alternatives plus intéressantes.

Présente les résultats clairement en français.
`;

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-5-mini",
          tools: [
            {
              type: "web_search"
            }
          ],
          input: prompt
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Erreur OpenAI"
      });
    }

    return res.status(200).json({
      text: data.output_text || "Aucun résultat."
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Erreur serveur"
    });
  }
}
