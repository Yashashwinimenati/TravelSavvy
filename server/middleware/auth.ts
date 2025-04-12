import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

// Middleware to check if user is authenticated
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await storage.getUser(userId);

    if (!user) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying invalid session:", err);
        }
      });
      return res.status(401).json({ message: "Invalid session" });
    }

    // Add user to request for use in controllers
    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
};

// Middleware to check if user is an admin
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await storage.getUser(Number(userId));

    if (!user) {
      return res.status(401).json({ message: "Invalid session" });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    // Add user to request for use in controllers
    req.user = user;

    next();
  } catch (error) {
    console.error("Admin authentication error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
};

// Add user data to request if logged in (doesn't require auth)
export const populateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.userId;

    if (userId) {
      const user = await storage.getUser(Number(userId));
      if (user) {
        // Add user to request for use in controllers
        req.user = user;
      }
    }

    next();
  } catch (error) {
    console.error("User population error:", error);
    next(); // Continue even if there's an error
  }
};

// Declare session properties
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

// Extend the Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}