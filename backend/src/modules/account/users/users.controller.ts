import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ErrorResponse } from '../../../common/interfaces/errorResponse.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/user.decorator';

@ApiTags('users')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created successfully', type: User })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request', type: ErrorResponse })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error', type: ErrorResponse })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, description: 'Ok', type: User, isArray: true })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request', type: ErrorResponse })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error', type: ErrorResponse })
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @Get('me')
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns current authenticated user', type: User })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error', type: ErrorResponse })
  async getCurrentUser(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, description: 'User found', type: User })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found', type: ErrorResponse })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request', type: ErrorResponse })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error', type: ErrorResponse })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, description: 'User updated successfully', type: User })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found', type: ErrorResponse })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request', type: ErrorResponse })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error', type: ErrorResponse })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'User deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found', type: ErrorResponse })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request', type: ErrorResponse })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error', type: ErrorResponse })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.usersService.remove(id);
  }
}
