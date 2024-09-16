import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  private filePath = path.join(__dirname, 'data', 'user.docs');
  constructor() {
    // Ensure the data directory exists
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  private readUsersFromFile(): User[] {
    try {
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (error) {
      console.error('Error reading users from file:', error);
    }
    return [];
  }

  private writeUsersToFile(users: User[]): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(users, null, 2));
      console.log(`Users written to file: ${this.filePath}`);
    } catch (error) {
      console.error('Error writing users to file:', error);
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const users = this.readUsersFromFile();
    const user: User = {
      id: uuidv4(), // or any other logic to generate a unique ID
      ...createUserDto,
    };

    users.push(user);
    this.writeUsersToFile(users);

    return user;
  }
  async findAll(): Promise<User[]> {
    return this.readUsersFromFile();
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    const users = this.readUsersFromFile();
    return users.find((user) => user.email === email);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User | undefined> {
    const users = this.readUsersFromFile();
    const userIndex = users.findIndex((user) => +user.id === id);

    if (userIndex === -1) {
      return undefined;
    }

    const updatedUser = { ...users[userIndex], ...updateUserDto };
    users[userIndex] = updatedUser;
    this.writeUsersToFile(users);

    return updatedUser;
  }

  async remove(id: number): Promise<boolean> {
    const users = this.readUsersFromFile();
    const userIndex = users.findIndex((user) => +user.id === id);

    if (userIndex === -1) {
      return false;
    }

    users.splice(userIndex, 1);
    this.writeUsersToFile(users);

    return true;
  }
}
