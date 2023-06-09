import { Module } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { SubjectController } from './subject.controller';
import { SubjectRepository } from './subject.repository';
import { ProfessorService } from '../professor/professor.service';
import { ProfessorRepository } from '../professor/professor.repository';
import { ProfessorModule } from '../professor/professor.module';

@Module({
  controllers: [SubjectController],
  imports: [ProfessorModule],
  providers: [
    SubjectRepository,
    ProfessorService,
    ProfessorRepository,
    SubjectService,
  ],
  exports: [SubjectRepository, SubjectService],
})
export class SubjectModule {}
