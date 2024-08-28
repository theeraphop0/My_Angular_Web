import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';

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

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgIf,CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() news: NewsItem | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() statusChange = new EventEmitter<any>();

  closeModal() {
    this.close.emit();
  }

  updateStatus() {
    if (this.news) {
      this.news.Status = this.news.Status === 1 ? 0 : 1;
      this.statusChange.emit(this.news);
    }
  }
}