export class Notification {
  content: string;
  notificationToken: string;
  notificationInfo: NotificationInfo;
}

export class NotificationInfo {
  txHash: string;
  image: string;
  contentType: string;
  type: string;
}
