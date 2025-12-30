import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@database/prisma.service';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    const { email, username, password, fullName } = registerDto;

    // Check if admin already exists
    const existingAdmin = await this.prismaService.admin.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingAdmin) {
      throw new BadRequestException('Email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await this.prismaService.admin.create({
      data: {
        email,
        username,
        password: hashedPassword,
        fullName,
        role: 'viewer', // Default role
        isActive: true,
      },
    });

    const { password: _, ...adminWithoutPassword } = admin;
    return {
      accessToken: this.generateToken(admin),
      admin: adminWithoutPassword,
    };
  }

  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;

    const admin = await this.prismaService.admin.findUnique({
      where: { email },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid credentials or account is inactive');
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...adminWithoutPassword } = admin;
    return {
      accessToken: this.generateToken(admin),
      admin: adminWithoutPassword,
    };
  }

  async validateAdmin(email: string, password: string): Promise<any> {
    const admin = await this.prismaService.admin.findUnique({
      where: { email },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  }

  async getProfile(adminId: string): Promise<any> {
    const admin = await this.prismaService.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Admin not found or inactive');
    }

    return admin;
  }

  private generateToken(admin: any): string {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '7d';
    const expiresInValue: string | number = isNaN(Number(expiresIn))
      ? expiresIn
      : parseInt(expiresIn);

    return this.jwtService.sign(
      {
        sub: admin.id,
        email: admin.email,
        role: admin.role,
      } as any,
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: expiresInValue,
      } as any,
    );
  }
}
