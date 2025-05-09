import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ControllersService } from './controllers.service';

export interface User {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'agent';
  name: string;
  branch?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  public users: User[] = [];

  constructor(
    private controllers: ControllersService
  ) {
        // Initialize with stored user data
        const storedUser = this.getStoredUser();
        this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
        this.currentUser = this.currentUserSubject.asObservable();
    
  }

  public get currentUserValue(): User | null {
    const user = this.currentUserSubject.value;
    return Array.isArray(user) ? user[0] : user;
}



login(username: string, password: string): Observable<any> {
  return new Observable(observer => {
    this.controllers.GetAgentById(username, password).subscribe({
      next: (data: any) => {
        if (data) {
          setTimeout(() => {
            // Ensure we store a single object
            const userData = Array.isArray(data) ? data[0] : data;
            this.currentUserSubject.next(userData);
            localStorage.setItem('currentUser', JSON.stringify(userData)); // Store single object
            observer.next(userData);
          }, 500)
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        observer.error(error);
      }
    });
  });
}

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  private getStoredUser(): User | null {
    try {
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) return null;
        
        // Parse the stored JSON string
        const parsedUser = JSON.parse(storedUser);
        
        // Handle array case
        const userData = Array.isArray(parsedUser) ? parsedUser[0] : parsedUser;
        
        // Validate user object
        if (userData && userData.username && userData.role) {
            return userData as User;
        }
        return null;
    } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
        return null;
    }
}

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin';
  }

  isAgent(): boolean {
    return this.currentUserValue?.role === 'agent';
  }

  getAllAgents() {
    this.controllers.GetAllAgents().subscribe({
      next: (response: any) => {
        if (response) {
          this.users = response;
        }
      },
      error: (error) => {
        console.error('Error fetching agents:', error);
      }
    });
  }

  addUser(agent:any): void {
    if (agent) {
      this.users.push(agent);
    }
  }

  updateUser(user: User): void {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index!== -1) {
      this.users[index] = user;
    }
  }

  deleteUser(email:string): void {
    const index = this.users.findIndex(user => user.username === email);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }







}