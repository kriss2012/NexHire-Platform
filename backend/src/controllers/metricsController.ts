import { Request, Response } from 'express';
import { register } from '../utils/metrics';

export class MetricsController {
  public static async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      res.setHeader('Content-Type', register.contentType);
      const metrics = await register.metrics();
      res.status(200).send(metrics);
    } catch (error: any) {
      res.status(500).send(`Error generating metrics: ${error.message}`);
    }
  }
}
