import * as signalR from '@microsoft/signalr';

const URL = import.meta.env.VITE_SIGNALR_URL;

class TaskSignalRService {
  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(URL)
      .withAutomaticReconnect()
      .build();
  }

  startConnection() {
    this.connection
      .start()
      .then(() => console.log('SignalR Connected'))
      .catch((err) => console.error('Error connecting to SignalR:', err));
  }

  // // onTaskCreated(callback) {
  // //   this.connection.on('TaskCreated', callback);
  // // }

  // onTaskUpdated(callback) {
  //   this.connection.on('TaskUpdated', callback);
  // }

  // onTasksLoaded(callback) {
  //   this.connection.on('TasksLoaded', callback);
  // }

  // createTask(newTask) {
  //   this.connection
  //     .send('CreateTask', newTask)
  //     .then(() => console.log('Task creation sent'))
  //     .catch((err) => console.error('Error sending task creation:', err));
  // }
}

const taskSignalRService = new TaskSignalRService();
export default taskSignalRService;
