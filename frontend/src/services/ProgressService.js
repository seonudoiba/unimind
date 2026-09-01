export class ProgressService {
  static async markComplete(dayId) {
    localStorage.setItem(`progress_${dayId}`, JSON.stringify({ 
      completed: true, 
      timestamp: new Date().toISOString() 
    }));
    return true;
  }

  static async isComplete(dayId) {
    const data = localStorage.getItem(`progress_${dayId}`);
    return data ? JSON.parse(data).completed : false;
  }
}