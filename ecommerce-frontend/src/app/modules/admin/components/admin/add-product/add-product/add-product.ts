import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PerfumeService } from '../../../../services/perfume';
import { ToastService } from '../../../../services/toast';
import { Perfume } from '../../../../models/perfume';

@Component({
  selector: 'app-add-perfume',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-perfume.html',
})
export class AddPerfumeComponent implements OnInit {
  perfumeForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  perfumeId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private perfumeService: PerfumeService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.perfumeForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      price: ['', [Validators.required, Validators.min(0)]],
      image: [''],
      fragrance: [''],
      stock: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['edit']) {
        this.isEditMode = true;
        this.perfumeId = params['edit'];
        this.loadPerfume();
      }
    });
  }

  loadPerfume(): void {
    if (this.perfumeId) {
      this.perfumeService.getPerfumeById(this.perfumeId).subscribe({
        next: (response) => {
          this.perfumeForm.patchValue(response.perfume);
        },
        error: (error) => {
          this.toastService.showError('Failed to load perfume');
          this.router.navigate(['/perfumes']);
        },
      });
    }
  }

  onSubmit(): void {
    if (this.perfumeForm.valid) {
      this.isLoading = true;
      const perfumeData = this.perfumeForm.value;

      if (this.isEditMode && this.perfumeId) {
        this.perfumeService
          .updatePerfume(this.perfumeId, perfumeData)
          .subscribe({
            next: (response) => {
              this.toastService.showSuccess('Perfume updated successfully!');
              this.router.navigate(['/perfumes']);
            },
            error: (error) => {
              this.toastService.showError(
                error.error?.message || 'Failed to update perfume'
              );
              this.isLoading = false;
            },
          });
      } else {
        this.perfumeService.addPerfume(perfumeData).subscribe({
          next: (response) => {
            this.toastService.showSuccess('Perfume added successfully!');
            this.perfumeForm.reset();
          },
          error: (error) => {
            this.toastService.showError(
              error.error?.message || 'Failed to add perfume'
            );
          },
          complete: () => {
            this.isLoading = false;
          },
        });
      }
    }
  }
}
