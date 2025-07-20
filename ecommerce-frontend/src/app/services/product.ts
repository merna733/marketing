import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Perfume, PerfumeRequest } from '../models/perfume';

@Injectable({
  providedIn: 'root',
})
export class PerfumeService {
  private apiUrl = 'http://localhost:3000/perfumes';

  constructor(private http: HttpClient) {}

  getAllPerfumes(): Observable<{ message: string; perfumes: Perfume[] }> {
    return this.http.get<{ message: string; perfumes: Perfume[] }>(this.apiUrl);
  }

  getPerfumeById(
    id: string
  ): Observable<{ message: string; perfume: Perfume }> {
    return this.http.get<{ message: string; perfume: Perfume }>(
      `${this.apiUrl}/${id}`
    );
  }

  addPerfume(
    perfume: PerfumeRequest
  ): Observable<{ message: string; perfume: Perfume }> {
    return this.http.post<{ message: string; perfume: Perfume }>(
      this.apiUrl,
      perfume
    );
  }

  updatePerfume(
    id: string,
    perfume: Partial<PerfumeRequest>
  ): Observable<{ message: string; perfume: Perfume }> {
    return this.http.put<{ message: string; perfume: Perfume }>(
      `${this.apiUrl}/${id}`,
      perfume
    );
  }

  deletePerfume(id: string): Observable<{ message: string; perfume: Perfume }> {
    return this.http.delete<{ message: string; perfume: Perfume }>(
      `${this.apiUrl}/${id}`
    );
  }
}
