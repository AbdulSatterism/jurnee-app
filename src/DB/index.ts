import chalk from 'chalk';
import { User } from '../app/modules/user/user.model';
import config from '../config';
import { USER_ROLES } from '../enums/user';
import { logger } from '../shared/logger';

const superUser: {
  name: string;
  role: 'ADMIN';
  email?: string;
  password?: string;
  phone: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  verified: boolean;
  gender: 'MALE' | 'FEMALE' | 'OTHERS';
} = {
  name: 'Jurnee',
  role: 'ADMIN',
  email: config.admin.email,
  password: config.admin.password,
  phone: '14524578',
  location: {
    type: 'Point',
    coordinates: [0, 0],
  },
  verified: true,
  gender: 'MALE',
};

const seedAdmin = async () => {
  try {
    const isExistSuperAdmin = await User.findOne({
      role: USER_ROLES.ADMIN,
    });

    if (!isExistSuperAdmin) {
      await User.create(superUser);
      logger.info(chalk.green('✔ Admin created successfully!'));
    } else {
      logger.info(chalk.green('✔ Admin already exists!'));
    }
  } catch (error) {
    logger.error(chalk.red(String(error)));
  }
};

export default seedAdmin;
