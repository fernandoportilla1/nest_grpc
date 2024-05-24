import {
  AUTH_PACKAGE_NAME,
  CreateUserDto,
  PaginationDto,
  UpdateUserDto,
  User,
  USERS_SERVICE_NAME,
  UsersServiceClient,
} from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable()
export class UsersService implements OnModuleInit {
  private userService: UsersServiceClient;

  constructor(@Inject(AUTH_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.userService =
      this.client.getService<UsersServiceClient>(USERS_SERVICE_NAME);
  }

  create(createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  findAll() {
    return this.userService.findAllUsers({});
  }

  findOne(id: string): Observable<User> {
    return this.userService.findOneUser({ id });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userService.updateUser({ id, ...updateUserDto });
  }

  remove(id: string) {
    return this.userService.removeUser({ id });
  }

  emailUsers() {
    const users$ = new ReplaySubject<PaginationDto>();
    users$.next({ page: 0, skip: 10 });
    users$.next({ page: 1, skip: 10 });
    users$.next({ page: 2, skip: 10 });
    users$.next({ page: 3, skip: 10 });
    users$.next({ page: 4, skip: 10 });
    users$.next({ page: 5, skip: 10 });

    users$.complete();

    let chunknumber = 1;
    this.userService.queryUsers(users$).subscribe((users) => {
      console.log('Chunk', chunknumber, users);
      chunknumber++;
    });
  }
}
