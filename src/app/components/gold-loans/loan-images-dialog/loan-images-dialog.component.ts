import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-loan-images-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Loan Images</h2>
        <button mat-icon-button (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Existing Images Grid -->
      <div class="grid grid-cols-3 gap-4 mb-6" *ngIf="data.images?.length">
        <div *ngFor="let image of data.images; let i = index" 
             class="relative cursor-pointer"
             (click)="selectedImageIndex = i">
          <img [src]="image.image_data" 
               class="w-full h-32 object-cover rounded"
               [class.border-4]="selectedImageIndex === i"
               [class.border-primary]="selectedImageIndex === i">
          <button *ngIf="!viewOnly" 
                  mat-icon-button 
                  class="absolute top-0 right-0 text-red-500"
                  (click)="removeExistingImage(i, $event)">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <!-- Selected Image Preview -->
      <div *ngIf="selectedImageIndex !== null && data.images?.length" class="mb-6">
        <img [src]="data.images[selectedImageIndex].image_data" 
             class="w-full max-h-96 object-contain rounded">
      </div>

      <!-- New Image Upload Section -->
      <div *ngIf="!viewOnly" class="mt-4">
        <input type="file" 
               multiple 
               accept="image/*" 
               (change)="onImageSelect($event)" 
               class="hidden" 
               #imageInput>

    

        <!-- New Images Preview -->
        <div class="grid grid-cols-3 gap-4 mt-4" *ngIf="newImages.length">
          <div *ngFor="let image of newImages; let i = index" class="relative">
            <img [src]="image.preview" 
                 class="w-full h-32 object-cover rounded">
            <button mat-icon-button 
                    class="absolute top-0 right-0 text-red-500"
                    (click)="removeNewImage(i)">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>

        <button mat-raised-button 
                color="primary" 
                class="w-full py-4 flex items-center justify-center gap-2"
                (click)="imageInput.click()">
          <mat-icon>add_photo_alternate</mat-icon>
          Add New Images
        </button>

        <div class="flex justify-end mt-4" *ngIf="newImages.length">
          <button mat-raised-button 
                  color="primary"
                  (click)="saveImages()">
            Save Images
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      width: 100%;
    }
  `]
})
export class LoanImagesDialogComponent {
  selectedImageIndex: number | null = null;
  newImages: Array<{
    file: File,
    preview: string,
    data: string,
    name: string,
    type: string,
    created_at: string
  }> = [];
  viewOnly: boolean;

  constructor(
    public dialogRef: MatDialogRef<LoanImagesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      images: Array<{
        id?: number,
        image_name: string,
        image_type: string,
        image_data: string,
        created_at: string
      }>,
      loanId: any,
      viewOnly?: boolean
    }
  ) {
    this.viewOnly = data.viewOnly || false;
  }

  onImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => {
            const base64Data = (reader.result as string).split(',')[1];
            
            this.newImages.push({
              file: file,
              preview: reader.result as string,
              data: base64Data,
              name: file.name,
              type: file.type,
              created_at: new Date().toISOString()
            });
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  removeNewImage(index: number) {
    this.newImages.splice(index, 1);
  }

  removeExistingImage(index: number, event: Event) {
    event.stopPropagation();
    this.data.images.splice(index, 1);
    if (this.selectedImageIndex === index) {
      this.selectedImageIndex = null;
    }
  }

  saveImages() {
    const imagePromises = this.newImages.map(async image => {
      const base64Data = await this.fileToBase64(image.file);
      return {
        image_name: image.file.name,
        image_type: image.file.type,
        created_at: new Date().toISOString().replace('T', ' ').split('.')[0],
        data: base64Data  // This will be replaced by the server with the correct URL
      };
    });

    Promise.all(imagePromises).then(processedImages => {
      this.dialogRef.close({
        loanId: Number(this.data.loanId),
        images: [...(this.data.images || []), ...processedImages]
      });
    });
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }
  


}