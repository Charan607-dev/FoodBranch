import { Router, Response } from 'express';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/notifications
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT id, user_id, role, title, message, donation_id, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user!.id]
    );

    const items = result.rows.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      role: r.role,
      title: r.title,
      message: r.message,
      donationId: r.donation_id,
      isRead: Boolean(r.is_read),
      createdAt: r.created_at,
    }));

    const unreadCount = items.filter((n: any) => !n.isRead).length;

    res.json({
      notifications: items,
      unreadCount,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/:id/read
router.post('/:id/read', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await query(
      `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
      [id, req.user!.id]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/read-all
router.post('/read-all', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await query(
      `UPDATE notifications SET is_read = TRUE WHERE user_id = $1`,
      [req.user!.id]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
