
export const PLAN_LIMITS = {
    free: {
        imagesPerWeek: 1,
        imageSizeMB: 5,
        videosPerWeek: 1,
        videoSizeMB: 50,
        watermark: true,
        explore: false,
        profileBoost: false,
        verified: false
    },
    pro: {
        imagesPerWeek: 5,
        imageSizeMB: 10,
        videosPerWeek: 3,
        videoSizeMB: 150,
        watermark: false,
        explore: true,
        profileBoost: false,
        verified: false
    },
    elite: {
        imagesPerWeek: 999999, // Unlimited
        imageSizeMB: 20,
        videosPerWeek: 999999,
        videoSizeMB: 300,
        watermark: false,
        explore: true,
        profileBoost: true,
        verified: true
    },
    creator: {
        imagesPerWeek: 999999,
        imageSizeMB: 50,
        videosPerWeek: 999999,
        videoSizeMB: 500,
        watermark: false,
        explore: true,
        profileBoost: true,
        verified: true
    }
};

export const GLOBAL_RULES = {
    maxVideoDurationSeconds: 300, // 5 min
    allowedVideoFormats: ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm', 'video/x-msvideo', 'video/avi'], // Common mimetypes
    minAge: 18
};
