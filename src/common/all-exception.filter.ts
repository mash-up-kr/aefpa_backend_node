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
        description: this.getExceptionMessage(exception) ?? 'unknwon error',
      },
    });
  }

  private getExceptionMessage(exception: Error): string {
    let message = exception.message;
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object') {
        message = Array.isArray(response['message']) ? response['message'][0] : response['message'];
      } else {
        message = response;
      }
    }
    return message;
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

    Logger.error(JSON.stringify(req));
    Logger.error(errMsg, [exception.stack, ...(exception.errorStack ?? [])], '[Exception]');
  }
}
