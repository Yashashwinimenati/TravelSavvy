import { Request, Response } from "express";
import { storage } from "../storage";
import { insertUserSchema } from "../../shared/schema";

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const validationResult = insertUserSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid input", 
        errors: validationResult.error.errors 
      });
    }
    
    const { username, email, password } = req.body;
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: "Username already taken" });
    }
    
    // Check if email already exists (if provided)
    if (email && await storage.getUserByEmail(email)) {
      return res.status(409).json({ message: "Email already registered" });
    }
    
    // Create user with MongoDB model
    const user = await storage.createUser({
      username,
      email,
      password,
      firstName: "",
      lastName: "",
      isAdmin: false
    });

    if (!user) {
      return res.status(500).json({ message: "Failed to create user" });
    }
    
    // Create session with MongoDB _id
    req.session.userId = user.id.toString();
    
    // Return user details (excluding password)
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };
    
    res.status(201).json(userResponse);
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Failed to register user" });
  }
};

// Login a user
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    // Find user by username
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) { // In a real app, password comparison would use a hash function
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Create session
    req.session.userId = user.id;
    
    // Return user details (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to authenticate user" });
  }
};

// Logout a user
export const logout = (req: Request, res: Response) => {
  try {
    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      
      res.clearCookie("connect.sid"); // Clear the session cookie
      res.status(200).json({ message: "Logged out successfully" });
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Failed to logout" });
  }
};

// Get current user
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(Number(userId));
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Return user details (excluding password)
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Failed to retrieve user information" });
  }
};
