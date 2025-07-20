import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PerfumeService } from '../../../services/perfume';
import { CartService } from '../../../services/cart';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { Perfume } from '../../../models/perfume';


@Component({
  selector: 'app-perfumes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './perfumes.html',
})
export class PerfumesComponent implements OnInit {
  perfumes: Perfume[] = [];
  filteredPerfumes: Perfume[] = [];
  categories: string[] = [];
  selectedPerfume: Perfume | null = null;
  filterForm: FormGroup;
  isLoggedIn = false;
  isAdmin = false;

  constructor(
    private perfumeService: PerfumeService,
    private cartService: CartService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      fragrance: [''],
      maxPrice: [''],
      availability: [''],
    });
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
    this.loadPerfumes();

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadPerfumes(): void {
    this.perfumeService.getAllPerfumes().subscribe({
      next: (response) => {
        this.perfumes = response.perfumes;
        this.filteredPerfumes = [...this.perfumes];
        this.extractCategories();
      },
      error: (error) => {
        this.toastService.showError('Failed to load perfumes');
      },
    });
  }

  extractCategories(): void {
    const cats = this.perfumes
      .map((p) => p.fragrance)
      .filter((cat, index, self) => cat && self.indexOf(cat) === index);
    this.categories = cats as string[];
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    this.filteredPerfumes = this.perfumes.filter((perfume) => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (
          !perfume.name.toLowerCase().includes(searchTerm) &&
          !perfume.description?.toLowerCase().includes(searchTerm)
        ) {
          return false;
        }
      }

      if (filters.fragrance && perfume.fragrance !== filters.fragrance) {
        return false;
      }

      if (filters.maxPrice && perfume.price > filters.maxPrice) {
        return false;
      }

      if (filters.availability === 'inStock' && perfume.stock === 0) {
        return false;
      }
      if (filters.availability === 'outOfStock' && perfume.stock > 0) {
        return false;
      }

      return true;
    });
  }

  addToCart(perfume: Perfume): void {
    if (!this.isLoggedIn) {
      this.toastService.showWarning('Please login to add items to cart');
      return;
    }

    if (perfume.stock === 0) {
      this.toastService.showWarning('This perfume is out of stock');
      return;
    }

    this.cartService
      .addToCart({ perfume: perfume._id, quantity: 1 })
      .subscribe({
        next: () => {
          this.toastService.showSuccess(`${perfume.name} added to cart!`);
        },
        error: (error) => {
          this.toastService.showError('Failed to add perfume to cart');
        },
      });
  }

  showPerfumeDetails(perfume: Perfume): void {
    this.selectedPerfume = perfume;
    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('perfumeModal')
    );
    modal.show();
  }

  editPerfume(perfume: Perfume): void {
    this.router.navigate(['/add-perfume'], {
      queryParams: { edit: perfume._id },
    });
  }

  deletePerfume(perfume: Perfume): void {
    this.selectedPerfume = perfume;
    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('deleteModal')
    );
    modal.show();
  }

  confirmDelete(): void {
    if (this.selectedPerfume) {
      this.perfumeService.deletePerfume(this.selectedPerfume._id).subscribe({
        next: () => {
          this.toastService.showSuccess('Perfume deleted successfully');
          this.loadPerfumes();
          const modal = (window as any).bootstrap.Modal.getInstance(
            document.getElementById('deleteModal')
          );
          modal.hide();
        },
        error: (error) => {
          this.toastService.showError('Failed to delete perfume');
        },
      });
    }
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
    event.target.nextElementSibling.style.display = 'flex';
  }
}
