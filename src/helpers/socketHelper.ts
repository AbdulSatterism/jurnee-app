/* eslint-disable no-console */
import { Server } from 'socket.io';
import { Message } from '../app/modules/message/message.model';
import { logger } from '../shared/logger';
import AppError from '../app/errors/AppError';
import { StatusCodes } from 'http-status-codes';
import chalk from 'chalk';

const socket = (io: Server) => {
  io.on('connection', socket => {
    logger.info(chalk.blue('A user connected'));

    // Join a chat room
    socket.on('join', chat => {
      socket.join(chat);
      logger.info(chalk.green(`User joined chat: ${chat}`));
    });

    socket.on(
      'send-message',
      async (payload: {
        chat: string;
        sender: string;
        message?: string;
        type?: string;
        offer?: string;
      }) => {
        try {
          const { chat, sender, message, type, offer } = payload;

          if (!chat || !sender) throw new Error('chat and sender are required');

          // Create message in DB
          const newMessage = await Message.create({
            chat,
            sender,
            message,
            type,
            offer,
          });

          const populatedMessage = await Message.findById(
            newMessage._id,
          ).populate('sender', 'name image _id');

          // Join chat room and emit
          socket.join(chat);
          io.emit(`receive-message:${chat}`, populatedMessage);
          socket.emit('receive-message', populatedMessage);
        } catch (error) {
          logger.error('Error in send-message:', error);
          socket.emit(
            'error',
            new AppError(StatusCodes.BAD_REQUEST, (error as Error).message),
          );
        }
      },
    );

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(chalk.red('A user disconnect'));
    });
  });
};

export default socket;

export const socketHelper = { socket };
