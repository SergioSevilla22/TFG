import axios from "axios";

const AI_URL = "http://127.0.0.1:8000/ai/player";

export const analyzePlayerAI = async (stats, training) => {
  try {
    const response = await axios.post(AI_URL, {
      stats,
      training,
    });

    return response.data;
  } catch (error) {
    console.error("Error llamando a la IA:", error.message);
    return null;
  }
};
