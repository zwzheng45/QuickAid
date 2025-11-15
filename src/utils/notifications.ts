export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const scheduleVisitFeedbackNotification = (
  visitId: string,
  hospitalName: string,
  delayMinutes: number
) => {
  if (Notification.permission !== 'granted') {
    console.log('Notification permission not granted');
    return;
  }

  const delayMs = delayMinutes * 60 * 1000;
  
  setTimeout(() => {
    const notification = new Notification('How was your visit?', {
      body: `Please share your feedback about your visit to ${hospitalName}`,
      icon: '/favicon.ico',
      tag: `visit-${visitId}`,
      requireInteraction: true,
      data: { visitId }
    });

    notification.onclick = () => {
      window.focus();
      window.location.href = `/feedback/${visitId}`;
      notification.close();
    };
  }, delayMs);
};
