import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "8h" } 
  );
};

export const authenticateToken = async (req, res, next) => {
  let token;

  const authHeader = req.headers['authorization'];
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) return res.status(401).json({ error: "Token missing" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Token verify error:", err.message);
    return res.status(403).json({ error: "Invalid token" });
  }
};

export const requireRole = (roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "User not authenticated" });
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });
  next();
};
