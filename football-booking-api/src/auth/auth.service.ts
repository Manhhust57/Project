import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prismanpx/prismanpx.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
    ) { }

    async login(phone: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { phone } });
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) throw new UnauthorizedException('Invalid credentials');

        const payload = { sub: user.id, role: user.role };

        return {
            access_token: this.jwt.sign(payload),
        };
    }
}
