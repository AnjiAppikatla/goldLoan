import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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
  private currentUserSubject: BehaviorSubject<User | null>;
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

  constructor() {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): boolean {
    const user = this.users.find(u => u.username === username && u.password === password);
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      return true;
    }
    
    return false;
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  private getStoredUser(): User | null {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
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