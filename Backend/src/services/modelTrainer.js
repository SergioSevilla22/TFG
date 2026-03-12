import cron from "node-cron";
import { exec } from "child_process";
import path from "path";

const trainModel = () => {
  const pythonPath = path.join(
    process.cwd(),
    "../ai-service/venv/Scripts/python.exe"
  );

  const scriptPath = path.join(
    process.cwd(),
    "../ai-service/ml/train_model.py"
  );

  exec(`"${pythonPath}" "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error("Error reentrenando modelo:", error);
      return;
    }

    if (stderr) {
      console.error("stderr:", stderr);
    }

    console.log("Modelo reentrenado automáticamente");
    console.log(stdout);
  });
};

export const startModelTrainingCron = () => {
  // ahora lo tienes cada minuto para probar
  cron.schedule(" 0 3 * * * *", () => {
    console.log("Ejecutando reentrenamiento del modelo...");

    trainModel();
  });
};
