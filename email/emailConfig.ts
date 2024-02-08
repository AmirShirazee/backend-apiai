import getEnvVar from '../utils/getEnvVar';

export const host =
  getEnvVar('NODE_ENV') === 'production' ? getEnvVar('BASE_URL') : getEnvVar('LOCAL_HOST');
export const protocol = getEnvVar('NODE_ENV') === 'production' ? 'https' : 'http';
export const sendingEmail = getEnvVar('EMAIL_FROM');
