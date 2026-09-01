export class ContentService {
  static saveDayContent(dayData) {
    localStorage.setItem(`content_${dayData.id}`, JSON.stringify(dayData));
    return true;
  }

  static getDayContent(dayId) {
    const data = localStorage.getItem(`content_${dayId}`);
    return data ? JSON.parse(data) : null;
  }

  static getAllContent() {
    const contents = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('content_')) {
        const data = JSON.parse(localStorage.getItem(key));
        contents.push(data);
      }
    }
    return contents;
  }
}