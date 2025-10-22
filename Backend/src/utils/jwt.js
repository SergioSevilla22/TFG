import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta";

export const generateToken = (user) => {
  return jwt.sign(
    { DNI: user.DNI, email: user.email, rol: user.Rol },
    JWT_SECRET,
    { expiresIn: "2h" }
  );
};