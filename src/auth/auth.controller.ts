
import { Controller, Post, Body, Req, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
// import { LocalAuthGuard } from './guards/local-auth.guard';
// import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  //@UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'] || '';
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  //@UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    const user = req.user;
    const token = req.headers.authorization?.split(' ')[1];
    return this.authService.logout(user.id, token);
  }

  //@UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    return req.user;
  }
}
