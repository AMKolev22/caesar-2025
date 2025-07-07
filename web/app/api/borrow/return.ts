import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db'; 

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { borrowId } = req.body;

  if (!borrowId) {
    return res.status(400).json({ error: 'Missing borrowID' });
  }

  db.returnItem(borrowId);

  return res.status(200).json({ message: 'Item returned successfully' });
}
