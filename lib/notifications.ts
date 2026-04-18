import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

interface CreateNotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  metadata,
}: CreateNotificationOptions) {
  return await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      metadata: metadata ?? undefined,
    },
  });
}

export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT === '') {
    console.log(`[FCM MOCK] Token: ${fcmToken.substring(0, 20)}... | Title: ${title}`);
    return;
  }

  try {
    // Dynamically import firebase-admin only when credentials are available
    const admin = await import("firebase-admin");
    if (!admin.default.apps.length) {
      admin.default.initializeApp({
        credential: admin.default.credential.cert(
          JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        ),
      });
    }

    await admin.default.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data: data ?? {},
    });
  } catch (err) {
    console.error("[FCM Error]", err);
  }
}

export async function notifyUser(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  metadata?: Record<string, unknown>
) {
  const notification = await createNotification({
    userId,
    type,
    title,
    message,
    metadata,
  });

  // Send push notification if user has FCM token
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fcmToken: true },
  });

  if (user?.fcmToken) {
    await sendPushNotification(user.fcmToken, title, message, {
      type,
      notificationId: notification.id,
    });
  }

  return notification;
}

export async function triggerRealtime(channel: string, event: string, data: unknown) {
  if (
    !process.env.PUSHER_APP_ID ||
    process.env.PUSHER_APP_ID === "placeholder"
  ) {
    console.log(`[PUSHER MOCK] Channel: ${channel} | Event: ${event}`);
    return;
  }

  try {
    const Pusher = (await import("pusher")).default;
    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true,
    });
    await pusher.trigger(channel, event, data);
  } catch (err) {
    console.error("[Pusher Error]", err);
  }
}
