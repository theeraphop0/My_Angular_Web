import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

interface NewsItem {
  NewsId: number;
  NameNews: string;
  Detail: string;
  Status: number;
  UpdatedDate: Date;
  ButtonView: number;
  ButtonEdit: number;
  ButtonDelete: number;
}

interface ApiResponse {
  successful: boolean;
  data: Array<Omit<NewsItem, 'UpdatedDate'> & { UpdatedDate: string }>;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent implements OnInit {
  allNews: NewsItem[] = [];
  displayedNews: NewsItem[] = [];
  isModalOpen = false;
  selectedNews: NewsItem | null = null;
  currentPage = 1;
  itemsPerPage = 7;

  constructor(private http: HttpClient) { }

  getAllNews() {
    this.http.get<ApiResponse>('https://ba-sit.uapi.app/uapi/drt-ElectronicsDocument/ED-GetNews')
      .subscribe((response: ApiResponse) => {
        if (response.successful) {
          this.allNews = response.data.map(item => ({
            ...item,
            UpdatedDate: new Date(item.UpdatedDate)
          }));
          this.updateDisplayedNews();
        } else {
          console.error('API Error: Failed to fetch news');
        }
      });
  }

  updateNewsStatus(news: NewsItem) {
    const updateData = {
      EmployeeId: 3,
      NewsId: news.NewsId,
      Status: news.Status
    };

    this.http.post<ApiResponse>('https://ba-sit.uapi.app/uapi/drt-ElectronicsDocument/ED-UpdateStatusNews', updateData)
      .pipe(
        tap((response: ApiResponse) => {
          if (response.successful) {
            console.log('Status updated successfully');
            // อัพเดตข้อมูลใน allNews array
            const index = this.allNews.findIndex(item => item.NewsId === news.NewsId);
            if (index !== -1) {
              this.allNews[index].Status = news.Status;
            }
            this.updateDisplayedNews();
          } else {
            console.error('Failed to update status');
            // Revert the change if update failed
            news.Status = news.Status === 1 ? 0 : 1;
          }
        }),
        catchError(this.handleError.bind(this))
      )
      .subscribe();
  }

  handleStatusChange(updatedNews: NewsItem) {
    this.updateNewsStatus(updatedNews);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  updateDisplayedNews() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.displayedNews = this.allNews.slice(startIndex, startIndex + this.itemsPerPage);
  }

  openModal(news: NewsItem) {
    this.selectedNews = news;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedNews = null;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedNews();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedNews();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.allNews.length / this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedNews();
    }
  }

  goToFirstPage() {
    this.goToPage(1);
  }

  goToLastPage() {
    this.goToPage(this.totalPages);
  }

  getPageRange(): number[] {
    const range = 5;
    const start = Math.max(1, this.currentPage - range);
    const end = Math.min(this.totalPages, this.currentPage + range);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  ngOnInit(): void {
    this.getAllNews();
  }
}