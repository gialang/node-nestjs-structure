import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response } from 'express';
import * as uuid from 'uuid';

import { Logger } from '../providers';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly passUrl: string[] = ['/health', '/graphql'];
  // GraphQL logging uses the apollo plugins.
  // https://docs.nestjs.com/graphql/plugins
  // https://www.apollographql.com/docs/apollo-server/integrations/plugins/
  // https://github.com/nestjs/graphql/issues/923

  constructor(private logger: Logger) {}

  public use(req: Request, res: Response, next: () => void): void {
    if (this.passUrl.includes(req.originalUrl)) {
      return next();
    }

    req.id = req.header('X-Request-Id') || uuid.v4();
    res.setHeader('X-Request-Id', req.id);

    const user = req.user?.id || '';
    this.logger.log(`${req.method} ${req.originalUrl} - ${req.ip.replace('::ffff:', '')} ${user}`);

    return next();
  }
}
