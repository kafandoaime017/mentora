import { Request, Response } from 'express'

export const generateQuestions = async (req: Request, res: Response) => {
    try {
        const { titre, theme, description, nombreQuestions = 5 } = req.body

        const nbQcm         = Math.ceil(nombreQuestions * 0.4)
        const nbQcmMultiple = Math.ceil(nombreQuestions * 0.4)
        const nbVraiFaux    = Math.max(1, nombreQuestions - nbQcm - nbQcmMultiple)

        const prompt = `Tu es un professeur expert. Génère exactement ${nombreQuestions} questions pour une évaluation.
Titre: ${titre}
Thème: ${theme || 'Non précisé'}
Description: ${description || 'Non précisée'}

IMPORTANT: Tu dois OBLIGATOIREMENT varier les types. Répartis ainsi:
- ${nbQcm} questions de type "qcm" (exactement 1 bonne réponse parmi 4 options)
- ${nbQcmMultiple} questions de type "qcm_multiple" (2 ou 3 bonnes réponses parmi 4 options)
- ${nbVraiFaux} questions de type "vrai_faux" (options: ["Vrai", "Faux"])

Réponds UNIQUEMENT avec un JSON valide, sans markdown, sans backticks, ce format exact:
{
  "questions": [
    {
      "texte": "Question ici ?",
      "type": "qcm",
      "points": 2,
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "reponses_correctes": [0],
      "explication": "Courte explication"
    },
    {
      "texte": "Question avec plusieurs bonnes réponses ?",
      "type": "qcm_multiple",
      "points": 3,
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "reponses_correctes": [0, 2],
      "explication": "Courte explication"
    },
    {
      "texte": "Affirmation vraie ou fausse ?",
      "type": "vrai_faux",
      "points": 1,
      "options": ["Vrai", "Faux"],
      "reponses_correctes": [0],
      "explication": "Courte explication"
    }
  ]
}

Règles strictes:
- reponses_correctes contient les INDEX (commence à 0) des bonnes réponses
- Pour "qcm": exactement 1 index dans reponses_correctes
- Pour "qcm_multiple": 2 ou 3 index dans reponses_correctes
- Pour "vrai_faux": options DOIT être ["Vrai", "Faux"] et reponses_correctes = [0] ou [1]
- Points: 1 pour vrai_faux, 2-3 pour qcm, 3-5 pour qcm_multiple
- Toutes les questions en français
- NE PAS mettre de markdown ou backticks dans la réponse`

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 2000
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('OpenRouter error:', errorText)
            return res.status(500).json({
                success: false,
                message: 'Erreur OpenRouter',
                details: errorText
            })
        }

        const data = await response.json()
        const content = data.choices?.[0]?.message?.content

        if (!content) {
            res.status(500).json({ success: false, message: 'Réponse IA vide' })
            return
        }

        // Nettoyer le contenu au cas où l'IA met quand même des backticks
        const cleaned = content
            .trim()
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim()

        let parsed
        try {
            parsed = JSON.parse(cleaned)
        } catch (parseErr) {
            console.error('Erreur parsing JSON IA:', parseErr, '\nContenu:', cleaned)
            res.status(500).json({
                success: false,
                message: 'Réponse IA invalide — impossible de parser le JSON',
                raw: cleaned
            })
            return
        }

        // Normaliser les reponses_correctes en nombres
        if (parsed.questions) {
            parsed.questions = parsed.questions.map((q: any) => ({
                ...q,
                reponses_correctes: (q.reponses_correctes || []).map(Number)
            }))
        }

        res.json({ success: true, data: parsed })
    } catch (err) {
        console.error('Erreur AI:', err)
        res.status(500).json({ success: false, message: 'Erreur lors de la génération' })
    }
}