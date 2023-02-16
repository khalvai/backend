import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { SubjectService } from '../subject/subject.service';
import { UploadedFileDto } from './Dto/upload.file.Dto';
import { FileRepository } from './file.repository';
import { File } from '../../common/interfaces/file.interface';
import { S3ManagerService } from '../s3-manager/s3-manager.service';
import { File as FileModel } from '@prisma/client';
import * as mime from 'mime-types';
import { retry } from 'rxjs';
import { Kendra } from 'aws-sdk';
// import { Success } from '../auth/types/success.return.type';

@Injectable()
export class FileService {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly subjectService: SubjectService,
    private readonly s3: S3ManagerService,
  ) {}
  async saveFile(
    subjectId: number,
    file: File,
    uploadFileDto: UploadedFileDto,
  ) {
    const subject = await this.subjectService.findById(subjectId);
    if (!subject) throw new BadRequestException('subject id not valid!');

    await this.checkFileType(file.mimetype);

    const saveToStorage = await this.s3.uploadFile('jozveh', file);

    await this.fileRepository.saveFile(
      subjectId,
      saveToStorage.key,
      uploadFileDto,
    );

    return { success: true };
  }

  async deleteFile(id: number) {
    const file = await this.fileRepository.findById(id);

    if (!file)
      throw new BadRequestException('there is no file with this name.');

    await this.fileRepository.delete(id);
    await this.s3.deleteFile('jozveh', file.fileName);

    return { sucess: true };
  }

  async findUnverifieds(): Promise<FileModel[]> {
    const files = await this.fileRepository.findUnverifieds();
    return files;
  }

  async accept(id: number): Promise<FileModel> {
    const file = await this.fileRepository.findById(id);

    if (!file) throw new HttpException('not found file', HttpStatus.NOT_FOUND);

    return await this.fileRepository.accept(id);
  }

  async checkFileType(mimeType: string): Promise<boolean> {
    const allowedFileExtensions = ['pdf', 'doc', 'docx', 'word', 'pptx',"txt"];
    const fileExt = `${mime.extension(mimeType)}`;

    if (allowedFileExtensions.includes(fileExt)) {
      return true;
    } else {
      throw new BadRequestException('File type not valid!');
    }
  }
}
