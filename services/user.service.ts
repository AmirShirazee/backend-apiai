import { Schema } from 'mongoose';
import dayjs from 'dayjs';
import { User, UserDocument } from '../models/user.model';

export const getUser = (user: UserDocument) => user.sanitizeUser();

export const createUser = ({
  username,
  email,
  password,
}: {
  username: string;
  email: string;
  password: string;
}) =>
  new User({
    username,
    email,
    password,
    passwordResetAttempts: {
      // Initialize this object if you want it to be part of the new document
      timestamps: [],
      count: 0,
      lastEvaluated: new Date(0),
    },
  });

export const setResetPasswordToken = (
  user: UserDocument,
  resetTokenValue: string,
  expiryDate: Date,
) => {
  user.passwordResetToken = resetTokenValue;
  user.passwordResetExpires = expiryDate;
};

export const findUserBy = async (prop: string, value: string) =>
  await User.findOne({ [prop]: value });

export const findUserById = async (id: typeof Schema.Types.ObjectId) => await User.findById(id);

export const saveUser = async (user: UserDocument) => await user.save();

export const setUserPassword = async (user: UserDocument, password: string) => {
  user.password = password;
  user.passwordResetToken = '';
  user.passwordResetExpires = dayjs().toDate();
  return await user.hashPassword();
};

export const setUserVerified = async (user: UserDocument) => {
  user.isVerified = true;
};

export const deleteUserById = async (user: UserDocument) => await User.findByIdAndDelete(user._id);

export const deleteUnverifiedUserByEmail = async (email: string) =>
  await User.findOneAndDelete({ email, isVerified: false });

export default {
  getUser,
  createUser,
  setResetPasswordToken,
  findUserBy,
  findUserById,
  saveUser,
  setUserPassword,
  setUserVerified,
  deleteUserById,
  deleteUnverifiedUserByEmail,
};
