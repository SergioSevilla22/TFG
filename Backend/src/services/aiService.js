import axios from "axios";

const AI_URL = "http://127.0.0.1:8000/ai/player";
const AI_ATTENDANCE_URL = "http://127.0.0.1:8000/ai/attendance";
const AI_CLUSTERING_URL = "http://127.0.0.1:8000/ai/clustering";

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

export const analyzeAttendanceAI = async (stats) => {
  const response = await axios.post(AI_ATTENDANCE_URL, {
    stats,
  });

  return response.data;
};

export const analyzeClusteringAI = async (dni, stats, training) => {
  try {
    const response = await axios.post(`${AI_CLUSTERING_URL}/${dni}`, {
      stats,
      training,
    });
    return response.data;
  } catch (error) {
    console.error("Error llamando a la IA de Clustering:", error.message);
    return null;
  }
};
