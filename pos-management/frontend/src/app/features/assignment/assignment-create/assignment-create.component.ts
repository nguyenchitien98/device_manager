import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, SelectOption
} from '@shared';

@Component({
  selector: 'app-assignment-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent, PosBadgeComponent
  ],
  templateUrl: './assignment-create.component.html',
  styleUrl: './assignment-create.component.scss'
})
export class AssignmentCreatePageComponent {
  private readonly router = inject(Router);

  readonly saving = signal(false);

  formModel = {
    actionType: 'ASSIGN',
    merchantCode: 'MID_88880001',
    tid: 'TID_8801',
    posSerial: 'PAX-A920-998824',
    reasonNote: ''
  };

  readonly actionTypeOptions: SelectOption[] = [
    { label: 'Cấp phát máy POS mới cho Merchant (Assign)', value: 'ASSIGN' },
    { label: 'Thu hồi máy POS từ Merchant (Reclaim)', value: 'RECLAIM' },
    { label: 'Đổi máy POS hỏng / Bảo trì (Replace)', value: 'REPLACE' }
  ];

  onSubmit(): void {
    this.saving.set(true);
    setTimeout(() => {
      this.saving.set(false);
      this.router.navigate(['/assignment/list']);
    }, 500);
  }

  goBack(): void {
    this.router.navigate(['/assignment/list']);
  }
}
