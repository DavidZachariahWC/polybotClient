//we are not using prisma anymore. 
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type User = Prisma.UserGetPayload<{}>;

export type UserCreateInput = {
  email: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  user_id: string;
};

export const userService = {
  async createUser(data: UserCreateInput): Promise<User> {
    return await prisma.user.create({
      data: {
        email: data.email,
        user_id: data.user_id,
        first_name: data.first_name,
        last_name: data.last_name,
        profile_image_url: data.profile_image_url,
      },
    });
  },

  async updateUser(data: UserCreateInput): Promise<User> {
    return await prisma.user.update({
      where: { email: data.email },
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        profile_image_url: data.profile_image_url,
      },
    });
  },

  async getUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  async getUserById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  },
}; 