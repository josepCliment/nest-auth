import { HttpException, Injectable, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/entities/users/user.service';
import { LoginUserDTO } from './dto/loginUser.dto';
import * as bcrypt from 'bcrypt';
import { UserDTO } from './dto/user.dto';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Login function
   * @param userData
   * @returns
   */
  async login(userData: LoginUserDTO): Promise<{ access_token: string }> {
    console.log({userData});
    
    console.log('Searching the user...');

    let user = await this.userService.findByEmail(userData.email);

    if (!user) {
      throw new HttpException('Invalid crendentials.', 401);
    }
    //check password
    const isValidPassword = await bcrypt.compare(
      userData.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new HttpException('Invalid crendentials.', 401);
    }

    console.log('Generating JWT token..');
    
    //Generate JST Token
    console.log({user});
    const payload = { sub: user.id, nickname: user.nickname };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_KEY,
      }),
    };
  }

  /**
   *
   * @param registerUserDTO - The User structure
   * @returns
   */
  async registerAccount(registerUserDTO: UserDTO): Promise<boolean> {
    const userCreated = await this.userService.create(
      registerUserDTO.email,
      registerUserDTO.password,
      registerUserDTO.nickname,
    );
    if (!userCreated) {
      throw new HttpException('User already exists', 400);
    }
    return true;
  }
}