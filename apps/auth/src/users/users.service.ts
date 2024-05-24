import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  UsersResponse,
  PaginationDto,
} from '@app/common';
import { randomUUID } from 'crypto';
import { Observable, Subject } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly users: User[] = [];

  onModuleInit() {
    for (let i = 1; i < 50; i++) {
      this.create({ username: randomUUID(), password: randomUUID() });
    }
  }

  create(createUserDto: CreateUserDto): User {
    const user: User = {
      ...createUserDto,
      isActive: true,
      socialMedia: {},
      id: randomUUID(),
    };
    this.users.push(user);
    return user;
  }

  findAll(): UsersResponse {
    return { users: this.users };
  }

  findOne(id: string): User | null {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new RpcException({
        code: 500,
        message: `User not found by id ${id}`,
      });
    }
    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto): User {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex !== -1) {
      this.users[userIndex] = {
        ...this.users[userIndex],
        ...updateUserDto,
      };
      return this.users[userIndex];
    }
    throw new NotFoundException(`User not found by id ${id}`);
  }

  remove(id: string) {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex !== -1) {
      return this.users.splice[userIndex][0];
    }
    throw new NotFoundException(`User not found by id ${id}`);
  }

  queryUsers(
    paginationDtoStream: Observable<PaginationDto>,
  ): Observable<UsersResponse> {
    const subject = new Subject<UsersResponse>();

    const onNext = (paginationDto: PaginationDto) => {
      const start = paginationDto.page * paginationDto.skip;
      subject.next({
        users: this.users.slice(start, start + paginationDto.skip),
      });
    };
    const onComplete = () => subject.complete();

    paginationDtoStream.subscribe({
      next: onNext,
      complete: onComplete,
    });

    return subject.asObservable();
  }
}
