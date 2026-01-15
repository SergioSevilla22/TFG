import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const generateToken = (user) => {
  return jwt.sign(
    {
      DNI: user.DNI,
      Rol: user.Rol,
      club_id: user.club_id
    },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
};