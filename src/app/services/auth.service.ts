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

  public users: User[] = [
    {
      id: 1,
      username: 'admin@goldloan.com',
      password: 'admin123',
      role: 'admin',
      name: 'Admin User',
      branch: 'VZG001'
    },
    {
      id: 2,
      username: 'agent@goldloan.com',
      password: 'agent123',
      role: 'agent',
      name: 'Manikanta',
      branch: 'VZG001'
    },
    {
      id: 3,
      username: 'agent2goldloan.com',
      password: 'agent1234',
      role: 'agent',
      name: 'Revathi',
      branch: 'VZG002'
    }
  ];

  constructor(
    private controllers: ControllersService
  ) {
        // Initialize with stored user data
        const storedUser = this.getStoredUser();
        this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
        this.currentUser = this.currentUserSubject.asObservable();
    
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }



  login(username: string, password: string): Observable<any> {
    return new Observable(observer => {
      this.controllers.GetAgentById(username, password).subscribe({
        next: (data: any) => {
          if (data && data.username && data.role) {
            // Create a proper User object
            const user: User = {
              id: data.id,
              username: data.username,
              password: data.password,
              role: data.role,
              name: data.name,
              branch: data.branch
            };

            // Store in localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));

            // Update BehaviorSubject
            this.currentUserSubject.next(user);

            // Log successful login
            console.log('Login successful:', user);
            console.log('Current user subject:', this.currentUserSubject.value);

            observer.next(user);
            observer.complete();
          } else {
            console.error('Invalid user data:', data);
            observer.error('Invalid user data received');
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
      
      const user = JSON.parse(storedUser);
      // Validate user object
      if (user && user.username && user.role) {
        return user as User;
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

  getAllAgents(): User[] {
    return this.users.filter(user => user.role === 'agent');
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