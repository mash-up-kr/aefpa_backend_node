import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    this.logProcess(ctx, exception);

    response.status(status).json({
      data: null,
      error: {
        message: HttpStatus[status],
        description: exception.message ?? 'unknwon error',
      },
    });
  }

  //예외 로그
  private logProcess(ctx: HttpArgumentsHost, exception: any) {
    const req = ctx.getRequest<Request>();
    const requestMethodUrl = req.method + ' ' + req.url;
    const requestHeader = JSON.stringify(req.headers);
    const requestBody =
      req.body instanceof Array || req.body instanceof Object ? JSON.stringify(req.body) : req.body;
    const errMsg: any = {
      message: exception.message,
      errorType: exception.errorType ?? 'internal',
      requestMethodUrl,
      requestHeader,
      requestBody,
      errorResponse: exception.errorResponse,
    };

    Logger.error(errMsg, [exception.stack, ...(exception.errorStack ?? [])], '[Exception]');
  }
}
