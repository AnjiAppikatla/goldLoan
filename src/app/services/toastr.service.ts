import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private config = {
    timeOut: 3000,
    positionClass: 'toast-top-center',
    closeButton: true,
    progressBar: true,
    preventDuplicates: true
  };

  constructor(private toastr: ToastrService) {}

  success(message: string, title: string = 'Success') {
    return this.toastr.success(message, title, this.config);
  }

  warning(message: string, title: string = 'Warning') {
    return this.toastr.warning(message, title, this.config);
  }

  error(message: string, title: string = 'Error') {
    return this.toastr.error(message, title, this.config);
  }

  info(message: string, title: string = 'Info') {
    return this.toastr.info(message, title, this.config);
  }
}