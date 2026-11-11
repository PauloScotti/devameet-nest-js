import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { RegisterDto, UpdateUserDto } from './dtos/register.dto';
import { hashPassword } from 'src/auth/password.util';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async create(dto: RegisterDto): Promise<User> {
        const createdUser = new this.userModel({
            name: dto.name,
            email: dto.email,
            avatar: dto.avatar,
            password: await hashPassword(dto.password),
        });
        return createdUser.save();
    }

    async existsByEmail(email: string): Promise<boolean> {
        return (await this.userModel.exists({ email })) !== null;
    }

    // Único ponto que devolve a senha armazenada: uso exclusivo do login.
    async getUserByEmail(email: string): Promise<UserDocument | null> {
        return await this.userModel.findOne({ email });
    }

    async setPassword(id: string, password: string) {
        await this.userModel.updateOne({ _id: id }, { password: await hashPassword(password) });
    }

    async getUserById(id: string) {
        return await this.userModel.findById(id);
    }

    async updateuser(id: string, dto: UpdateUserDto) {
        return await this.userModel.findByIdAndUpdate(id, { name: dto.name, avatar: dto.avatar });
    }
}
