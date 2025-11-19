import * as PusherPushNotifications from "@pusher/push-notifications-web";

/**
 * Interface for the Token Provider configuration.
 * This matches the expected headers/url pattern for your backend.
 */
interface AuthOptions {
    url: string;
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
}

class PushNotificationService {
    private beamsClient: PusherPushNotifications.Client | null = null;
    private deviceId: string | null = null;
    private instanceId: string;

    constructor(instanceId: string) {
        this.instanceId = instanceId;
    }

    /**
     * 1. Basic Initialization
     * Call this when your app loads to ensure the device is registered
     * for general (public) notifications.
     */
    public async initialize(): Promise<boolean> {
        try {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                console.warn("Push messaging is not supported in this browser.");
                return false;
            }

            //prevent from initializing multiple times
            if (this.beamsClient) return true;

            this.beamsClient = new PusherPushNotifications.Client({
                instanceId: this.instanceId,
            });

            await this.beamsClient.start();
            const id = await this.beamsClient.getDeviceId();
            
            this.deviceId = id;
            console.log("Beams initialized. Device ID:", id);

            return true;
        } catch (error) {
            console.error("Could not register with Beams:", error);
            return false;
        }
    }

    /**
     * 2. Authenticated User Login (NEW)
     * Call this after your user successfully logs into your React app.
     * * @param userId - The ID of the user in your database (e.g., "user-123")
     * @param authOptions - Configuration to reach your backend Beams auth endpoint
     */
    public async login(userId: string, authOptions: AuthOptions): Promise<boolean> {
        try {
            if (!this.beamsClient) {
                console.warn("Beams client not initialized. Call initialize() first.");
                await this.initialize();
            }

            if (!this.beamsClient) return false;

            //Configure the TokenProvider
            const tokenProvider = new PusherPushNotifications.TokenProvider({
                url: authOptions.url,
                headers: authOptions.headers || {},
                queryParams: authOptions.queryParams || {},
            });

            //Verify if we are already registered as this user to avoid redundant calls
            const currentUserId = await this.beamsClient.getUserId();
            if (currentUserId === userId) {
                console.log("Already registered as user:", userId);
                return true;
            }

            //Associate the device with the user
            await this.beamsClient.setUserId(userId, tokenProvider);
            console.log("Successfully registered authenticated user:", userId);
            return true;

        } catch (error) {
            console.error("Could not set authenticated user:", error);
            return false;
        }
    }

    /**
     * 3. Logout / Cleanup (NEW)
     * Call this when the user logs out of your React app.
     * It creates a clean slate so the next user doesn't get the previous user's notifs.
     */
    public async logout(): Promise<void> {
        if (!this.beamsClient) return;

        try {
            await this.beamsClient.clearAllState();
            console.log("Beams state cleared (User logged out)");
            
            // Optional: Re-initialize immediately if you want the device to still receive 
            // 'global' anonymous notifications after logout.
            // await this.initialize(); 
        } catch (error) {
            console.error("Error clearing Beams state:", error);
        }
    }

    // --- Existing Methods (Preserved) ---

    public async addInterest(interest: string): Promise<boolean> {
        if (!this.beamsClient) return false;
        try {
            await this.beamsClient.addDeviceInterest(interest);
            console.log("Interest added:", interest);
            return true;
        } catch (error) {
            console.error("Error adding interest:", error);
            return false;
        }
    }

    public async removeInterest(interest: string): Promise<boolean> {
        if (!this.beamsClient) return false;
        try {
            await this.beamsClient.removeDeviceInterest(interest);
            console.log("Interest removed:", interest);
            return true;
        } catch (error) {
            console.error("Error removing interest:", error);
            return false;
        }
    }

    public async getInterests(): Promise<string[]> {
        if (!this.beamsClient) return [];
        try {
            return await this.beamsClient.getDeviceInterests();
        } catch (error) {
            return [];
        }
    }
    //check if user has interest using the getInterests method
    public async hasInterest(interest: string): Promise<boolean> {
        const interests = await this.getInterests();
        return interests.includes(interest);
    }
}

export default new PushNotificationService(import.meta.env.VITE_PUSHER_BEAM_INSTANCE_ID);

// import * as PusherPushNotifications from "@pusher/push-notifications-web";

// class PushNotificationService {
//     private beamsClient: PusherPushNotifications.Client | null = null;
//     private deviceId: string | null = null;
//     private instanceId: string;

//     constructor(instanceId: string) {
//         this.instanceId = instanceId;
//     }

//     /**
//      * Initialize the Pusher Beams client and register the device
//      */
//     public async initialize(): Promise<boolean> {
//         try {
//             // 1. Check if the browser supports notifications
//             if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
//                 console.warn("Push messaging is not supported in this browser.");
//                 return false;
//             }

//             // 2. Initialize the Beams Client
//             this.beamsClient = new PusherPushNotifications.Client({
//                 instanceId: this.instanceId,
//             });

//             // 3. Start the client and register
//             await this.beamsClient.start();
//             const id = await this.beamsClient.getDeviceId();
//             console.log("Successfully registered with Beams. Device ID:", id);
//             this.deviceId = id;

//             // 4. Subscribe to a specific interest (e.g., 'global', 'promos', or a user-specific ID)
//             // This allows you to target this device later.
//             await this.beamsClient.addDeviceInterest('global');
            
//             const interests = await this.beamsClient.getDeviceInterests();
//             console.log("Current interests:", interests);
            
//             return true;
//         } catch (error) {
//             console.error("Could not register with Beams:", error);
//             return false;
//         }
//     }

//     /**
//      * Add an interest to the device
//      */
//     public async addInterest(interest: string): Promise<boolean> {
//         try {
//             if (!this.beamsClient) {
//                 console.warn("Beams client not initialized");
//                 return false;
//             }
            
//             await this.beamsClient.addDeviceInterest(interest);
//             return true;
//         } catch (error) {
//             console.error("Could not add interest:", error);
//             return false;
//         }
//     }

//     /**
//      * Remove an interest from the device
//      */
//     public async removeInterest(interest: string): Promise<boolean> {
//         try {
//             if (!this.beamsClient) {
//                 console.warn("Beams client not initialized");
//                 return false;
//             }
            
//             await this.beamsClient.removeDeviceInterest(interest);
//             return true;
//         } catch (error) {
//             console.error("Could not remove interest:", error);
//             return false;
//         }
//     }

//     /**
//      * Get current device interests
//      */
//     public async getInterests(): Promise<string[]> {
//         try {
//             if (!this.beamsClient) {
//                 console.warn("Beams client not initialized");
//                 return [];
//             }
            
//             return await this.beamsClient.getDeviceInterests();
//         } catch (error) {
//             console.error("Could not get interests:", error);
//             return [];
//         }
//     }

//     /**
//      * Get the device ID
//      */
//     public getDeviceId(): string | null {
//         return this.deviceId;
//     }

//     /**
//      * Stop the Beams client
//      */
//     public async stop(): Promise<void> {
//         if (this.beamsClient) {
//             await this.beamsClient.stop();
//             this.beamsClient = null;
//             this.deviceId = null;
//         }
//     }
// }

// export default new PushNotificationService('fb25d971-a572-423b-978d-de33b9e611f3');