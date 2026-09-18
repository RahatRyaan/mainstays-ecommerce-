import morgan from 'morgan';
import logger from '../common/logger';

// Use Morgan to output logs to Winston
export const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message: string) => {
        // Strip trailing newline added by morgan
        logger.info(message.trim());
      },
    },
  }
);
