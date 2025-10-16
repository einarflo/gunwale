import { Router, Request, Response } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { requireAuth, getUserId } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export const mediaRouter = Router();

const {
  S3_ENDPOINT = '',
  S3_REGION = 'us-east-1',
  S3_BUCKET = 'tavl-media',
  S3_ACCESS_KEY = '',
  S3_SECRET_KEY = '',
  S3_FORCE_PATH_STYLE = 'true',
} = process.env as any;

const s3 = new S3Client({
  region: S3_REGION,
  endpoint: S3_ENDPOINT || undefined,
  credentials: S3_ACCESS_KEY && S3_SECRET_KEY ? { accessKeyId: S3_ACCESS_KEY, secretAccessKey: S3_SECRET_KEY } : undefined,
  forcePathStyle: String(S3_FORCE_PATH_STYLE || 'true').toLowerCase() === 'true',
});

function extFromType(ct: string) {
  if (!ct) return 'bin';
  if (ct.includes('png')) return 'png';
  if (ct.includes('jpeg')) return 'jpg';
  if (ct.includes('webp')) return 'webp';
  if (ct.includes('gif')) return 'gif';
  return 'bin';
}

mediaRouter.post('/presign', requireAuth(), async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { kind, id, contentType } = req.body || {};
    if (!kind || !id || !contentType) return res.status(400).json({ error: 'Missing kind/id/contentType' });

    const ct = String(contentType);
    const ext = extFromType(ct);
    let key = '';

    if (kind === 'gameCover') {
      const selector = String(id);
      const game = isNaN(Number(selector))
        ? await prisma.game.findFirst({ where: { uuid: selector } })
        : await prisma.game.findUnique({ where: { id: Number(selector) } });
      if (!game) return res.status(404).json({ error: 'Game not found' });
      if (!game.created_by || game.created_by !== userId) return res.status(403).json({ error: 'Not owner' });
      key = `games/${game.uuid}/cover_v1.${ext}`;
    } else if (kind === 'questionImage') {
      const selector = String(id);
      const q = isNaN(Number(selector))
        ? await prisma.game_question.findFirst({ where: { uuid: selector } })
        : await prisma.game_question.findUnique({ where: { id: Number(selector) } });
      if (!q) return res.status(404).json({ error: 'Question not found' });
      const game = await prisma.game.findFirst({ where: { uuid: q.game_id } });
      if (!game) return res.status(404).json({ error: 'Game not found' });
      if (!game.created_by || game.created_by !== userId) return res.status(403).json({ error: 'Not owner' });
      const ts = Date.now();
      key = `questions/${q.uuid || q.id}/${ts}.${ext}`;
    } else {
      return res.status(400).json({ error: 'Unknown kind' });
    }

    const put = new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, ContentType: ct, ACL: undefined });
    const putUrl = await getSignedUrl(s3, put, { expiresIn: 300 });
    const base = S3_ENDPOINT || '';
    const publicUrl = base ? `${base.replace(/\/$/, '')}/${S3_BUCKET}/${key}` : `/${S3_BUCKET}/${key}`;
    res.json({ putUrl, key, publicUrl });
  } catch (e: any) {
    res.status(500).json({ error: 'presign_failed', message: e?.message || String(e) });
  }
});

