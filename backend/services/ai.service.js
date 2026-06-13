const { openai, MODELS } = require('../config/openai');
const logger = require('../utils/logger');
const { ApiError } = require('../utils/response.utils');

/**
 * Génère un embedding vectoriel à partir d'un texte
 * @param {string} text - Texte d'entrée
 * @returns {Promise<number[]>} Vecteur 1536 dimensions
 */
const generateEmbedding = async (text) => {
  try {
    // Nettoyer et tronquer le texte pour éviter les limites de tokens
    const cleanText = text.replace(/\n/g, ' ').substring(0, 8000);
    
    const response = await openai.embeddings.create({
      model: MODELS.embedding,
      input: cleanText,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    logger.error('Erreur génération embedding OpenAI:', error);
    throw ApiError.internal('Erreur du service IA (Embedding)');
  }
};

/**
 * Analyse le texte brut d'un CV et retourne un objet JSON structuré
 * @param {string} cvText - Texte extrait du CV
 * @returns {Promise<Object>} JSON structuré du CV
 */
const analyzeCV = async (cvText) => {
  try {
    const prompt = `
Tu es un expert mondial en recrutement et ATS (Applicant Tracking System).
Ta mission est d'analyser le texte brut suivant, issu d'une extraction PDF (qui peut parfois contenir des mots collés ou mal formatés), et de reconstituer les informations de manière structurée et propre dans un format JSON valide.
Ne renvoie STRICTEMENT que du JSON, sans formatage Markdown ni texte introductif.

Le JSON doit respecter scrupuleusement cette structure :
{
  "extractedData": {
    "fullName": "Nom complet corrigé",
    "email": "...",
    "phone": "...",
    "location": "...",
    "summary": "Résumé professionnel de 2-3 phrases généré si manquant, ou extrait du CV",
    "totalExperienceYears": 5, // Estimation du nombre total d'années d'expérience
    "seniorityLevel": "junior | mid | senior | lead | executive",
    "coreRoles": ["Titre principal 1", "Titre principal 2"],
    "skills": {
      "technical": ["technologie 1", "framework 2"],
      "soft": ["compétence 1", "compétence 2"],
      "tools": ["outil 1"],
      "all": ["toutes les skills confondues en minuscules pour l'indexation"]
    },
    "experience": [
      {
        "title": "...",
        "company": "...",
        "startDate": "MM/YYYY",
        "endDate": "MM/YYYY ou Present",
        "description": "Description propre et formatée",
        "skills": ["Compétences clés utilisées pour cette expérience"]
      }
    ],
    "education": [
      {
        "degree": "...",
        "institution": "...",
        "field": "...",
        "graduationYear": 2020
      }
    ],
    "languages": [{"name": "...", "level": "basic|intermediate|fluent|native"}]
  },
  "scores": {
    "overall": 85,
    "ats": 80,
    "breakdown": {
      "technical": 85,
      "softSkills": 80,
      "formatting": 90,
      "keywords": 85,
      "experience": 80,
      "education": 90
    }
  },
  "strengths": ["Point fort 1", "Point fort 2"],
  "weaknesses": ["Point faible 1", "Point faible 2"],
  "suggestions": ["Action claire pour améliorer le score ATS 1", "Action claire 2"]
}

Fais très attention à bien corriger les mots qui auraient été collés par l'extraction PDF (ex: "DéveloppeurReact" -> "Développeur React").

Texte brut du CV :
"""
${cvText.substring(0, 15000)}
"""
`;

    const response = await openai.chat.completions.create({
      model: MODELS.chat,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1, // Basse température pour plus de précision et déterminisme
      response_format: { type: 'json_object' }, // Force le format JSON (GPT-4o)
    });

    const content = response.choices[0].message.content;
    const parsedData = JSON.parse(content);

    return {
      parsedData,
      usage: response.usage,
      modelUsed: response.model
    };
  } catch (error) {
    logger.error('Erreur analyse CV OpenAI:', error);
    throw ApiError.internal('Erreur du service IA (Analyse CV)');
  }
};

/**
 * Calcule le score de matching (cosine similarity) entre deux vecteurs
 * @param {number[]} vec1 
 * @param {number[]} vec2 
 * @returns {number} Score de 0 à 100
 */
const calculateCosineSimilarity = (vec1, vec2) => {
  if (!vec1 || !vec2 || vec1.length !== vec2.length) return 0;
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  
  if (norm1 === 0 || norm2 === 0) return 0;
  
  const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  return Math.round(((similarity + 1) / 2) * 100); // Normalise de -1/1 à 0/100
};

/**
 * Confronte le JSON d'un CV analysé avec le JSON d'une offre d'emploi
 * @param {Object} cvJson - Données extraites du CV (AIAnalysis)
 * @param {Object} jobJson - Données de l'offre d'emploi (Job)
 * @returns {Promise<Object>} JSON des scores de matching
 */
const matchCandidateToJob = async (cvJson, jobJson) => {
  try {
    const prompt = `
Tu es un recruteur expert doté d'une IA d'évaluation ultra-précise.
Ta mission est d'évaluer le "Fit" (compatibilité) entre un candidat (d'après son CV structuré) et une offre d'emploi.
Ne renvoie STRICTEMENT que du JSON, sans formatage Markdown ni texte introductif.

Analyse les deux objets JSON fournis (Candidat et Offre).
Calcule les scores de compatibilité sur 100 et rédige une analyse de ce profil pour cette offre précise.

Le JSON doit respecter scrupuleusement cette structure :
{
  "overallPercentage": 85,
  "skillsCompatibility": 90,
  "experienceCompatibility": 80,
  "educationCompatibility": 85,
  "strengths": ["Raison 1 pour laquelle il est un bon fit", "Raison 2"],
  "weaknesses": ["Lacune 1 vis-à-vis du poste", "Lacune 2"],
  "recommendations": ["Question à poser en entretien 1", "Point à vérifier 2"]
}

--- DONNÉES DU CANDIDAT ---
${JSON.stringify(cvJson, null, 2)}

--- DONNÉES DE L'OFFRE D'EMPLOI ---
${JSON.stringify(jobJson, null, 2)}
`;

    const response = await openai.chat.completions.create({
      model: MODELS.chat,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1, // Basse température pour objectivité
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    const matchData = JSON.parse(content);

    return {
      matchData,
      usage: response.usage,
      modelUsed: response.model
    };
  } catch (error) {
    logger.error('Erreur moteur de matching OpenAI:', error);
    throw ApiError.internal('Erreur du service IA (Moteur de matching)');
  }
};

/**
 * Génère une lettre de motivation personnalisée
 * @param {Object} cvJson - Données extraites du CV (AIAnalysis)
 * @param {string} jobContext - Description de l'offre (texte brut ou URL)
 * @param {string} tone - Ton de la lettre (Professionnel, Moderne, Créatif)
 * @returns {Promise<string>} Le contenu de la lettre de motivation
 */
const generateCoverLetter = async (cvJson, jobContext, tone) => {
  try {
    const toneInstructions = {
      'Professionnel': 'un ton très formel, classique, structuré en paragraphes classiques.',
      'Moderne': 'un ton direct, percutant, orienté résultats avec des phrases courtes et accrocheuses.',
      'Créatif': 'un ton original, orienté storytelling, qui capte l\'attention dès la première ligne.'
    };

    const prompt = `
Tu es un expert en rédaction de lettres de motivation.
Ta mission est d'écrire une lettre de motivation exceptionnelle, prête à l'emploi.

Contraintes :
- Ne renvoie STRICTEMENT QUE LE TEXTE de la lettre. Pas de blabla, pas de "Voici la lettre :".
- Utilise ${toneInstructions[tone] || toneInstructions['Professionnel']}
- Mets en évidence le lien entre les compétences du candidat et les besoins de l'offre.
- Structure avec : Objet, Formule d'appel (Madame, Monsieur,), Introduction, Développement (Pourquoi l'entreprise, Pourquoi moi, Pourquoi nous), Conclusion, et Formule de politesse.
- Limite à 300-400 mots maximum.

--- DONNÉES DU CANDIDAT ---
Nom: ${cvJson.fullName || 'Candidat'}
Résumé: ${cvJson.summary || ''}
Expériences clés: ${JSON.stringify(cvJson.experience?.slice(0, 3) || [])}
Compétences: ${JSON.stringify(cvJson.skills?.all || [])}

--- CONTEXTE DE L'OFFRE D'EMPLOI ---
${jobContext}
`;

    const response = await openai.chat.completions.create({
      model: MODELS.chat,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7, // Plus de créativité autorisée ici
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    logger.error('Erreur génération Lettre de motivation OpenAI:', error);
    throw ApiError.internal('Erreur du service IA (Génération de lettre)');
  }
};

/**
 * Gère une conversation en streaming avec le Coach IA
 * @param {Array} messageHistory - Historique des messages [{role: 'user'|'assistant', content: '...'}]
 * @param {string} systemContext - Contexte optionnel (résumé du CV, offre)
 * @param {Function} onChunk - Callback(chunk) appelé à chaque nouveau mot
 */
const streamCoachConversation = async (messageHistory, systemContext, onChunk) => {
  try {
    const systemPrompt = `Tu es Nova Coach, un expert mondial en conseil carrière, recrutement et ressources humaines.
Ton but est d'aider le candidat de manière chaleureuse, précise et très professionnelle.
Tu donnes des conseils concrets sur le CV, les entretiens, LinkedIn, et la recherche d'emploi.
Ne fais pas de réponses trop longues, sois concis et interactif.
${systemContext ? 'Voici le contexte du candidat :\n' + systemContext : ''}
`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...messageHistory
    ];

    const stream = await openai.chat.completions.create({
      model: MODELS.chat,
      messages: messages,
      temperature: 0.7,
      stream: true,
    });

    let fullContent = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullContent += content;
        if (onChunk) onChunk(content);
      }
    }

    return fullContent;
  } catch (error) {
    logger.error('Erreur streaming IA Coach:', error);
    throw ApiError.internal('Erreur du service IA (Coach en direct)');
  }
};

module.exports = {
  generateEmbedding,
  analyzeCV,
  calculateCosineSimilarity,
  matchCandidateToJob,
  generateCoverLetter,
  streamCoachConversation,
};
