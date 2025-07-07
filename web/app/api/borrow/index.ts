import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db'; 
import { v4 as uuidv4 } from 'uuid';


export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { itemId, userId, quantity } = req.body;

  if (!itemId || !userId || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  const item = db.getItem(itemId);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  if (item.quantity < quantity) {
    return res.status(400).json({ error: 'Not enough items available' });
  }

  db.updateItemQuantity(itemId, item.quantity - quantity);
  db.addBorrowRecord({
    id: uuidv4(),
    itemId,
    userId,
    quantity,
    borrowedAt: new Date(),
  });

  return res.status(200).json({ message: 'Item borrowed successfully' });
}
