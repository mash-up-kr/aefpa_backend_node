import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

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
}
