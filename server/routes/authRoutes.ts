import { Router, Response } from 'express';
import { authService } from '../services/authService';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Register Customer
router.post('/register/customer', (req, res) => {
  try {
    const { name, email, phone, password, organization } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Name, email, and phone are required.' } });
    }
    const result = authService.registerCustomer({ name, email, phone, password, organization });
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: { code: 'REGISTRATION_FAILED', message: err.message } });
  }
});

// Register Freelancer
router.post('/register/freelancer', (req, res) => {
  try {
    const { name, email, phone, password, tradeCategory, bio, location, dailyRate, skills, languages } = req.body;
    if (!name || !phone || !tradeCategory || !location) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Name, phone, trade category, and location are required.' } });
    }
    const result = authService.registerFreelancer({
      name,
      email: email || `${phone.replace(/\D/g, '')}@shramik.internal`,
      phone,
      password,
      tradeCategory,
      bio,
      location,
      dailyRate: Number(dailyRate) || 800,
      skills,
      languages
    });
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: { code: 'REGISTRATION_FAILED', message: err.message } });
  }
});

// Login (Email, Mobile, or Freelancer ID)
router.post('/login', (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Identifier (phone/email/ID) is required.' } });
    }
    const result = authService.login(identifier, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: { code: 'LOGIN_FAILED', message: err.message } });
  }
});

// Get Current Authenticated User (Session Rehydration)
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = authService.getUserById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User record no longer exists.' } });
    }
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// Get All Users (for demo account switching)
router.get('/users', (_req, res) => {
  try {
    const users = authService.getAllUsers();
    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
