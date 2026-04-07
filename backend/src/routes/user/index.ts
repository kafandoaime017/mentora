// routes/userRoutes.ts
import { Router } from 'express';
import { authMiddleware } from '../../app/middleware/auth';
import { getProfile, updateProfile, uploadAvatar } from '../../app/controllers/userController';
import { upload } from '../../app/middleware/upload';

const router = Router();

router.get('/me', authMiddleware, getProfile);
router.put('/me', authMiddleware, updateProfile);
router.post('/me/avatar', authMiddleware, upload.single('avatar'), uploadAvatar);

export default router;