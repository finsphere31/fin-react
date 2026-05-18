import { Router } from 'express';
import authRoutes from './auth.js';
import healthRoutes from './health.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);

router.get('/', (req, res) => {
  res.json({ message: 'Fin React Backend API is running' });
});

export default router;
