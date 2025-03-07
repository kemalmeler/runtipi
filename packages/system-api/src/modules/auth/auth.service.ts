import * as argon2 from 'argon2';
import validator from 'validator';
import { UsernamePasswordInput, UserResponse } from './auth.types';
import User from './user.entity';

const login = async (input: UsernamePasswordInput): Promise<UserResponse> => {
  const { password, username } = input;

  const user = await User.findOne({ where: { username: username.trim().toLowerCase() } });

  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await argon2.verify(user.password, password);

  if (!isPasswordValid) {
    throw new Error('Wrong password');
  }

  return { user };
};

const register = async (input: UsernamePasswordInput): Promise<UserResponse> => {
  const { password, username } = input;
  const email = username.trim().toLowerCase();

  if (!username || !password) {
    throw new Error('Missing email or password');
  }

  if (username.length < 3 || !validator.isEmail(email)) {
    throw new Error('Invalid username');
  }

  const user = await User.findOne({ where: { username: email } });

  if (user) {
    throw new Error('User already exists');
  }

  const hash = await argon2.hash(password);
  const newUser = await User.create({ username: email, password: hash }).save();

  return { user: newUser };
};

const me = async (userId?: number): Promise<User | null> => {
  if (!userId) return null;

  const user = await User.findOne({ where: { id: userId } });

  if (!user) return null;

  return user;
};

const AuthService = {
  login,
  register,
  me,
};

export default AuthService;
